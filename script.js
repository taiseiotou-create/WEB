// ============================
// 作品データ：ここを書き換えれば作品一覧が変わる
//   ※ ここは誰でも見られる「公開」作品だけ。会社での実績は private/works.json に書いて
//     tools/private-works.mjs で暗号化する（手順は CLAUDE.md を参照）
//   image:   画像ファイルのパス（例: "images/work1.jpg"）。空なら自動生成のポスターを表示
//   glyph:   ポスターに大きく描く1文字（省略するとタイトルの1文字目）
//   url:     作品サイトのURL。あれば詳細に「サイトを見る」リンクが出る
//   palette: ポスターの色 [メイン, 背景, サブ]
// ============================
const works = [
  { title: "HSVCJ関連サイト「HSと暮らす」", glyph: "波", category: "Web", year: "2026",
    url: "",  // ← 公開URLが決まったらここに入れる（例: "https://example.com/"）
    desc: "「ひとりから、つながりへ」をテーマにしたWebページ。ひとりで抱えていた人が、声に出すことで波紋のようにつながり、「今日はどう？」「わかるよ」「話してくれて、ありがとう」という言葉に背中を押されて一歩ずつ進んでいく様子を、やわらかなイラストとアニメーションで描きました。オープニング映像版も制作しています。",
    role: "企画、構成、コピー、イラストの演出、アニメーション、実装（AIと協働）",
    point: "重くなりがちなテーマを、丸みのある書体とやさしい色、ゆっくりした動きで、そっと寄り添うトーンに",
    palette: ["#2f8fc8", "#fdf3f6", "#f3a6c0"] },
  { title: "てんぷれや「しごと棚」", glyph: "棚", category: "Product", year: "2026 — 制作中",
    url: "",  // ← 販売ページ（BOOTHなど）を公開したらここに入れる
    desc: "小さなお店や教室が、すぐに使える書類やカードをそろえられる業種別テンプレート集「しごと棚」。ブランド「てんぷれや」として制作中です。第1弾は美容室・ネイルサロン・まつげエクステ・ヨガ／ピラティス教室・パーソナルジムの5業種で、Canvaで編集できるテンプレートと、そのまま使える印刷用PDF（A4書類・カード）、ご利用ガイドをセットにしています。",
    role: "企画、ブランドづくり、テンプレートのデザイン、商品ページの文面（AIと協働）",
    point: "デザインに慣れていない店主でも、名前や料金を入れ替えるだけで整って見える作り",
    palette: ["#c9a227", "#f4f1ea", "#1b1a17"] },
  { title: "アヒルのキャラクター展開", glyph: "鳥", category: "Branding", year: "2026",
    desc: "アヒルのキャラクターを使った、映画ポスター風の壁紙などの展開を自主制作。キャラクターごとの役割が絵から伝わるよう、世界観・配色・構図を方向づけました。",
    role: "キャラクター設定、世界観・配色・構図の方向づけ",
    point: "元の配色を守りながら、スマホ・PCなど媒体別の案を検討",
    palette: ["#1f3a6b", "#f2c14e", "#f4f1ea"] },
  { title: "このポートフォリオサイト", glyph: "伝", category: "Web", year: "2026",
    desc: "いま見ているこのサイト。コンセプトは「言葉が、かたちになる」。トップのコピーは数千の粒でできていて、マウスでくずれ、クリックすると別の言葉に組み変わります。81-web.com に掲載された179件のポートフォリオサイトを分析し、番号付きの作品リストや横スクロールの章立てなど、見せ方の考え方を取り入れました。会社での実績は、パスワードで暗号化してログインした人だけが読める仕組みにしています。",
    role: "企画、コピー、デザイン、実装（HTML・CSS・JavaScript。AIと協働）",
    point: "動きで印象を残しつつ、「動きを止める」ボタンや読み上げ対応など、誰でも見やすい作りに",
    palette: ["#ff4a1c", "#141413", "#f2efe8"] },
  { title: "グラフィック個展", glyph: "形", category: "Personal", year: "学生時代",
    desc: "人工臓器のような形を抽象化したグラフィックを制作し、個展で展示。来場者の反応から、デザインで発信することの責任を意識するきっかけになりました。",
    role: "作品制作、個展の開催",
    point: "形の抽象化と、見る人に委ねる表現",
    palette: ["#c43d3d", "#efe6d2", "#1b1a17"] },
];

