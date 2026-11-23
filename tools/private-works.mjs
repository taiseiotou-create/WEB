// ============================
// 非公開作品の暗号化・復号ツール
//   公開リポジトリでも中身を読まれないよう、非公開作品のデータを
//   パスワードで暗号化（AES-GCM：銀行などでも使われる標準的な暗号方式）して
//   private-works.js に書き出します。
//
//   使い方:
//     暗号化: PORTFOLIO_ID=xxx PORTFOLIO_PASSWORD=yyy node tools/private-works.mjs encrypt
//       → private/works.json（コミットしない元データ）を読み、private-works.js を作る
//     復号:   PORTFOLIO_ID=xxx PORTFOLIO_PASSWORD=yyy node tools/private-works.mjs decrypt
//       → private-works.js を読み、編集用の private/works.json を作り直す
//
//   ※ ID・パスワードはファイルに書かず、環境変数で渡す（コミット事故を防ぐため）
// ============================
import { readFileSync, writeFileSync, mkdirSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const SRC = join(root, "private", "works.json");
const OUT = join(root, "private-works.js");
const ITER = 310000; // 鍵を作るときの計算回数。多いほど総当たりに強い（ブラウザ側も同じ値を使う）

const { subtle } = globalThis.crypto;
const enc = new TextEncoder();
const b64 = (buf) => Buffer.from(buf).toString("base64");
const unb64 = (s) => new Uint8Array(Buffer.from(s, "base64"));

async function deriveKey(id, password, salt, iter) {
  const base = await subtle.importKey("raw", enc.encode(`${id}\n${password}`), "PBKDF2", false, ["deriveKey"]);
  return subtle.deriveKey({ name: "PBKDF2", hash: "SHA-256", salt, iterations: iter },
    base, { name: "AES-GCM", length: 256 }, false, ["encrypt", "decrypt"]);
}

const id = process.env.PORTFOLIO_ID;
const password = process.env.PORTFOLIO_PASSWORD;
const mode = process.argv[2];
if (!id || !password || !["encrypt", "decrypt"].includes(mode)) {
  console.error("使い方: PORTFOLIO_ID=… PORTFOLIO_PASSWORD=… node tools/private-works.mjs encrypt|decrypt");
  process.exit(1);
}

if (mode === "encrypt") {
  const json = JSON.stringify(JSON.parse(readFileSync(SRC, "utf8"))); // 書式チェックを兼ねる
  const salt = crypto.getRandomValues(new Uint8Array(16));
  const iv = crypto.getRandomValues(new Uint8Array(12));
  const key = await deriveKey(id, password, salt, ITER);
  const data = await subtle.encrypt({ name: "AES-GCM", iv }, key, enc.encode(json));
  const payload = { v: 1, iter: ITER, salt: b64(salt), iv: b64(iv), data: b64(data) };
  writeFileSync(OUT, `// 自動生成ファイル（tools/private-works.mjs）。中身は暗号化済みの非公開作品データです。\nwindow.PRIVATE_WORKS = ${JSON.stringify(payload)};\n`);
  console.log(`暗号化しました → ${OUT}`);
} else {
  const text = readFileSync(OUT, "utf8");
  const p = JSON.parse(text.slice(text.indexOf("{"), text.lastIndexOf("}") + 1));
  const key = await deriveKey(id, password, unb64(p.salt), p.iter);
  let plain;
  try { plain = await subtle.decrypt({ name: "AES-GCM", iv: unb64(p.iv) }, key, unb64(p.data)); }
  catch { console.error("IDかパスワードが違います"); process.exit(1); }
  mkdirSync(dirname(SRC), { recursive: true });
  writeFileSync(SRC, JSON.stringify(JSON.parse(new TextDecoder().decode(plain)), null, 2) + "\n");
  console.log(`復号しました → ${SRC}`);
}
