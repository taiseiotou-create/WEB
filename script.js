// ============================
// 作品データ：ここを書き換えれば作品一覧が変わる
//   image: 画像ファイルのパス（例: "images/work1.jpg"）。空なら仮のグラフィックを表示
//   wide:  true にすると横長の大きいカードになる
// ============================
const works = [
  { title: "HARU Coffee", category: "branding", label: "Branding", wide: true,
    desc: "郊外の小さな焙煎所のロゴ・パッケージ・店舗サインを一式で設計。豆の産地ごとに色を変えるシステムを提案しました。",
    image: "", palette: ["#e2482d", "#f2c14e", "#1b1a17"] },
  { title: "季刊 まちと本", category: "editorial", label: "Editorial",
    desc: "地域の書店がつくる季刊誌のフォーマットデザイン。毎号表紙のイラストレーターが変わっても統一感が出る誌面ルールを設計。",
    image: "", palette: ["#2f5d50", "#e8dcc4", "#d97a3a"] },
  { title: "Kumo — 天気アプリ", category: "ui", label: "UI",
    desc: "雲の動きをそのままUIに取り入れた天気アプリのコンセプトデザイン。情報量を絞り、ひと目で今日の服装を決められる画面に。",
    image: "", palette: ["#3d5afe", "#bfd7ff", "#f4f1ea"] },
  { title: "Ateliers 展覧会ポスター", category: "editorial", label: "Editorial",
    desc: "若手工芸作家のグループ展のポスターとDM。素材感を活かすため、活版印刷での仕上がりを前提に設計しました。",
    image: "", palette: ["#1b1a17", "#e2482d", "#f4f1ea"] },
  { title: "Mori Skin Care", category: "branding", label: "Branding",
    desc: "植物由来のスキンケアブランドのVIとパッケージ。リサイクル紙の色をそのまま活かした2色刷りで展開。",
    image: "", palette: ["#7a8f6b", "#efe6d2", "#3b3a33"] },
  { title: "Sora Records", category: "branding", label: "Branding",
    desc: "インディーレーベルのロゴとレコードジャケットのシリーズデザイン。リリースごとに変化する図形モチーフで、並べたときの楽しさを演出。",
    image: "", palette: ["#1b1a17", "#bfd7ff", "#e2482d"] },
  { title: "Tabi Note", category: "ui", label: "UI", wide: true,
    desc: "旅の記録を地図と写真で残すアプリのUI/UX。旅程づくりから振り返りまで、ひとつの流れで使える構成にしました。",
    image: "", palette: ["#f2c14e", "#2f5d50", "#f4f1ea"] },
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
  return `<svg viewBox="0 0 400 500" preserveAspectRatio="xMidYMid slice" role="img" aria-label="${work.title} のイメージ">
    <rect width="400" height="500" fill="${b}"/>${shapes[i % shapes.length]}</svg>`;
}

function artFor(work, i) {
  return work.image
    ? `<img src="${work.image}" alt="${work.title}" loading="lazy">`
    : placeholderArt(work, i);
}

// 作品カードを並べる
const grid = document.getElementById("grid");
grid.innerHTML = works.map((w, i) => `
  <li class="${w.wide ? "wide" : ""}" data-category="${w.category}">
    <button class="card" data-index="${i}" aria-haspopup="dialog">
      <div class="card-art" aria-hidden="true">${artFor(w, i)}</div>
      <div class="card-meta">
        <span class="card-title">${w.title}</span>
        <span class="card-cat">${w.label}</span>
      </div>
    </button>
  </li>`).join("");

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
      if (!li.hidden) shown++;
    });
    // 画面読み上げソフト向けに表示件数を伝える
    document.getElementById("count").textContent = `${shown}件の作品を表示中`;
  });
});

// 作品をクリックすると詳細を表示
const modal = document.getElementById("modal");
grid.addEventListener("click", (e) => {
  const card = e.target.closest(".card");
  if (!card) return;
  const i = Number(card.dataset.index);
  const w = works[i];
  document.getElementById("modal-art").innerHTML = artFor(w, i);
  document.getElementById("modal-cat").textContent = w.label;
  document.getElementById("modal-title").textContent = w.title;
  document.getElementById("modal-desc").textContent = w.desc;
  modal.showModal();
});
document.getElementById("modal-close").addEventListener("click", () => modal.close());
// 背景（黒い部分）をクリックしても閉じる
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

document.getElementById("year").textContent = new Date().getFullYear();