// ============================
// 共通の道具
// ============================
const $ = (s, el = document) => el.querySelector(s);
const $$ = (s, el = document) => [...el.querySelectorAll(s)];
const lerp = (a, b, t) => a + (b - a) * t;
const clamp = (v, a, b) => Math.min(b, Math.max(a, v));
const isTouch = matchMedia("(pointer: coarse)").matches;
function esc(t) {   // 文字をそのまま表示する（HTMLとして解釈させない）
  return String(t ?? "").replace(/[&<>"']/g, (c) => ({ "&": "&amp;", "<": "&lt;", ">": "&gt;", '"': "&quot;", "'": "&#39;" })[c]);
}

// 動きの一時停止（ボタン、または端末の「動きを減らす」設定）
const motionQuery = matchMedia("(prefers-reduced-motion: reduce)");
let userPaused = false;
const isPaused = () => userPaused || motionQuery.matches;
const pauseListeners = [];
function applyPause() {
  document.documentElement.classList.toggle("motion-paused", isPaused());
  const t = $("#motion-toggle");
  t.setAttribute("aria-pressed", String(userPaused));
  t.textContent = userPaused ? "動きを再開" : "動きを止める";
  pauseListeners.forEach((fn) => fn(isPaused()));
}
$("#motion-toggle").addEventListener("click", () => { userPaused = !userPaused; applyPause(); });
motionQuery.addEventListener("change", applyPause);

// ============================
// 作品ごとのポスター（画像がないときに自動で描く）
// ============================
function poster(work, i) {
  if (work.image) return `<img src="${esc(work.image)}" alt="" loading="lazy" style="width:100%;height:100%;object-fit:cover">`;
  const [a, b, c] = work.palette || ["#ff4a1c", "#f2efe8", "#141413"];
  const g = esc(work.glyph || [...work.title][0]);
  const no = String(i + 1).padStart(2, "0");
  const t = esc(work.title);
  const layouts = [
    `<circle cx="300" cy="330" r="230" fill="${a}"/><text x="300" y="420" font-size="300" text-anchor="middle" fill="${b}" font-family="Zen Old Mincho, serif" font-weight="900">${g}</text>`,
    `<rect x="0" y="0" width="600" height="420" fill="${a}"/><text x="40" y="560" font-size="380" fill="${c}" font-family="Zen Old Mincho, serif" font-weight="900">${g}</text>`,
    `<text x="300" y="520" font-size="520" text-anchor="middle" fill="none" stroke="${a}" stroke-width="3" font-family="Zen Old Mincho, serif" font-weight="900">${g}</text><circle cx="470" cy="160" r="46" fill="${a}"/>`,
    `<path d="M0 750 L600 120 L600 750 Z" fill="${a}"/><text x="60" y="380" font-size="300" fill="${c}" font-family="Zen Old Mincho, serif" font-weight="900">${g}</text>`,
    `<g fill="${a}">${Array.from({ length: 6 }, (_, k) => `<rect x="${k * 100}" y="0" width="50" height="750" opacity="${0.25 + k * 0.12}"/>`).join("")}</g><text x="300" y="470" font-size="330" text-anchor="middle" fill="${c}" font-family="Zen Old Mincho, serif" font-weight="900">${g}</text>`,
  ];
  const lay = layouts[i % layouts.length];
  // 版ズレ：同じ図柄を朱色で少しずらして下に敷き、その上に本来の色を刷る
  const ghost = lay.replace(/fill="(?!none)[^"]*"/g, 'fill="#ff4a1c"').replace(/stroke="[^"]*"/g, 'stroke="#ff4a1c"');
  return `<svg viewBox="0 0 600 750" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${t} のイメージ">
    <rect width="600" height="750" fill="${b}"/>
    <g filter="url(#riso)" opacity=".28" transform="translate(7 5)" style="mix-blend-mode:multiply">${ghost}</g>
    <g filter="url(#riso)">${lay}</g>
    <text x="30" y="50" font-size="22" fill="${c}" font-family="JetBrains Mono, monospace">No.${no}</text>
    <text x="570" y="720" font-size="20" text-anchor="end" fill="${c}" font-family="JetBrains Mono, monospace">${esc(work.category)} / ${esc(work.year)}</text>
  </svg>`;
}

// ============================
// 作品リスト（インデックス表示・グリッド表示）
// ============================
let shownWorks = works.slice();   // 詳細画面で前後に移動するための一覧（ログイン後は非公開作品も足す）
const rowHTML = (w, i, n = 0) => `
  <li class="index-row" style="--n:${n}">
    <button class="row-btn" type="button" data-index="${i}" data-cursor="VIEW" aria-haspopup="dialog">
      <span class="row-no">${String(i + 1).padStart(2, "0")}</span>
      <span class="row-title">${esc(w.title)}${w.company ? `<span class="row-company">${esc(w.company)}</span>` : ""}</span>
      <span class="row-cat">${esc(w.category)}</span>
      <span class="row-year">${esc(w.year)}</span>
      <span class="row-arrow" aria-hidden="true">→</span>
    </button>
  </li>`;
const cardHTML = (w, i) => `
  <li data-index="${i}">
    <button class="card" type="button" data-index="${i}" data-cursor="VIEW" aria-haspopup="dialog">
      <div class="card-art" aria-hidden="true">${poster(w, i)}</div>
      <div class="card-meta"><span class="card-title">${esc(w.title)}</span><span class="card-cat">${esc(w.category)} — ${esc(w.year)}</span></div>
    </button>
  </li>`;
const indexEl = $("#works-index");
const gridEl = $("#works-grid");
indexEl.innerHTML = works.map((w, i) => rowHTML(w, i)).join("");
gridEl.innerHTML = works.map(cardHTML).join("");
$("#works-count").textContent = `( ${String(works.length).padStart(2, "0")} projects )`;

// 表示の切り替え
$$(".seg-btn").forEach((btn) => btn.addEventListener("click", () => {
  const grid = btn.dataset.view === "grid";
  $$(".seg-btn").forEach((b) => { const on = b === btn; b.classList.toggle("is-on", on); b.setAttribute("aria-pressed", on); });
  indexEl.hidden = grid; gridEl.hidden = !grid;
}));

// シャッフル：並びをランダムに入れ替え、元の位置からなめらかに動かす（FLIPという手法）
$("#shuffle").addEventListener("click", () => {
  const list = indexEl.hidden ? gridEl : indexEl;
  const items = [...list.children];
  const before = new Map(items.map((el) => [el, el.getBoundingClientRect()]));
  for (let k = items.length - 1; k > 0; k--) { const j = Math.floor(Math.random() * (k + 1)); [items[k], items[j]] = [items[j], items[k]]; }
  items.forEach((el) => list.appendChild(el));
  if (isPaused()) return;
  items.forEach((el) => {
    const a = before.get(el), b = el.getBoundingClientRect();
    el.animate([{ transform: `translate(${a.left - b.left}px, ${a.top - b.top}px)` }, { transform: "none" }],
      { duration: 700, easing: "cubic-bezier(.2,.8,.2,1)" });
  });
});

// グリッドのカードを、マウスの位置に合わせて少し傾ける
gridEl.addEventListener("pointermove", (e) => {
  const art = e.target.closest(".card")?.querySelector(".card-art");
  if (!art || isPaused()) return;
  const r = art.getBoundingClientRect();
  const x = (e.clientX - r.left) / r.width - 0.5, y = (e.clientY - r.top) / r.height - 0.5;
  art.style.transform = `rotateY(${x * 10}deg) rotateX(${-y * 10}deg)`;
});
gridEl.addEventListener("pointerout", (e) => { const art = e.target.closest(".card")?.querySelector(".card-art"); if (art) art.style.transform = ""; });

// ============================
// 作品の詳細（全画面）
// ============================
const detail = $("#detail");
let current = 0;
function openWork(i) {
  const w = shownWorks[i];
  if (!w) return;
  current = i;
  $("#detail-art").innerHTML = poster(w, i);
  $("#detail-meta").textContent = `No.${String(i + 1).padStart(2, "0")} — ${w.company ? w.company + " — " : ""}${w.category} — ${w.year}`;
  $("#detail-title").textContent = w.title;
  $("#detail-desc").textContent = w.desc;
  $("#detail-role").textContent = w.role;
  $("#detail-point").textContent = w.point;
  const link = $("#detail-link");
  link.hidden = !w.url;
  if (w.url) link.href = w.url;
  if (!detail.open) detail.showModal();
  detail.querySelector(".detail-text").scrollTop = 0;
}
// クリックしたところにインクが飛び散る（入力欄などでは出さない）
document.addEventListener("pointerdown", (e) => {
  if (isPaused() || e.target.closest("input, textarea, dialog")) return;
  const n = 7 + ((Math.random() * 6) | 0);
  for (let k = 0; k < n; k++) {
    const el = document.createElement("span");
    el.className = "splat";
    const size = k === 0 ? 14 + Math.random() * 10 : 3 + Math.random() * 8;
    const a = Math.random() * Math.PI * 2, dist = k === 0 ? 0 : 16 + Math.random() * 46;
    el.style.width = el.style.height = `${size}px`;
    el.style.background = Math.random() < 0.7 ? "var(--accent)" : "var(--ink)";
    document.body.appendChild(el);
    const x = e.clientX - size / 2, y = e.clientY - size / 2;
    el.animate([
      { transform: `translate(${x}px, ${y}px) scale(.2)`, opacity: 1 },
      { transform: `translate(${x + Math.cos(a) * dist}px, ${y + Math.sin(a) * dist}px) scale(1, ${0.8 + Math.random() * 0.5})`, opacity: 0.95, offset: 0.25 },
      { transform: `translate(${x + Math.cos(a) * dist}px, ${y + Math.sin(a) * dist + 10}px) scale(.9, 1.3)`, opacity: 0 },
    ], { duration: 900 + Math.random() * 500, easing: "cubic-bezier(.2,.8,.2,1)" }).onfinish = () => el.remove();
  }
});

document.addEventListener("click", (e) => {
  const b = e.target.closest(".row-btn, .card");
  if (b) { hidePreview(); openWork(Number(b.dataset.index)); }
});
$("#detail-close").addEventListener("click", () => detail.close());
$("#detail-prev").addEventListener("click", () => openWork((current - 1 + shownWorks.length) % shownWorks.length));
$("#detail-next").addEventListener("click", () => openWork((current + 1) % shownWorks.length));
detail.addEventListener("keydown", (e) => {
  if (e.key === "ArrowRight") $("#detail-next").click();
  if (e.key === "ArrowLeft") $("#detail-prev").click();
});

// ============================
// カーソルとプレビュー
// ============================
const cursor = $("#cursor"), cursorLabel = $("#cursor-label"), preview = $("#preview");
const mouse = { x: innerWidth / 2, y: innerHeight / 2, active: false };
const cur = { x: mouse.x, y: mouse.y };
const pv = { x: 0, y: 0, vx: 0, idx: -1 };
addEventListener("pointermove", (e) => {
  mouse.x = e.clientX; mouse.y = e.clientY; mouse.active = true;
  if (!isTouch) cursor.classList.add("is-on");
});
document.addEventListener("pointerleave", () => cursor.classList.remove("is-on"));
document.addEventListener("pointerover", (e) => {
  const t = e.target.closest("[data-cursor], a, button");
  cursor.classList.toggle("is-big", !!t);
  cursorLabel.textContent = t?.dataset.cursor || "";
  const row = e.target.closest(".row-btn");
  if (row && !isTouch) showPreview(Number(row.dataset.index)); else if (!e.target.closest(".row-btn")) hidePreview();
});
function showPreview(i) {
  if (pv.idx !== i) { preview.innerHTML = poster(shownWorks[i], i); pv.idx = i; }
  preview.classList.add("is-on");
}
function hidePreview() { preview.classList.remove("is-on"); }

// マウスに引き寄せられるボタン
$$(".magnetic, .hero-hint, .seg").forEach((el) => {
  el.addEventListener("pointermove", (e) => {
    if (isPaused()) return;
    const r = el.getBoundingClientRect();
    el.style.transform = `translate(${(e.clientX - r.left - r.width / 2) * 0.25}px, ${(e.clientY - r.top - r.height / 2) * 0.35}px)`;
  });
  el.addEventListener("pointerleave", () => { el.style.transform = ""; });
});

// ============================
// ファーストビュー：筆と墨で書いたコピー（WebGL）
//   1) 毛筆書体の文字を見えないキャンバスに描き、「文字の形」と「書き順（どこから現れるか）」の地図を作る
//   2) 文字の形をぼかした地図から「筆の進む向き」を求め、その向きに沿った筋（穂先の毛）を作る
//   3) GPU（画像処理用の部品）で1画素ずつ計算して、次の質感を描く
//      ・かすれ：乾いた筆で白く抜けた筋。筆の向きに沿って、ところどころ強く出る
//      ・にじみ：墨が紙の繊維に沿って外へしみ出す。書いた直後ほど広がっていく
//      ・濃淡：墨だまりで濃く、ところどころ薄い。書いた直後は濡れて濃く、乾くと落ち着く
//      ・輪郭：紙の繊維でわずかにぎざつく
//   4) 一文字ずつ筆が走るように現れ、最後に朱色の落款（判子）が押される
//   5) マウスを近づけると、濡れた墨を指でこするように、その部分がゆがむ
//   ※ WebGL が使えない環境では、普通の文字で表示する
// ============================
const phrases = ["伝わるかたち", "選ばれる理由", "心が動く仕掛け", "届く言葉"];
const BRUSH_FONT = '"Yuji Boku", "Zen Old Mincho", serif';
const hero = (() => {
  let cvs = $("#hero-canvas");
  const phraseEl = $("#hero-phrase");
  let gl = cvs.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: false });
  let W = 0, H = 0, R = 1, TW = 0, TH = 0, p = 0, seal = null;
  let prog = 0, sealT = 0, fade = 0, phase = "idle", t0 = 0, running = false, dirty = true, timer = 0;
  const mv = { x: -9999, y: -9999, vx: 0, vy: 0, px: 0, py: 0 };

  // ---------- 文字の地図づくり（CPU側。言葉が変わるときだけ） ----------
  function boxBlur(src, w, h, r) {           // 箱型のぼかしを3回重ねて、なめらかなぼかしにする
    let a = src, b = new Float32Array(w * h);
    r = Math.max(1, Math.round(r));
    for (let it = 0; it < 3; it++) {
      for (let y = 0; y < h; y++) {          // 横方向
        let acc = 0; const row = y * w;
        for (let x = -r; x <= r; x++) acc += a[row + clamp(x, 0, w - 1)];
        for (let x = 0; x < w; x++) {
          b[row + x] = acc / (2 * r + 1);
          acc += a[row + Math.min(w - 1, x + r + 1)] - a[row + Math.max(0, x - r)];
        }
      }
      for (let x = 0; x < w; x++) {          // 縦方向
        let acc = 0;
        for (let y = -r; y <= r; y++) acc += b[clamp(y, 0, h - 1) * w + x];
        for (let y = 0; y < h; y++) {
          a = a === src ? new Float32Array(w * h) : a;
          a[y * w + x] = acc / (2 * r + 1);
          acc += b[Math.min(h - 1, y + r + 1) * w + x] - b[Math.max(0, y - r) * w + x];
        }
      }
    }
    return a;
  }
  function layout(text) {
    const chars = [...text];
    const narrow = W < 700;
    const lines = narrow && chars.length > 4 ? [chars.slice(0, Math.ceil(chars.length / 2)), chars.slice(Math.ceil(chars.length / 2))] : [chars];
    const longest = Math.max(...lines.map((l) => l.length));
    const fs = Math.min((W * 0.84) / longest, H * (narrow ? 0.27 : 0.44));
    return { lines, fs };
  }
  function buildMaps(text) {
    const { lines, fs } = layout(text);
    const c = document.createElement("canvas"); c.width = TW; c.height = TH;
    const o = c.getContext("2d");
    o.fillStyle = "#000"; o.fillRect(0, 0, TW, TH);
    o.font = `400 ${fs * R}px ${BRUSH_FONT}`; o.textBaseline = "middle"; o.fillStyle = "#fff";
    o.strokeStyle = "#fff"; o.lineWidth = fs * R * 0.018; o.lineJoin = "round";
    const boxes = [];   // 文字ごとの位置（書き順の計算に使う）
    let n = 0, lastBox = null;
    lines.forEach((l, k) => {
      const total = o.measureText(l.join("")).width;
      let x = TW / 2 - total / 2;
      const y = (H * 0.47 + (k - (lines.length - 1) / 2) * fs * 1.08) * R;
      l.forEach((ch) => {
        const w = o.measureText(ch).width;
        o.fillText(ch, x, y);
        o.strokeText(ch, x, y);   // 輪郭をなぞって、線を少し太らせる（墨の存在感）
        lastBox = { x0: x, x1: x + w, y0: y - fs * R * 0.55, y1: y + fs * R * 0.55, i: n++ };
        boxes.push(lastBox);
        x += w;
      });
    });
    // 墨の飛沫：文字のまわりに小さな点をいくつか
    for (let k = 0; k < 7; k++) {
      const b = boxes[(Math.random() * boxes.length) | 0];
      const sx = b.x0 + Math.random() * (b.x1 - b.x0), sy = Math.random() < 0.5 ? b.y0 - Math.random() * 12 * R : b.y1 + Math.random() * 12 * R;
      o.beginPath(); o.arc(sx, sy, (1 + Math.random() * 3.5) * R * (fs / 160), 0, Math.PI * 2); o.fill();
    }
    const src = o.getImageData(0, 0, TW, TH).data;
    // 書き順の地図：文字の順番＋文字の中では左上から右下へ。少しゆらぎを足す
    const px = new Uint8Array(TW * TH * 4);
    for (let y = 0; y < TH; y++) for (let x = 0; x < TW; x++) {
      const i = (y * TW + x) * 4, v = src[i];
      px[i] = v;
      if (v < 8) { px[i + 3] = 255; continue; }
      let b = boxes[0], best = 1e9;
      for (const bb of boxes) {
        const dx = x < bb.x0 ? bb.x0 - x : x > bb.x1 ? x - bb.x1 : 0, dy = y < bb.y0 ? bb.y0 - y : y > bb.y1 ? y - bb.y1 : 0;
        const d = dx + dy; if (d < best) { best = d; b = bb; if (d === 0) break; }
      }
      const u = clamp((x - b.x0) / (b.x1 - b.x0 || 1), 0, 1), w = clamp((y - b.y0) / (b.y1 - b.y0 || 1), 0, 1);
      const within = u * 0.5 + w * 0.5 + (Math.sin(x * 0.07 + y * 0.05) * 0.03);
      px[i + 3] = clamp(((b.i + clamp(within, 0, 1) * 0.92) / boxes.length) * 230 + 5, 0, 250);
    }
    // ぼかしの地図（半分の細かさ）：R=小さいぼかし（にじみ用）、G=大きいぼかし（筆の向き・太さ用）
    const hw = Math.ceil(TW / 2), hh = Math.ceil(TH / 2), half = new Float32Array(hw * hh);
    for (let y = 0; y < hh; y++) for (let x = 0; x < hw; x++) half[y * hw + x] = src[((y * 2) * TW + x * 2) * 4] / 255;
    const small = boxBlur(half, hw, hh, fs * R * 0.012);
    const large = boxBlur(half, hw, hh, fs * R * 0.035);
    const bl = new Uint8Array(hw * hh * 4);
    for (let k = 0; k < hw * hh; k++) { bl[k * 4] = Math.min(255, small[k] * 255 * 1.6); bl[k * 4 + 1] = Math.min(255, large[k] * 255 * 1.9); bl[k * 4 + 3] = 255; }
    // 落款の位置：最後の文字の右下
    const s = fs * 0.3 * R;
    seal = { x: Math.min(TW - s - 12 * R, lastBox.x1 + fs * 0.12 * R), y: lastBox.y1 - s * 0.9, s };
    return { px, bl, hw, hh, fs };
  }
  function sealTexture() {   // 朱色の落款：四角の中に白抜きで「川上」
    const c = document.createElement("canvas"); c.width = c.height = 256;
    const o = c.getContext("2d");
    o.fillStyle = "#fff"; o.fillRect(14, 14, 228, 228);
    o.fillStyle = "#000"; o.fillRect(30, 30, 196, 196);
    o.fillStyle = "#fff"; o.font = `400 100px ${BRUSH_FONT}`; o.textAlign = "center"; o.textBaseline = "middle";
    o.fillText("川", 128, 82); o.fillText("上", 128, 178);
    // 枠と白抜き以外を朱にする（白＝朱、黒＝紙）→ 反転して陰刻らしく
    const d = o.getImageData(0, 0, 256, 256), out = new Uint8Array(256 * 256 * 4);
    for (let k = 0; k < 256 * 256; k++) {
      const inner = k % 256 >= 30 && k % 256 < 226 && ((k / 256) | 0) >= 30 && ((k / 256) | 0) < 226;
      const v = d.data[k * 4];
      out[k * 4] = inner ? 255 - v : v; out[k * 4 + 3] = 255;
    }
    // 外枠のさらに外は紙
    for (let k = 0; k < 256 * 256; k++) { const x = k % 256, y = (k / 256) | 0; if (x < 14 || x >= 242 || y < 14 || y >= 242) out[k * 4] = 0; }
    return out;
  }

  // ---------- WebGL ----------
  const VS = `attribute vec2 a; varying vec2 v; void main(){ v = vec2(a.x * .5 + .5, .5 - a.y * .5); gl_Position = vec4(a, 0., 1.); }`;
  const FS = `precision highp float;
  varying vec2 v;
  uniform sampler2D uMask, uBlur, uSealT;
  uniform vec2 uRes, uMouse, uMVel;
  uniform float uProg, uSeal, uFade, uS;
  uniform vec4 uSealR;
  uniform vec3 uInk, uRed;
  float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
  float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
    return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
  float fbm(vec2 p){ float r = 0., a = .5; for (int i = 0; i < 5; i++){ r += a * noise(p); p = p * 2.03 + 17.1; a *= .5; } return r; }
  void main(){
    vec2 px = v * uRes;
    float s = uS;
    // マウス：濡れた墨を指でこするように、動いた向きへ引きずる
    vec2 dm = px - uMouse;
    float fall = exp(-dot(dm, dm) / (5200. * s * s));
    vec2 p = px - uMVel * fall * 5.;
    // 紙の繊維で輪郭をわずかにぎざつかせる
    vec2 fib = vec2(fbm(p * vec2(.03, .2) / s), fbm(p * vec2(.2, .03) / s + 9.)) - .5;
    vec2 uv = (p + fib * 2.6 * s) / uRes;
    vec4 m = texture2D(uMask, uv);
    vec2 bl = texture2D(uBlur, uv).rg;
    float order = m.a;
    // 書き順に沿って現れる。書いてからの時間で「濡れ」→「乾き」
    float since = uProg - order - (fbm(px / s * .035 + 5.) - .5) * .035;   // 現れる境目を筆先のように不規則に
    float rev = smoothstep(-.004, .012, since);
    float wet = 1. - clamp(since * 3.2, 0., 1.);
    // 筆の向き：大きいぼかしの傾きから求める
    vec2 e = vec2(3. * s, 0.) / uRes;
    vec2 g = vec2(texture2D(uBlur, uv + e.xy).g - texture2D(uBlur, uv - e.xy).g,
                  texture2D(uBlur, uv + e.yx).g - texture2D(uBlur, uv - e.yx).g);
    float glen = length(g);
    vec2 n = glen > 1e-5 ? g / glen : vec2(0., 1.);
    vec2 t = vec2(-n.y, n.x);
    float across = dot(px, n) / s, along = dot(px, t) / s;
    // 穂先の毛：筆の向きに長く、横方向に細かい筋
    float bristle = fbm(vec2(across * .6, along * .018));
    float bristle2 = noise(vec2(across * 1.7, along * .05));
    // 乾いた筆の場所：大きなムラ＋線の縁・細いところほど乾きやすい
    float dryField = smoothstep(.38, .72, fbm(px / s * .004 + vec2(order * 13., 2.)));
    float thin = 1. - smoothstep(.25, .9, bl.g);
    float dir = smoothstep(.004, .04, glen);
    float dry = clamp(dryField * (.45 + .75 * thin) * dir, 0., .78) * (1. - wet * .55);
    float kasure = smoothstep(dry - .07, dry + .07, bristle * .8 + bristle2 * .35);
    kasure = max(kasure, .1 + .25 * (1. - dry));   // 乾いた所でも、ところどころ墨が残る
    // 文字の形（なめらかな縁）
    float body = smoothstep(.3, .7, m.r);
    // 濃淡：墨だまり（縁）で濃く、ところどころ薄く。濡れているうちは濃い
    float tone = .8 + .2 * fbm(px / s * .012 + 4.);
    float rim = (1. - smoothstep(.35, .95, bl.r)) * body;
    tone = clamp(tone + rim * .18, 0., 1.);
    tone = mix(tone, 1., wet * .5);
    float grain = .9 + .1 * hash(floor(px / (1.2 * s)));
    float a = body * kasure * tone * grain;
    // にじみ：書いてからしばらく、外側へ繊維に沿ってしみ出す
    float spread = clamp(since * 2.2, 0., 1.);
    float thr = mix(.55, .1, spread);
    float patch = smoothstep(.42, .7, fbm(p / s * .02 + 11.));
    float halo = smoothstep(thr, thr + .35, bl.r) * (1. - body) * (.05 + .14 * patch + .1 * wet) * (.6 + .4 * fbm(p / s * .12 + 2.));
    halo *= 1. - dryField * .85;
    a = a + halo * (1. - a);
    a *= rev * (1. - uFade);
    vec3 col = mix(vec3(.22, .24, .28), uInk, clamp(body * kasure * 1.2, 0., 1.));   // にじみは少し青みのある灰色
    // 落款（朱の判子）
    vec4 outc = vec4(col * a, a);
    if (uSeal > 0.) {
      float sc = mix(1.35, 1., smoothstep(0., 1., uSeal));
      vec2 c = uSealR.xy + uSealR.zz * .5;
      vec2 lp = (px - c) / (uSealR.z * sc) + .5;
      lp += (vec2(fbm(px * .06 / s), fbm(px * .06 / s + 5.)) - .5) * .012;
      if (lp.x > 0. && lp.x < 1. && lp.y > 0. && lp.y < 1.) {
        float sv = texture2D(uSealT, lp).r;
        float press = smoothstep(.2, .75, fbm(px * .07 / s + 3.) + .22) * (.8 + .2 * hash(floor(px / (1.5 * s))));   // 押す力のムラと朱肉の粒
        float sa = sv * press * min(1., uSeal * 2.5) * .92 * (1. - uFade);
        outc = vec4(uRed * sa, sa) + outc * (1. - sa);
      }
    }
    gl_FragColor = outc;
  }`;
  let prog_ = null, U = {}, texMask = null, texBlur = null, texSeal = null;
  function compile(type, src) { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; }
  function tex(w, h, data, smooth = true) {
    const t = gl.createTexture(); gl.bindTexture(gl.TEXTURE_2D, t);
    gl.texImage2D(gl.TEXTURE_2D, 0, gl.RGBA, w, h, 0, gl.RGBA, gl.UNSIGNED_BYTE, data);
    const f = smooth ? gl.LINEAR : gl.NEAREST;
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MIN_FILTER, f); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_MAG_FILTER, f);
    gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_S, gl.CLAMP_TO_EDGE); gl.texParameteri(gl.TEXTURE_2D, gl.TEXTURE_WRAP_T, gl.CLAMP_TO_EDGE);
    return t;
  }
  function setupGL() {
    prog_ = gl.createProgram();
    gl.attachShader(prog_, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(prog_, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog_); gl.useProgram(prog_);
    const buf = gl.createBuffer(); gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, new Float32Array([-1, -1, 1, -1, -1, 1, 1, 1]), gl.STATIC_DRAW);
    const loc = gl.getAttribLocation(prog_, "a"); gl.enableVertexAttribArray(loc); gl.vertexAttribPointer(loc, 2, gl.FLOAT, false, 0, 0);
    ["uMask", "uBlur", "uSealT", "uRes", "uMouse", "uMVel", "uProg", "uSeal", "uFade", "uS", "uSealR", "uInk", "uRed"].forEach((k) => { U[k] = gl.getUniformLocation(prog_, k); });
    gl.uniform1i(U.uMask, 0); gl.uniform1i(U.uBlur, 1); gl.uniform1i(U.uSealT, 2);
    texSeal = tex(256, 256, sealTexture());
  }
  const hex = (h) => { const m = h.trim().replace("#", "").match(/.{2}/g); return m ? m.map((x) => parseInt(x, 16) / 255) : null; };
  function colors() {
    const cs = getComputedStyle(document.documentElement);
    gl.uniform3fv(U.uInk, hex(cs.getPropertyValue("--ink")) || [0.08, 0.08, 0.075]);
    gl.uniform3fv(U.uRed, [0.82, 0.2, 0.1]);   // 朱肉の色（画面の朱色より少し深い）
  }
  function load(text) {
    const mp = buildMaps(text);
    if (texMask) { gl.deleteTexture(texMask); gl.deleteTexture(texBlur); }
    texMask = tex(TW, TH, mp.px);
    texBlur = tex(mp.hw, mp.hh, mp.bl);
    gl.activeTexture(gl.TEXTURE0); gl.bindTexture(gl.TEXTURE_2D, texMask);
    gl.activeTexture(gl.TEXTURE1); gl.bindTexture(gl.TEXTURE_2D, texBlur);
    gl.activeTexture(gl.TEXTURE2); gl.bindTexture(gl.TEXTURE_2D, texSeal);
    gl.uniform4f(U.uSealR, seal.x, seal.y, seal.s, 0);
  }
  function render() {
    gl.viewport(0, 0, TW, TH);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uRes, TW, TH); gl.uniform1f(U.uS, R);
    gl.uniform2f(U.uMouse, mv.x, mv.y); gl.uniform2f(U.uMVel, mv.vx, mv.vy);
    gl.uniform1f(U.uProg, prog); gl.uniform1f(U.uSeal, sealT); gl.uniform1f(U.uFade, fade);
    gl.drawArrays(gl.TRIANGLE_STRIP, 0, 4);
  }

  // ---------- 動きの流れ ----------
  const WRITE = 2600;   // 書き上げるまでの時間（ミリ秒）
  function write() { phase = "write"; t0 = performance.now(); prog = 0; sealT = 0; fade = 0; kick(); }
  function tick(now) {
    if (!running) return;
    if (phase === "write") {
      prog = (now - t0) / WRITE * 1.0;
      if (prog > 1) sealT = clamp((now - t0 - WRITE * 1.05) / 380, 0, 1);
      if (prog > 1.6 && sealT >= 1) { phase = "idle"; }
    } else if (phase === "fade") {
      fade = clamp((now - t0) / 450, 0, 1);
      if (fade >= 1) { load(phrases[p]); write(); }
    }
    // マウス
    const rect = cvs.getBoundingClientRect();
    const nx = (mouse.x - rect.left) * R, ny = (mouse.y - rect.top) * R;
    const vx = nx - mv.px, vy = ny - mv.py; mv.px = nx; mv.py = ny;
    const moving = mouse.active && Math.abs(vx) + Math.abs(vy) > 0.5;
    mv.vx = lerp(mv.vx, moving ? clamp(vx, -60, 60) : 0, moving ? 0.35 : 0.08);
    mv.vy = lerp(mv.vy, moving ? clamp(vy, -60, 60) : 0, moving ? 0.35 : 0.08);
    mv.x = nx; mv.y = ny;
    const active = phase !== "idle" || Math.abs(mv.vx) + Math.abs(mv.vy) > 0.05 || dirty;
    if (active) { render(); dirty = false; requestAnimationFrame(tick); } else { running = false; }
  }
  function kick() { if (!running && gl && !isPaused()) { running = true; requestAnimationFrame(tick); } }
  addEventListener("pointermove", () => { if (inView) kick(); }, { passive: true });
  let inView = true;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) kick(); }).observe(cvs);

  function next() {
    p = (p + 1) % phrases.length;
    phraseEl.textContent = phrases[p];
    restartTimer();
    if (!gl) return fallback();
    if (isPaused()) { load(phrases[p]); prog = 1.6; sealT = 1; fade = 0; render(); return; }
    phase = "fade"; t0 = performance.now(); kick();
  }
  function restartTimer() { clearInterval(timer); if (!isPaused()) timer = setInterval(next, 9000); }

  // WebGL の描画プログラムが動かなかったときは、2D用の新しいキャンバスに差し替える
  function swapCanvas() {
    const c = cvs.cloneNode(false); cvs.replaceWith(c); cvs = c;
    cvs.addEventListener("click", next);
  }
  // WebGL が使えないときは、毛筆書体の文字をそのまま描く
  function fallback() {
    const c2 = cvs.getContext("2d"); if (!c2) return;
    cvs.width = W * R; cvs.height = H * R;
    const { lines, fs } = layout(phrases[p]);
    c2.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink");
    c2.font = `400 ${fs * R}px ${BRUSH_FONT}`; c2.textAlign = "center"; c2.textBaseline = "middle";
    lines.forEach((l, k) => c2.fillText(l.join(""), TW / 2, (H * 0.47 + (k - (lines.length - 1) / 2) * fs * 1.08) * R));
  }
  function resize() {
    R = Math.min(devicePixelRatio || 1, 1.5);
    W = cvs.clientWidth; H = cvs.clientHeight;
    TW = Math.round(W * R); TH = Math.round(H * R);
    cvs.width = TW; cvs.height = TH;
    if (!gl) return fallback();
    load(phrases[p]);
    dirty = true;
  }
  let rt, lastW = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (cvs.clientWidth !== lastW) { lastW = cvs.clientWidth; resize(); if (gl) { prog = Math.max(prog, 1.6); sealT = 1; render(); } } }, 200); });
  cvs.addEventListener("click", () => { getSelection()?.removeAllRanges(); next(); });
  cvs.addEventListener("mousedown", (e) => { if (e.detail > 1) e.preventDefault(); });   // ダブルクリックで文字が選択されないように
  $("#hero-next").addEventListener("click", next);
  pauseListeners.push((paused) => {
    if (!gl) return;
    if (paused) { phase = "idle"; prog = 1.6; sealT = 1; fade = 0; mv.vx = mv.vy = 0; render(); clearInterval(timer); }
    else restartTimer();
  });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { if (gl) { colors(); render(); } });
  return {
    init() {
      lastW = cvs.clientWidth;
      if (gl) { try { setupGL(); colors(); } catch (err) { console.warn(err); gl = null; swapCanvas(); } }
      resize();
      if (!gl) return;
      if (isPaused()) { prog = 1.6; sealT = 1; render(); } else write();
      restartTimer();
    },
  };
})();

