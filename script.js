// ============================
// 作品データ：ここを書き換えれば作品一覧が変わる
//   ※ ここは誰でも見られる「公開」作品だけ。会社での実績は private/works.json に書いて
//     tools/private-works.mjs で暗号化する（README は CLAUDE.md を参照）
//   url:   作品サイトのURL。あれば詳細画面に「サイトを見る」リンクが出る
//   image: 画像ファイルのパス（例: "images/work1.jpg"）。空なら仮のグラフィックを表示
//   wide:  true にすると横長の大きいカードになる
// ============================
const works = [
  { title: "HSVCJ関連サイト「HSと暮らす」", category: "web", label: "Web", year: "2026", wide: true,
    url: "",  // ← 公開URLが決まったらここに入れる（例: "https://example.com/"）
    desc: "「ひとりから、つながりへ」をテーマにしたWebページ。ひとりで抱えていた人が、声に出すことで波紋のようにつながり、「今日はどう？」「わかるよ」「話してくれて、ありがとう」という言葉に背中を押されて一歩ずつ進んでいく様子を、やわらかなイラストとアニメーションで描きました。オープニング映像版も制作しています。",
    role: "企画、構成、コピー、イラストの演出、アニメーション、実装（AIと協働）",
    point: "重くなりがちなテーマを、丸みのある書体とやさしい色、ゆっくりした動きで、そっと寄り添うトーンに",
    palette: ["#7fbfe6", "#fdf6f9", "#f3a6c0"] },
  { title: "てんぷれや 関連サイト", category: "web", label: "Web", year: "2026",
    url: "",  // ← 公開URLが決まったらここに入れる
    desc: "「てんぷれや」のWebサイト制作。（詳しい内容は準備中です）",
    role: "企画、デザイン、実装",
    point: "（準備中）",
    palette: ["#c9a227", "#f4f1ea", "#1b1a17"] },
  { title: "アヒルのキャラクター展開", category: "branding", label: "Branding", year: "2026",
    desc: "アヒルのキャラクターを使った、映画ポスター風の壁紙などの展開を自主制作。キャラクターごとの役割が絵から伝わるよう、世界観・配色・構図を方向づけました。",
    role: "キャラクター設定、世界観・配色・構図の方向づけ",
    point: "元の配色を守りながら、スマホ・PCなど媒体別の案を検討",
    palette: ["#1f3a6b", "#f2c14e", "#f4f1ea"] },
  { title: "このポートフォリオサイト", category: "web", label: "Web", year: "2026", wide: true,
    desc: "いま見ているこのサイト。縦書きの見出しと「つ・た・わ・る」の大きな文字で、言葉とデザインを両方つくる仕事のスタンスを表現しました。キャッチコピーは読むペースで1文字ずつ現れ、文字にマウスを乗せると弾むように動きます。会社での実績は、パスワードで暗号化してログインした人だけが読める仕組みにしています。",
    role: "企画、コピー、デザイン、実装（HTML・CSS・JavaScript。AIと協働）",
    point: "動きで印象を残しつつ「動きを止める」ボタンや読み上げ対応など、誰でも見やすい作りに",
    palette: ["#1b1a17", "#fafafa", "#e2482d"] },
  { title: "グラフィック個展", category: "personal", label: "Personal", year: "学生時代",
    desc: "人工臓器のような形を抽象化したグラフィックを制作し、個展で展示。来場者の反応から、デザインで発信することの責任を意識するきっかけになりました。",
    role: "作品制作、個展の開催",
    point: "形の抽象化と、見る人に委ねる表現",
    palette: ["#c43d3d", "#efe6d2", "#1b1a17"] },
];

