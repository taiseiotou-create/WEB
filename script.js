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
  return `<svg viewBox="0 0 600 750" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${t} のイメージ">
    <rect width="600" height="750" fill="${b}"/>${layouts[i % layouts.length]}
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
// ファーストビュー：粒でできたコピー
//   文字を見えないキャンバスに描き、色のある点の位置を「目的地」として集める。
//   粒はバネのように目的地へ戻ろうとし、マウスが近づくと押しのけられる。
// ============================
const phrases = ["伝わるかたち", "選ばれる理由", "心が動く仕掛け", "届く言葉"];
const hero = (() => {
  const cvs = $("#hero-canvas"), ctx = cvs.getContext("2d");
  const phraseEl = $("#hero-phrase");
  let W = 0, H = 0, dpr = 1, p = 0, parts = [], step = 6, running = false, last = 0, timer = 0;
  let ink = "#141413", accent = "#ff4a1c";
  const readColors = () => {
    const cs = getComputedStyle(document.documentElement);
    ink = cs.getPropertyValue("--ink").trim() || ink;
    accent = cs.getPropertyValue("--accent").trim() || accent;
  };
  function targets(text) {
    const off = document.createElement("canvas");
    off.width = W; off.height = H;
    const o = off.getContext("2d");
    const chars = [...text].length;
    const vertical = W < 700;              // スマホでは2行に分けて大きく
    const lines = vertical && chars > 4 ? [text.slice(0, Math.ceil(chars / 2)), text.slice(Math.ceil(chars / 2))] : [text];
    const longest = Math.max(...lines.map((l) => [...l].length));
    const fs = Math.min((W * 0.88) / longest, (H * (vertical ? 0.26 : 0.42)));
    o.font = `900 ${fs}px "Zen Old Mincho", serif`;
    o.textAlign = "center"; o.textBaseline = "middle"; o.fillStyle = "#000";
    lines.forEach((l, k) => o.fillText(l, W / 2, H * 0.47 + (k - (lines.length - 1) / 2) * fs * 1.05));
    step = Math.max(4, Math.round(fs / (isTouch ? 15 : 19)));
    const data = o.getImageData(0, 0, W, H).data, pts = [];
    for (let y = 0; y < H; y += step) for (let x = 0; x < W; x += step) if (data[(y * W + x) * 4 + 3] > 140) pts.push([x, y]);
    return pts;
  }
  function setPhrase(scatter) {
    const pts = targets(phrases[p]);
    phraseEl.textContent = phrases[p];
    // 粒の数を目的地の数に合わせる（足りなければ画面の外から追加）
    while (parts.length < pts.length) parts.push({ x: Math.random() * W, y: H + Math.random() * 200, vx: 0, vy: 0, tx: 0, ty: 0, hot: Math.random() < 0.09 });
    parts.length = Math.max(pts.length, 1);
    pts.sort(() => Math.random() - 0.5).forEach((pt, k) => { parts[k].tx = pt[0]; parts[k].ty = pt[1]; });
    if (scatter) parts.forEach((q) => { const a = Math.random() * Math.PI * 2, s = 8 + Math.random() * 22; q.vx += Math.cos(a) * s; q.vy += Math.sin(a) * s; });
    if (isPaused()) { parts.forEach((q) => { q.x = q.tx; q.y = q.ty; }); draw(); }
  }
  function resize() {
    dpr = Math.min(devicePixelRatio || 1, 2);
    W = cvs.clientWidth; H = cvs.clientHeight;
    cvs.width = W * dpr; cvs.height = H * dpr;
    ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
    readColors();
    setPhrase(false);
  }
  function draw() {
    ctx.clearRect(0, 0, W, H);
    const s = step * 0.62;
    ctx.fillStyle = ink;
    for (const q of parts) if (!q.hot) ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);
    ctx.fillStyle = accent;
    for (const q of parts) if (q.hot) ctx.fillRect(q.x - s / 2, q.y - s / 2, s, s);
  }
  function tick(now) {
    if (!running) return;
    const dt = Math.min(2, (now - last) / 16.7 || 1); last = now;
    const r = cvs.getBoundingClientRect();
    const mx = mouse.x - r.left, my = mouse.y - r.top, R = isTouch ? 70 : 110;
    for (const q of parts) {
      q.vx += (q.tx - q.x) * 0.055 * dt; q.vy += (q.ty - q.y) * 0.055 * dt;
      if (mouse.active) {
        const dx = q.x - mx, dy = q.y - my, d2 = dx * dx + dy * dy;
        if (d2 < R * R) { const d = Math.sqrt(d2) || 1, f = ((R - d) / R) * 5 * dt; q.vx += (dx / d) * f; q.vy += (dy / d) * f; }
      }
      q.vx *= 0.8; q.vy *= 0.8; q.x += q.vx * dt; q.y += q.vy * dt;
    }
    draw();
    requestAnimationFrame(tick);
  }
  function start() { if (running || isPaused()) return; running = true; last = performance.now(); requestAnimationFrame(tick); }
  function stop() { running = false; }
  function next() { p = (p + 1) % phrases.length; setPhrase(!isPaused()); restartTimer(); }
  function restartTimer() { clearInterval(timer); if (!isPaused()) timer = setInterval(next, 7000); }
  // 画面に見えている間だけ動かす（電池と処理の節約）
  new IntersectionObserver(([e]) => { if (e.isIntersecting) start(); else stop(); }).observe(cvs);
  cvs.addEventListener("click", next);
  $("#hero-next").addEventListener("click", next);
  pauseListeners.push((paused) => { if (paused) { stop(); parts.forEach((q) => { q.x = q.tx; q.y = q.ty; }); draw(); clearInterval(timer); } else { start(); restartTimer(); } });
  matchMedia("(prefers-color-scheme: dark)").addEventListener("change", () => { readColors(); draw(); });
  let rt; addEventListener("resize", () => { clearTimeout(rt); rt = setTimeout(resize, 150); });
  return { init() { resize(); restartTimer(); start(); } };
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
  await document.fonts?.load?.('900 100px "Zen Old Mincho"', phrases.join("")).catch(() => {});
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