// ============================
// スクロールに連動する動き
// ============================
// 1) 流れる帯：スクロールの速さに合わせて加速・逆走する
const marquee = $("#marquee");
marquee.innerHTML += marquee.innerHTML;   // 途切れないように中身を2回並べる
let mqX = 0, lastY = scrollY, vel = 0;

// 2) ステートメント：1文字ずつ分けて、読み進めた分だけ濃くする
const st = $("#statement-text");
const HL = ["伝えるための道具", "言葉にしてから", "ぶれずに届く"];
(() => {
  const text = st.textContent;
  const hot = new Set();
  HL.forEach((h) => { const k = text.indexOf(h); if (k >= 0) for (let j = k; j < k + h.length; j++) hot.add(j); });
  st.setAttribute("aria-label", text);
  st.innerHTML = [...text].map((c, k) => `<span class="c${hot.has(k) ? " hl" : ""}" aria-hidden="true">${esc(c)}</span>`).join("");
})();
const stChars = $$(".c", st);

// 3) つくり方：縦スクロールを横の動きに変換する
const proc = $("#process"), track = $("#process-track"), procBar = $("#process-bar");

// 4) 連絡先の大きな文字：マウスが近い文字ほど持ち上がる
const wave = $("#wave");
wave.innerHTML = [...wave.textContent].map((c) => `<span class="ch" aria-hidden="true">${c === " " ? "&nbsp;" : esc(c)}</span>`).join("");
const waveChars = $$(".ch", wave);