// 画像がない作品のための仮グラフィック（作品ごとに違う図形を自動生成）
function placeholderArt(work, i) {
  const [a, b, c] = work.palette;
  const shapes = [
    `<circle cx="200" cy="230" r="120" fill="${a}"/><rect x="60" y="330" width="280" height="40" fill="${c}"/>`,
    `<rect x="70" y="70" width="260" height="360" fill="${a}"/><circle cx="270" cy="160" r="60" fill="${c}"/>`,
    `<path d="M40 420 L200 80 L360 420 Z" fill="${a}"/><circle cx="200" cy="300" r="50" fill="${c}"/>`,
    `<rect x="40" y="200" width="320" height="100" fill="${a}"/><rect x="150" y="60" width="100" height="380" fill="${c}" opacity=".85"/>`,
    `<circle cx="150" cy="200" r="100" fill="${a}"/><circle cx="250" cy="300" r="100" fill="${c}" opacity=".8"/>`,
    `<path d="M40 400 Q200 40 360 400" stroke="${a}" stroke-width="44" fill="none"/><circle cx="200" cy="140" r="34" fill="${c}"/>`,
  ];
  return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${esc(work.title)} のイメージ">
    <rect width="400" height="500" fill="${b}"/>${shapes[i % shapes.length]}</svg>`;
}

function artFor(work, i) {
  return work.image
    ? `<img src="${esc(work.image)}" alt="${esc(work.title)}" loading="lazy">`
    : placeholderArt(work, i);
}

// 作品カードを並べる（公開作品と、ログイン後の非公開作品で共通）
const cardsHTML = (list, offset = 0, extra = "") => list.map((w, i) => `
  <li class="${w.wide ? "wide" : ""} rv ${extra}" data-category="${w.category}">
    <button class="card" data-index="${i + offset}" aria-haspopup="dialog">
      <div class="card-art" aria-hidden="true">${artFor(w, i + offset)}</div>
      <div class="card-meta">
        <span class="card-title">${esc(w.title)}</span>
        <span class="card-cat">( ${esc(w.year)} — ${esc(w.label)} )</span>
      </div>
      <span class="card-more" aria-hidden="true">詳しく見る ( → )</span>
    </button>
  </li>`).join("");
function esc(t) {   // 文字をそのまま表示する（HTMLとして解釈させない）
  return String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}
let shownWorks = works;   // 詳細ダイアログで参照する作品の一覧（ログイン後は非公開作品も足す）
const grid = document.getElementById("grid");
grid.innerHTML = cardsHTML(works);

// カテゴリで絞り込み
document.querySelectorAll(".filter").forEach((btn) => {
  btn.addEventListener("click", () => {
    const f = btn.dataset.filter;
    document.querySelectorAll(".filter").forEach((b) => {
      const on = b === btn;
      b.classList.toggle("is-active", on);
      b.setAttribute("aria-pressed", on);
    });
    let shown = 0;
    grid.querySelectorAll("li").forEach((li) => {
      li.hidden = f !== "all" && li.dataset.category !== f;
      if (!li.hidden) { shown++; li.classList.add("is-in"); }
    });
    // 画面読み上げソフト向けに表示件数を伝える
    document.getElementById("count").textContent = `${shown}件の作品を表示中`;
  });
});

// 作品をクリックすると詳細を表示
const modal = document.getElementById("modal");
function openWork(i) {
  const w = shownWorks[i];
  if (!w) return;
  document.getElementById("modal-art").innerHTML = artFor(w, i);
  document.getElementById("modal-cat").textContent = `( ${w.year} — ${w.company ? w.company + " — " : ""}${w.label} )`;
  document.getElementById("modal-role").textContent = w.role;
  document.getElementById("modal-point").textContent = w.point;
  document.getElementById("modal-title").textContent = w.title;
  document.getElementById("modal-desc").textContent = w.desc;
  const link = document.getElementById("modal-link");
  link.hidden = !w.url;
  if (w.url) link.href = w.url;
  modal.showModal();
}
document.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (card) openWork(Number(card.dataset.index));
});
document.getElementById("modal-close").addEventListener("click", () => modal.close());
// 背景をクリックしても閉じる
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

// ============================
// 実務の実績（ログインした人だけ）
//   private-works.js の暗号化データを、入力されたIDとパスワードで復号して表示する。
//   正しいIDとパスワードがないと、ファイルを直接見ても中身は読めない。
// ============================
(() => {
  const form = document.getElementById("login");
  const msg = document.getElementById("login-msg");
  const area = document.getElementById("private");
  const KEY = "portfolio-login";   // このタブを閉じるまでログイン状態を覚えておく
  const data = window.PRIVATE_WORKS;
  const unb64 = (s) => Uint8Array.from(atob(s), (c) => c.charCodeAt(0));

  async function unlock(id, pw) {
    const enc = new TextEncoder();
    const base = await crypto.subtle.importKey("raw", enc.encode(`${id}\n${pw}`), "PBKDF2", false, ["deriveKey"]);
    const key = await crypto.subtle.deriveKey(
      { name: "PBKDF2", hash: "SHA-256", salt: unb64(data.salt), iterations: data.iter },
      base, { name: "AES-GCM", length: 256 }, false, ["decrypt"]);
    const plain = await crypto.subtle.decrypt({ name: "AES-GCM", iv: unb64(data.iv) }, key, unb64(data.data));
    return JSON.parse(new TextDecoder().decode(plain));
  }

  function show(content) {
    const offset = works.length;
    const items = content.works.map((w) => {
      const g = content.groups.find((x) => x.key === w.group);
      return { ...w, company: g ? g.label : "" };
    });
    shownWorks = works.concat(items);
    document.getElementById("private-note").textContent = content.note || "";
    document.getElementById("private-groups").innerHTML = content.groups.map((g) => {
      const list = items.map((w, i) => ({ w, i })).filter(({ w }) => w.group === g.key);
      if (!list.length) return "";
      return `<section class="pgroup" aria-label="${esc(g.label)}">
        <header class="pgroup-head">
          <h3>${esc(g.label)}</h3><span class="pgroup-en">${esc(g.en || "")}</span>
          <span class="pgroup-count">( ${list.length} works )</span>
        </header>
        ${g.summary ? `<p class="pgroup-summary">${esc(g.summary)}</p>` : ""}
        <ul class="grid">${list.map(({ w, i }) => cardsHTML([w], offset + i, "is-in")).join("")}</ul>
      </section>`;
    }).join("");
    form.hidden = true;
    area.hidden = false;
  }

  async function tryLogin(id, pw, quiet) {
    if (!data) { msg.textContent = "実績データを読み込めませんでした。"; return; }
    try {
      const content = await unlock(id, pw);
      try { sessionStorage.setItem(KEY, JSON.stringify([id, pw])); } catch {}
      show(content);
      if (!quiet) area.querySelector(".pgroup h3")?.focus?.();
    } catch {
      if (!quiet) msg.textContent = "IDかパスワードが違います。";
      try { sessionStorage.removeItem(KEY); } catch {}
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = document.getElementById("login-btn");
    btn.disabled = true;
    msg.textContent = "確認しています…";
    await tryLogin(document.getElementById("login-id").value.trim(), document.getElementById("login-pw").value, false);
    if (!area.hidden) msg.textContent = "";
    btn.disabled = false;
  });

  document.getElementById("logout").addEventListener("click", () => {
    try { sessionStorage.removeItem(KEY); } catch {}
    shownWorks = works;
    document.getElementById("private-groups").innerHTML = "";
    area.hidden = true;
    form.hidden = false;
    form.reset();
    msg.textContent = "ログアウトしました。";
  });

  // 同じタブで再読み込みしたときは、ログイン状態を復元
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (saved) tryLogin(saved[0], saved[1], true);
  } catch {}
})();

document.getElementById("year").textContent = new Date().getFullYear();

// 右の縦帯に今日の日付を表示（例: ( Nov. 20th, 2026 )）
(() => {
  const d = new Date();
  const m = ["Jan.", "Feb.", "Mar.", "Apr.", "May", "Jun.", "Jul.", "Aug.", "Sep.", "Oct.", "Nov.", "Dec."][d.getMonth()];
  const n = d.getDate();
  const suf = n % 10 === 1 && n !== 11 ? "st" : n % 10 === 2 && n !== 12 ? "nd" : n % 10 === 3 && n !== 13 ? "rd" : "th";
  document.getElementById("date").textContent = `( ${m} ${n}${suf}, ${d.getFullYear()} )`;
})();

// ============================
// 動き
// ============================
const hero = document.querySelector(".hero");

// 1) 読み込み後に「つ・た・わ・る」の登場アニメーションを開始
requestAnimationFrame(() => requestAnimationFrame(() => hero.classList.add("is-ready")));

// 2) スクロールで要素が見えたら、ふわっと表示
const io = new IntersectionObserver((entries) => {
  for (const e of entries) if (e.isIntersecting) { e.target.classList.add("is-in"); io.unobserve(e.target); }
}, { rootMargin: "0px 0px -10% 0px" });
document.querySelectorAll(".sec .rv, .grid .rv").forEach((el) => io.observe(el));

// 3) 動きの一時停止（ボタン、または端末の「動きを減らす」設定）
const motionQuery = window.matchMedia("(prefers-reduced-motion: reduce)");
const toggle = document.getElementById("motion-toggle");
let userPaused = false;
const isPaused = () => userPaused || motionQuery.matches;
const applyPause = () => {
  document.documentElement.classList.toggle("motion-paused", isPaused());
  toggle.setAttribute("aria-pressed", String(userPaused));
  toggle.textContent = userPaused ? "動きを再開" : "動きを止める";
  if (isPaused()) { resetParallax(); showCopyStatic(); }
  else { onScroll(); if (copy.classList.contains("copy-static") || copyRun === 0) playCopy(copyRun === 0 ? 900 : 300); }
};

// 4) コピーを毎回1文字目から表示し直す
//    「届く言葉と、」＋朱色のフレーズ＋「を。」を1文字ずつ表示 → しばらく見せる → 全体を消す → 次のフレーズで繰り返し
const phrases = ["伝わるかたち", "選ばれる理由", "心が動く仕掛け"];
const copy = document.getElementById("copy");
const copyCol1 = copy.children[0];
const copyCol2 = copy.children[1];
const wait = (ms) => new Promise((r) => setTimeout(r, ms));
const splitChars = (text) => [...text].map((c) => `<span class="ch">${c}</span>`).join("");
const CHAR_STEP = 200;      // 1文字ごとの間隔（ミリ秒）。大きくするとゆっくり読ませる
let p = 0;
let copyRun = 0;            // 停止・再開のたびに番号を変えて、古いループを止める

function buildCopy() {
  copyCol1.innerHTML = splitChars("届く言葉と、");
  copyCol2.innerHTML = `<em class="rotator">${splitChars(phrases[p])}</em>${splitChars("を。")}`;
  return [...copy.querySelectorAll(".ch")];
}
function showCopyStatic() {   // 動きを止めているときは、全文をそのまま表示
  copyRun++;
  copy.classList.add("copy-static");
  buildCopy().forEach((ch) => ch.classList.add("on"));
}
async function playCopy(firstDelay) {
  const run = ++copyRun;
  copy.classList.remove("copy-static");
  let delay = firstDelay;
  while (run === copyRun) {
    const chars = buildCopy();   // 先に文字を隠した状態で並べてから表示を始める
    await wait(delay);
    delay = 50;
    if (run !== copyRun) return;
    // 読むペースで1文字ずつ表示。「、」のあとは少し間を置く
    let t = 0;
    chars.forEach((ch) => {
      ch.style.transitionDelay = `${t}ms`;
      ch.classList.add("on");
      t += ch.textContent === "、" ? CHAR_STEP + 500 : CHAR_STEP;
    });
    await wait(t + 600 + 3000);                             // 表示し終わってから約3秒見せる
    if (run !== copyRun) return;
    if (scrollY > innerHeight) { await wait(1000); continue; } // FVが見えていない間は待つ
    chars.forEach((ch) => { ch.style.transitionDelay = "0ms"; ch.classList.remove("on"); });
    await wait(900);                                        // 全体が消えるのを待つ
    p = (p + 1) % phrases.length;
  }
}

// 5) スクロールに合わせて、大きな文字と背景の文字をゆっくり動かす
const kana = [...document.querySelectorAll(".k")];
const ghostTop = document.getElementById("ghost-top");
const ghostBottom = document.getElementById("ghost-bottom");
let ticking = false;
function render() {
  ticking = false;
  if (isPaused()) return;
  const y = scrollY;
  if (y < innerHeight * 1.2) {
    for (const k of kana) k.style.setProperty("--py", `${-y * Number(k.dataset.speed)}px`);
  }
  ghostTop.style.transform = `translateX(${-y * 0.08}px)`;     // 上の文字は左へ
  ghostBottom.style.transform = `translateX(${y * 0.05}px)`;   // 下の文字は右へ
}
function onScroll() { if (!ticking) { ticking = true; requestAnimationFrame(render); } }
function resetParallax() {
  for (const k of kana) k.style.setProperty("--py", "0px");
  ghostTop.style.transform = ghostBottom.style.transform = "";
}
window.addEventListener("scroll", onScroll, { passive: true });
toggle.addEventListener("click", () => { userPaused = !userPaused; applyPause(); });
motionQuery.addEventListener("change", applyPause);
applyPause();

// 6) 「つ・た・わ・る」と朱色の点に、マウスを乗せたときの動き
for (const k of kana) {
  const inner = k.querySelector(".k-in");
  k.addEventListener("pointerenter", () => {
    k.classList.add("is-hover");
    if (isPaused()) return;
    k.classList.remove("is-jelly");
    void k.offsetWidth;           // アニメーションを最初から再生し直す
    k.classList.add("is-jelly");
  });
  // カーソルの方へ少し引き寄せる（文字の中心からのずれの25%だけ動く）
  k.addEventListener("pointermove", (e) => {
    if (isPaused()) return;
    const r = inner.getBoundingClientRect();
    inner.style.setProperty("--mx", `${(e.clientX - (r.left + r.width / 2)) * 0.25}px`);
    inner.style.setProperty("--my", `${(e.clientY - (r.top + r.height / 2)) * 0.25}px`);
  });
  k.addEventListener("pointerleave", () => {
    k.classList.remove("is-hover");
    inner.style.setProperty("--mx", "0px");   // バネのように元の位置へ戻る
    inner.style.setProperty("--my", "0px");
  });
  k.addEventListener("animationend", () => k.classList.remove("is-jelly"));
}
const dot = document.querySelector(".dot");
dot.addEventListener("pointerenter", () => {
  if (isPaused()) return;
  dot.classList.remove("is-hop");
  void dot.offsetWidth;
  dot.classList.add("is-hop");
});
dot.addEventListener("animationend", (e) => { if (e.target === dot && e.animationName === "hop") dot.classList.remove("is-hop"); });
