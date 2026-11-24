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
// ファーストビュー：墨の点が集まって、文字になる（明朝体を網点のように点で組む）
//   「いろいろな要素を集めて、整える」——デザインの仕事そのものを、トップの動きで表す
//   1) 明朝体の文字を見えないキャンバスに描き、その形の上に点の置き場所を決める
//      （線の太い所は大きな点、細い所や端は小さな点＝網点のように）
//   2) 画面に散らばった墨の点が、一つずつ飛んできて置き場所に収まる
//   3) 点は1粒ずつGPU（画像処理用の部品）で描く：いびつな輪郭、紙の繊維に沿ったにじみ、
//      縁の墨だまり、濃淡。着地するとにじみがじわっと広がり、重なった所は墨が重なって濃くなる
//   4) 集まりきったら、朱の印鑑「剛志」が押される
//   5) マウスを近づけると点がよけて、離すとまた整列する
//   ※ WebGL が使えない環境では、普通の円で点を描く
// ============================
const phrases = ["伝わるかたち", "選ばれる理由", "心が動く仕掛け", "届く言葉"];
const DOT_FONT = '"Shippori Mincho B1", "Zen Old Mincho", serif';   // 太さの強弱が美しい明朝体
const hero = (() => {
  const cvs = $("#hero-canvas");
  const phraseEl = $("#hero-phrase");
  const sealEl = $("#hero-seal");
  let gl = cvs.getContext("webgl", { premultipliedAlpha: true, alpha: true, antialias: true });
  let ctx2 = null;
  let W = 0, H = 0, R = 1, p = 0, dots = [], fs = 100, lastBox = null, running = false, timer = 0, sealShown = false, gatherEnd = 0;
  const mrel = { x: -9999, y: -9999 };

  // ---------- 点の置き場所づくり ----------
  function layout(text) {
    const chars = [...text];
    const narrow = W < 700;
    const lines = narrow && chars.length > 4 ? [chars.slice(0, Math.ceil(chars.length / 2)), chars.slice(Math.ceil(chars.length / 2))] : [chars];
    const longest = Math.max(...lines.map((l) => l.length));
    return { lines, fs: Math.min((W * 0.8) / longest, H * (narrow ? 0.26 : 0.42)) };
  }
  function targets(text) {
    const L = layout(text); fs = L.fs;
    const c = document.createElement("canvas"); c.width = W; c.height = H;
    const o = c.getContext("2d");
    o.font = `800 ${fs}px ${DOT_FONT}`; o.textBaseline = "middle"; o.fillStyle = o.strokeStyle = "#000";
    o.lineWidth = fs * 0.012; o.lineJoin = "round";   // 細い線にも点がのるよう、ごくわずかに太らせる
    L.lines.forEach((l, k) => {
      const total = o.measureText(l.join("")).width;
      let x = W / 2 - total / 2;
      const y = H * 0.47 + (k - (L.lines.length - 1) / 2) * fs * 1.1;
      l.forEach((ch) => { const w = o.measureText(ch).width; o.fillText(ch, x, y); o.strokeText(ch, x, y); lastBox = { x1: x + w, y }; x += w; });
    });
    const a = o.getImageData(0, 0, W, H).data;
    const inside = (x, y) => x >= 0 && y >= 0 && x < W && y < H && a[((y | 0) * W + (x | 0)) * 4 + 3] > 110;
    // 線の太さ：上下左右にどこまで墨が続くかで、ざっくり測る
    const thick = (x, y) => {
      let n = 0; const st = fs * 0.012;
      for (let k = 1; k <= 6; k++) { const d = k * st; n += inside(x + d, y) + inside(x - d, y) + inside(x, y + d) + inside(x, y - d); }
      return n / 24;
    };
    const g = fs / 34, pts = [];   // 点の間隔。細かいほど明朝体の入りや払いまで表せる
    for (let y = g / 2; y < H; y += g * 0.86) {
      for (let x = ((y / g) & 1 ? g / 2 : 0); x < W; x += g) {
        const jx = x + (Math.random() - 0.5) * g * 0.4, jy = y + (Math.random() - 0.5) * g * 0.4;
        if (!inside(jx, jy)) continue;
        const t = thick(jx, jy);
        const big = Math.random() < 0.03 ? 1.5 : 1;   // ところどころ大きな墨の滴
        pts.push({ x: jx, y: jy, r: g * (0.24 + 0.62 * t) * (0.8 + Math.random() * 0.4) * big });   // 細い線は小さな点、太い線は大きな点
      }
    }
    // まとまりきらない点：文字のまわりに少しだけ
    const extra = Math.round(pts.length * 0.06);
    for (let k = 0; k < extra; k++) {
      const b = pts[(Math.random() * pts.length) | 0], ang = Math.random() * Math.PI * 2, d = fs * (0.15 + Math.random() * 0.35);
      pts.push({ x: b.x + Math.cos(ang) * d, y: b.y + Math.sin(ang) * d, r: g * (0.12 + Math.random() * 0.22) });
    }
    return pts;
  }

  // ---------- 点の動き ----------
  const ease = (t) => 1 - Math.pow(1 - t, 3);
  function assemble(text, scatterFrom) {
    const pts = targets(text).sort((a, b) => a.x - b.x + (Math.random() - 0.5) * fs * 0.6);   // だいたい左から順に集まる
    const now = performance.now();
    const old = dots;
    dots = pts.map((pt, k) => {
      const prev = old[k];
      const from = prev && scatterFrom ? { x: prev.x, y: prev.y } : { x: Math.random() * W, y: Math.random() * H };
      return {
        tx: pt.x, ty: pt.y, r: pt.r, x: from.x, y: from.y, sx: from.x, sy: from.y, vx: 0, vy: 0,
        bend: (Math.random() - 0.5) * fs * 1.4,           // 飛んでくる軌道のふくらみ
        delay: 250 + (k / pts.length) * 1500 + Math.random() * 250, dur: 650 + Math.random() * 500,
        seed: Math.random(), land: 0, spread: 0, arrived: false, start: now,
      };
    });
    gatherEnd = now + Math.max(...dots.map((d) => d.delay + d.dur)) + 200;
    sealShown = false; sealEl.classList.remove("is-on");
    placeSeal();
    if (isPaused()) settle();
    phraseEl.textContent = phrases[p];
    kick();
  }
  function settle() {   // 動きを止めているときは、最初から整列した状態
    dots.forEach((d) => { d.x = d.tx; d.y = d.ty; d.arrived = true; d.land = -1e9; d.spread = 1; });
    sealEl.classList.add("is-on", "no-anim"); sealShown = true; draw();
  }
  function scatter() {  // 言葉を切り替える前に、点がばらける
    const now = performance.now();
    dots.forEach((d) => {
      const ang = Math.random() * Math.PI * 2, sp = fs * (0.5 + Math.random() * 1.6);
      d.sx = d.x; d.sy = d.y; d.tx2 = clamp(d.x + Math.cos(ang) * sp, 0, W); d.ty2 = clamp(d.y + Math.sin(ang) * sp, 0, H);
      d.out = now; d.arrived = false;
    });
    sealEl.classList.remove("is-on", "no-anim");
  }
  function step(now) {
    const rect = cvs.getBoundingClientRect();
    mrel.x = mouse.x - rect.left; mrel.y = mouse.y - rect.top;
    let moving = false;
    for (const d of dots) {
      if (d.out) {                                   // ばらける途中
        const t = clamp((now - d.out) / 450, 0, 1), e = ease(t);
        d.x = lerp(d.sx, d.tx2, e); d.y = lerp(d.sy, d.ty2, e);
        moving = true; continue;
      }
      if (!d.arrived) {                              // 飛んでくる途中（ゆるい曲線を描く）
        const t = clamp((now - d.start - d.delay) / d.dur, 0, 1), e = ease(t);
        const mx = (d.sx + d.tx) / 2 + d.bend * 0.3, my = (d.sy + d.ty) / 2 - Math.abs(d.bend) * 0.4;
        d.x = (1 - e) * (1 - e) * d.sx + 2 * (1 - e) * e * mx + e * e * d.tx;
        d.y = (1 - e) * (1 - e) * d.sy + 2 * (1 - e) * e * my + e * e * d.ty;
        if (t >= 1) { d.arrived = true; d.land = now; }
        moving = true; continue;
      }
      // 着地後：にじみが広がる。マウスが近いとよけて、バネで戻る
      d.spread = clamp((now - d.land) / 1100, 0, 1);
      if (d.spread < 1) moving = true;
      if (mouse.active) {
        const dx = d.x - mrel.x, dy = d.y - mrel.y, d2 = dx * dx + dy * dy, RR = isTouch ? 60 : 95;
        if (d2 < RR * RR) { const dd = Math.sqrt(d2) || 1, f = ((RR - dd) / RR) * 3.2; d.vx += (dx / dd) * f; d.vy += (dy / dd) * f; }
      }
      d.vx += (d.tx - d.x) * 0.07; d.vy += (d.ty - d.y) * 0.07;
      d.vx *= 0.78; d.vy *= 0.78; d.x += d.vx; d.y += d.vy;
      if (Math.abs(d.vx) + Math.abs(d.vy) > 0.02) moving = true;
    }
    if (!sealShown && now > gatherEnd && !dots.some((d) => d.out)) { sealShown = true; sealEl.classList.add("is-on"); }
    return moving || now < gatherEnd + 1200;
  }

  // ---------- 描画（WebGL：点を1粒ずつ墨の滴として描く） ----------
  const VS = `attribute vec2 aPos; attribute vec3 aDot; uniform vec2 uRes; uniform float uS;
    varying vec3 vDot; varying float vR;
    void main(){ vec2 c = aPos / uRes * 2. - 1.; gl_Position = vec4(c.x, -c.y, 0., 1.); gl_PointSize = aDot.x * uS * 3.2; vDot = aDot; vR = aDot.x * uS; }`;
  const FS = `precision highp float;
    varying vec3 vDot; varying float vR; uniform vec3 uInk;
    float hash(vec2 p){ p = fract(p * vec2(123.34, 456.21)); p += dot(p, p + 45.32); return fract(p.x * p.y); }
    float noise(vec2 p){ vec2 i = floor(p), f = fract(p); vec2 u = f * f * (3. - 2. * f);
      return mix(mix(hash(i), hash(i + vec2(1., 0.)), u.x), mix(hash(i + vec2(0., 1.)), hash(i + vec2(1., 1.)), u.x), u.y); }
    float fbm(vec2 p){ float r = 0., a = .5; for (int i = 0; i < 4; i++){ r += a * noise(p); p = p * 2.1 + 7.3; a *= .5; } return r; }
    void main(){
      float seed = vDot.y * 97.;
      float spread = vDot.z;                         // 着地してからの、にじみの広がり 0→1
      vec2 q = (gl_PointCoord - .5) * 3.2;          // 点の半径を1とした座標
      float r = length(q), ang = atan(q.y, q.x);
      // いびつな輪郭：角度ごとに少しずつ出入りさせる
      vec2 ac = vec2(cos(ang), sin(ang));
      float edge = 1. + .16 * (noise(ac * 1.6 + seed) - .5) + .08 * (noise(ac * 4.5 + seed * 2.) - .5);
      // にじみ：紙の繊維に沿って、放射状にしみ出す
      float fib = fbm(vec2(ang * 7. + seed, r * 2.5 + seed));
      float reach = edge + spread * (.12 + .45 * fib * fib);
      float core = 1. - smoothstep(edge - .05, edge + .05, r);
      float halo = (1. - smoothstep(edge, reach, r)) * (1. - core);
      // 濃淡：縁は墨だまりで濃く、内側は少し薄い。紙の凹凸で細かくムラが出る
      float tone = .9 + .1 * smoothstep(.55, edge, r);
      tone *= .9 + .1 * noise(q * 4. + seed);
      float a = core * tone + halo * (.3 + .35 * fib) * spread;
      // 小さな飛沫
      float sp = step(.985, hash(floor((q + seed) * 2.2))) * step(edge + .2, r) * step(r, 1.55);
      a = max(a, sp * .7);
      // 濡れているうちは少し濃い
      a = clamp(a * (1.08 - .08 * spread), 0., 1.);
      gl_FragColor = vec4(uInk * a, a);
    }`;
  let prog = null, buf = null, data = new Float32Array(0), U = {}, A = {};
  function compile(type, src) { const sh = gl.createShader(type); gl.shaderSource(sh, src); gl.compileShader(sh); if (!gl.getShaderParameter(sh, gl.COMPILE_STATUS)) throw new Error(gl.getShaderInfoLog(sh)); return sh; }
  function setupGL() {
    prog = gl.createProgram();
    gl.attachShader(prog, compile(gl.VERTEX_SHADER, VS)); gl.attachShader(prog, compile(gl.FRAGMENT_SHADER, FS));
    gl.linkProgram(prog);
    if (!gl.getProgramParameter(prog, gl.LINK_STATUS)) throw new Error(gl.getProgramInfoLog(prog));
    gl.useProgram(prog);
    buf = gl.createBuffer();
    A.pos = gl.getAttribLocation(prog, "aPos"); A.dot = gl.getAttribLocation(prog, "aDot");
    ["uRes", "uS", "uInk"].forEach((k) => { U[k] = gl.getUniformLocation(prog, k); });
    gl.enable(gl.BLEND); gl.blendFunc(gl.ONE, gl.ONE_MINUS_SRC_ALPHA);   // 墨が重なると濃くなる
  }
  const hex = (h) => { const m = h.trim().replace("#", "").match(/.{2}/g); return m ? m.map((x) => parseInt(x, 16) / 255) : [0.08, 0.08, 0.075]; };
  function colors() { if (gl) gl.uniform3fv(U.uInk, hex(getComputedStyle(document.documentElement).getPropertyValue("--ink"))); }
  function draw() {
    if (!gl) return draw2d();
    if (data.length < dots.length * 5) data = new Float32Array(dots.length * 5);
    dots.forEach((d, k) => { const i = k * 5; data[i] = d.x * R; data[i + 1] = d.y * R; data[i + 2] = d.r; data[i + 3] = d.seed; data[i + 4] = d.spread; });
    gl.viewport(0, 0, cvs.width, cvs.height);
    gl.clearColor(0, 0, 0, 0); gl.clear(gl.COLOR_BUFFER_BIT);
    gl.uniform2f(U.uRes, cvs.width, cvs.height); gl.uniform1f(U.uS, R);
    gl.bindBuffer(gl.ARRAY_BUFFER, buf);
    gl.bufferData(gl.ARRAY_BUFFER, data.subarray(0, dots.length * 5), gl.DYNAMIC_DRAW);
    gl.enableVertexAttribArray(A.pos); gl.vertexAttribPointer(A.pos, 2, gl.FLOAT, false, 20, 0);
    gl.enableVertexAttribArray(A.dot); gl.vertexAttribPointer(A.dot, 3, gl.FLOAT, false, 20, 8);
    gl.drawArrays(gl.POINTS, 0, dots.length);
  }
  function draw2d() {   // WebGL が使えないとき
    ctx2 = ctx2 || cvs.getContext("2d");
    if (!ctx2) return;
    ctx2.setTransform(R, 0, 0, R, 0, 0); ctx2.clearRect(0, 0, W, H);
    ctx2.fillStyle = getComputedStyle(document.documentElement).getPropertyValue("--ink");
    for (const d of dots) { ctx2.beginPath(); ctx2.arc(d.x, d.y, d.r, 0, Math.PI * 2); ctx2.fill(); }
  }
  function tick(now) {
    if (!running) return;
    const more = step(now);
    draw();
    if (more) requestAnimationFrame(tick); else running = false;
  }
  let ready = false;   // 初期化が終わるまでは動かさない
  function kick() { if (ready && !running && !isPaused() && inView) { running = true; requestAnimationFrame(tick); } }
  let inView = true;
  new IntersectionObserver(([e]) => { inView = e.isIntersecting; if (inView) kick(); }).observe(cvs);
  addEventListener("pointermove", (e) => { if (inView && e.clientY < innerHeight) kick(); }, { passive: true });

  // ---------- 印鑑「剛志」 ----------
  function makeSeal() {
    // 九畳篆（きゅうじょうてん）風：文字を方眼の升目に組み替え、四角い枠いっぱいに詰めた陽刻の印影
    const size = 240, px = size * 2, c = sealEl, o = c.getContext("2d");
    c.width = c.height = px;
    const red = [196, 46, 26];
    // 1) 文字の形を升目に置き換える（升目ごとに、墨の割合が多ければ塗る）
    const N = 21;                                      // 1文字あたりの升目の数（横）。細かいほど線が細く折れ曲がる
    const glyphGrid = (ch, cols, rows) => {
      // 大きく描いた文字の、実際に墨がある範囲を測り、升目の範囲いっぱいに合わせる
      const big = document.createElement("canvas"); big.width = big.height = 400;
      const bo = big.getContext("2d");
      bo.font = `500 320px "Zen Kaku Gothic New", sans-serif`; bo.textAlign = "center"; bo.textBaseline = "middle";
      bo.fillText(ch, 200, 210);
      const bd = bo.getImageData(0, 0, 400, 400).data;
      let x0 = 400, y0 = 400, x1 = 0, y1 = 0;
      for (let y = 0; y < 400; y++) for (let x = 0; x < 400; x++) if (bd[(y * 400 + x) * 4 + 3] > 100) { x0 = Math.min(x0, x); x1 = Math.max(x1, x); y0 = Math.min(y0, y); y1 = Math.max(y1, y); }
      const g = document.createElement("canvas"); g.width = cols * 20; g.height = rows * 20;
      const go = g.getContext("2d");
      go.drawImage(big, x0, y0, x1 - x0 + 1, y1 - y0 + 1, 0, 0, g.width, g.height);
      const d = go.getImageData(0, 0, g.width, g.height).data, cells = [];
      for (let r = 0; r < rows; r++) for (let q = 0; q < cols; q++) {
        let n = 0;
        for (let y = 0; y < 20; y += 2) for (let x = 0; x < 20; x += 2) n += d[((r * 20 + y) * g.width + q * 20 + x) * 4 + 3] > 110;
        cells.push(n / 100 > 0.24);
      }
      return cells;
    };
    const m = 16, frame = 15, inner = size - (m + frame) * 2, gap = 6;
    const cols = N, rows = Math.round(N * 0.5);        // 縦に2文字なので、1文字は横長の升目
    const cw = (inner - gap * 2) / cols, ch = (inner - gap * 3) / (rows * 2);
    const top = glyphGrid("剛", cols, rows), bottom = glyphGrid("志", cols, rows);
    // 2) 描く（2倍の細かさ）
    o.setTransform(2, 0, 0, 2, 0, 0);
    o.clearRect(0, 0, size, size);
    o.fillStyle = `rgb(${red})`;
    // 太い外枠（角はわずかに丸く）
    const rr = 10;
    o.beginPath(); o.roundRect ? o.roundRect(m, m, size - m * 2, size - m * 2, rr) : o.rect(m, m, size - m * 2, size - m * 2);
    o.roundRect ? o.roundRect(m + frame, m + frame, inner, inner, 3) : o.rect(m + frame, m + frame, inner, inner);
    o.fill("evenodd");
    // 升目の文字
    const x0 = m + frame + gap, y0 = m + frame + gap;
    const drawCells = (cells, oy) => {
      cells.forEach((on, k) => {
        if (!on) return;
        const q = k % cols, r = (k / cols) | 0;
        o.fillRect(x0 + q * cw - 0.3, oy + r * ch - 0.3, cw + 0.6, ch + 0.6);   // 隣の升目とつながるよう少し重ねる
      });
    };
    drawCells(top, y0);
    drawCells(bottom, y0 + rows * ch + gap);
    // 上下の文字の間に細い仕切り線
    o.fillRect(x0, y0 + rows * ch + gap * 0.5 - 1, inner - gap * 2, 2);
    // 3) 朱肉の質感：押しムラ、紙の凹凸でのかすれ、縁の欠け、わずかなにじみ
    o.setTransform(1, 0, 0, 1, 0, 0);
    const img = o.getImageData(0, 0, px, px), d = img.data;
    const vnoise = (cs) => {
      const gw = Math.ceil(px / cs) + 2, grid = Float32Array.from({ length: gw * gw }, () => Math.random());
      return (x, y) => { const gx = x / cs, gy = y / cs, ix = gx | 0, iy = gy | 0, fx = gx - ix, fy = gy - iy;
        const sx = fx * fx * (3 - 2 * fx), sy = fy * fy * (3 - 2 * fy);
        return lerp(lerp(grid[iy * gw + ix], grid[iy * gw + ix + 1], sx), lerp(grid[(iy + 1) * gw + ix], grid[(iy + 1) * gw + ix + 1], sx), sy); };
    };
    const big = vnoise(70), mid = vnoise(18), fine = vnoise(4);
    for (let y = 0; y < px; y++) for (let x = 0; x < px; x++) {
      const i = (y * px + x) * 4; if (!d[i + 3]) continue;
      const edgeDist = Math.min(x, y, px - x, py(y)) ; // 外周からの距離
      const press = big(x, y) * 0.55 + mid(x, y) * 0.3 + fine(x, y) * 0.25;   // 押す力のムラ
      let a = clamp((press - 0.2) * 3.4, 0, 1);
      if (edgeDist < 60) a *= clamp((mid(x + 400, y) * 0.9 + fine(x, y) * 0.5 - 0.25) * 2.5 + edgeDist / 60, 0, 1);   // 縁は欠けやすい
      d[i + 3] = d[i + 3] * (0.25 + 0.75 * a) * (Math.random() < 0.015 ? 0.2 : 1);
      d[i] = red[0]; d[i + 1] = red[1]; d[i + 2] = red[2];
    }
    function py(y) { return px - y; }
    o.putImageData(img, 0, 0);
  }
  function placeSeal() {
    if (!lastBox) return;
    const s = fs * 0.5;
    sealEl.style.width = sealEl.style.height = `${s}px`;
    let left = lastBox.x1 + fs * 0.14, top = lastBox.y + fs * 0.05;
    if (left + s > W - 10) { left = W - s - 16; top = lastBox.y + fs * 0.62; }   // 右に余白がないときは、文字の下に押す
    sealEl.style.left = `${left}px`;
    sealEl.style.top = `${top}px`;
  }

  // ---------- 切り替え・初期化 ----------
  function next() {
    p = (p + 1) % phrases.length;
    restartTimer();
    if (isPaused()) { assemble(phrases[p], false); return; }
    scatter(); kick();
    setTimeout(() => { dots.forEach((d) => { delete d.out; delete d.start; }); assemble(phrases[p], true); }, 480);
  }
  function restartTimer() { clearInterval(timer); if (!isPaused()) timer = setInterval(next, 10000); }
  function resize() {
    R = Math.min(devicePixelRatio || 1, 2);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = Math.round(W * R); cvs.height = Math.round(H * R);
  }
  let rt, lastW = 0;
  addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(() => { if (cvs.clientWidth !== lastW) { lastW = cvs.clientWidth; resize(); assemble(phrases[p], false); settle(); } }, 200); });
  cvs.addEventListener("click", () => { getSelection()?.removeAllRanges(); next(); });
  cvs.addEventListener("mousedown", (e) => { if (e.detail > 1) e.preventDefault(); });   // ダブルクリックで文字が選択されないように
  $("#hero-next").addEventListener("click", next);
  pauseListeners.push((paused) => { if (paused) { clearInterval(timer); settle(); } else restartTimer(); });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { colors(); draw(); });
  return {
    init() {
      lastW = cvs.clientWidth;
      if (gl) { try { setupGL(); colors(); } catch (err) { console.warn(err); gl = null; } }
      resize(); makeSeal(); ready = true;
      assemble(phrases[p], false);
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
    document.fonts?.load?.('800 100px "Shippori Mincho B1"', phrases.join("")),
    document.fonts?.load?.('700 100px "Zen Kaku Gothic New"', "剛志"),
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