function frame() {
  // カーソルは少し遅れてついてくる
  cur.x = lerp(cur.x, mouse.x, 0.22); cur.y = lerp(cur.y, mouse.y, 0.22);
  cursor.style.transform = `translate(${cur.x}px, ${cur.y}px)`;
  const pvx = lerp(pv.x, mouse.x + 24, 0.14); pv.vx = pvx - pv.x; pv.x = pvx; pv.y = lerp(pv.y, mouse.y - 150, 0.14);
  preview.style.left = `${pv.x}px`; preview.style.top = `${pv.y}px`;
  preview.style.rotate = `${clamp(pv.vx * 0.6, -12, 12)}deg`;

  const y = scrollY; vel = lerp(vel, y - lastY, 0.2); lastY = y;
  if (!isPaused()) {
    mqX -= 1 + vel * 0.35;
    const half = marquee.scrollWidth / 2;
    if (mqX < -half) mqX += half; if (mqX > 0) mqX -= half;
    marquee.style.transform = `translateX(${mqX}px) skewX(${clamp(-vel * 0.4, -14, 14)}deg)`;
  }

  // ステートメント
  const sr = st.getBoundingClientRect();
  const prog = clamp((innerHeight * 0.85 - sr.top) / (sr.height + innerHeight * 0.35), 0, 1);
  const n = Math.round(prog * stChars.length);
  for (let k = 0; k < stChars.length; k++) stChars[k].classList.toggle("on", k < n || isPaused());

  // 横スクロール
  if (innerWidth > 760) {
    const pr = proc.getBoundingClientRect();
    const total = proc.offsetHeight - innerHeight;
    const pp = clamp(-pr.top / total, 0, 1);
    const dist = track.scrollWidth - track.clientWidth;
    track.style.transform = `translateX(${-pp * dist}px)`;
    procBar.style.transform = `scaleX(${pp})`;
  }

  // 連絡先の文字
  if (!isPaused() && !isTouch) {
    for (const ch of waveChars) {
      const r = ch.getBoundingClientRect();
      const d = Math.hypot(mouse.x - (r.left + r.width / 2), mouse.y - (r.top + r.height / 2));
      const lift = d < 260 ? (1 - d / 260) : 0;
      ch.style.transform = `translateY(${-lift * 0.25}em) rotate(${lift * -8}deg)`;
    }
  }
  requestAnimationFrame(frame);
}

// 5) 見出し・文章がふわっと出る
function setupReveal() {
  $$(".sec-title .en, .sec-title .ja").forEach((el) => { el.innerHTML = `<span class="rise"><span>${el.innerHTML}</span></span>`; });
  $$(".sec-head, .note, .about-lead, .timeline li, .skills div, .lock, .contact-foot, .statement .label").forEach((el) => el.classList.add("fade"));
  const io = new IntersectionObserver((es) => es.forEach((e) => { if (e.isIntersecting) { e.target.classList.add("is-in"); e.target.querySelectorAll(".rise").forEach((r) => r.classList.add("is-in")); io.unobserve(e.target); } }), { rootMargin: "0px 0px -8% 0px" });
  $$(".fade").forEach((el) => io.observe(el));
}

// ============================
// 実務の実績（ログインした人だけ）
//   private-works.js の暗号化データを、入力されたIDとパスワードで復号して表示する。
//   正しいIDとパスワードがないと、ファイルを直接見ても中身は読めない。
// ============================
(() => {
  const form = $("#login"), msg = $("#login-msg"), area = $("#private"), lock = $("#lock");
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
      return { ...w, category: w.label || w.category, company: g ? g.label : "" };
    });
    shownWorks = works.concat(items);
    $("#private-note").textContent = content.note || "";
    let n = 0;
    $("#private-groups").innerHTML = content.groups.map((g) => {
      const list = items.map((w, i) => ({ w, i })).filter(({ w }) => w.group === g.key);
      if (!list.length) return "";
      return `<section class="pgroup" aria-label="${esc(g.label)}">
        <header class="pgroup-head"><h3>${esc(g.label)}</h3><span class="pgroup-en">${esc(g.en || "")}</span><span class="pgroup-count">( ${list.length} works )</span></header>
        ${g.summary ? `<p class="pgroup-summary">${esc(g.summary)}</p>` : ""}
        <ol class="index">${list.map(({ w, i }) => rowHTML(w, offset + i, n++)).join("")}</ol>
      </section>`;
    }).join("");
    lock.hidden = true;
    area.hidden = false;
    requestAnimationFrame(() => area.classList.add("is-open"));
  }

  async function tryLogin(id, pw, quiet) {
    if (!data || !crypto?.subtle) { msg.textContent = "このブラウザでは実績データを開けませんでした。"; return; }
    try {
      const content = await unlock(id, pw);
      try { sessionStorage.setItem(KEY, JSON.stringify([id, pw])); } catch {}
      show(content);
    } catch {
      if (!quiet) {
        msg.textContent = "IDかパスワードが違います。";
        form.classList.remove("is-shake"); void form.offsetWidth; form.classList.add("is-shake");
      }
      try { sessionStorage.removeItem(KEY); } catch {}
    }
  }

  form.addEventListener("submit", async (e) => {
    e.preventDefault();
    const btn = $("#login-btn");
    btn.disabled = true;
    msg.textContent = "確認しています…";
    await tryLogin($("#login-id").value.trim(), $("#login-pw").value, false);
    if (!area.hidden) msg.textContent = "";
    btn.disabled = false;
  });

  $("#logout").addEventListener("click", () => {
    try { sessionStorage.removeItem(KEY); } catch {}
    shownWorks = works.slice();
    $("#private-groups").innerHTML = "";
    area.hidden = true; area.classList.remove("is-open");
    lock.hidden = false;
    form.reset();
    msg.textContent = "ログアウトしました。";
  });

  // 同じタブで再読み込みしたときは、ログイン状態を復元
  try {
    const saved = JSON.parse(sessionStorage.getItem(KEY) || "null");
    if (saved) tryLogin(saved[0], saved[1], true);
  } catch {}
})();

// ============================
// 時計・年
// ============================
$("#year").textContent = new Date().getFullYear();
const clockEl = $("#clock");
const fmt = new Intl.DateTimeFormat("ja-JP", { timeZone: "Asia/Tokyo", hour: "2-digit", minute: "2-digit", second: "2-digit", hour12: false });
const tickClock = () => { clockEl.textContent = fmt.format(new Date()); };
tickClock(); setInterval(tickClock, 1000);

// ============================
// 読み込み画面 → 開始
// ============================
(async () => {
  const loader = $("#loader"), num = $("#loader-num");
  const seen = (() => { try { return sessionStorage.getItem("portfolio-intro"); } catch { return null; } })();
  const fontsReady = Promise.race([document.fonts?.ready || Promise.resolve(), new Promise((r) => setTimeout(r, 2500))]);
  if (seen || isPaused()) {
    loader.hidden = true;
  } else {
    const t0 = performance.now(), dur = 1500;
    await new Promise((res) => {
      const step = (now) => {
        const k = clamp((now - t0) / dur, 0, 1);
        num.textContent = String(Math.round((1 - Math.pow(1 - k, 3)) * 100)).padStart(3, "0");
        if (k < 1) requestAnimationFrame(step); else res();
      };
      requestAnimationFrame(step);
    });
  }
  await fontsReady;
  await Promise.all([
    document.fonts?.load?.('900 100px "Zen Old Mincho"', phrases.join("")),
    document.fonts?.load?.('400 100px "Yuji Boku"', phrases.join("") + "川上"),
  ]).catch(() => {});
  hero.init();
  setupReveal();
  applyPause();
  requestAnimationFrame(frame);
  if (!loader.hidden) {
    loader.classList.add("is-done");
    loader.addEventListener("transitionend", () => { loader.hidden = true; }, { once: true });
    try { sessionStorage.setItem("portfolio-intro", "1"); } catch {}
  }
})();
