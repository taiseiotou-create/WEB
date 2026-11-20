// ============================
// 作品データ：ここを書き換えれば作品一覧が変わる
//   ※ 公開リポジトリのため、クライアント名は書かない（業種と内容のみ）
//   image: 画像ファイルのパス（例: "images/work1.jpg"）。空なら仮のグラフィックを表示
//   wide:  true にすると横長の大きいカードになる
// ============================
const works = [
  { title: "路面電車・車内ジャック広告", category: "ad", label: "Advertising", year: "代理店時代", wide: true,
    desc: "鹿児島の路面電車の車内を丸ごと使った広告ジャックを提案。乗った瞬間に世界観に包まれる空間づくりを目指しました。",
    role: "企画提案、キャッチコピー（24案）。チームで制作",
    point: "チームで広告賞を受賞（本人談。正式な賞名は確認中）",
    palette: ["#e2482d", "#f2c14e", "#1b1a17"] },
  { title: "自治体向けコンペ・広告企画", category: "ad", label: "Advertising", year: "代理店時代",
    desc: "官公庁・自治体向けの提案で、課題を整理して企画書とビジュアルを制作。テレビ・ラジオCMの企画とディレクションも担当しました。",
    role: "課題整理、企画書、ビジュアル、プレゼン",
    point: "伝えたい相手と課題から逆算した企画づくり",
    palette: ["#2f5d50", "#e8dcc4", "#d97a3a"] },
  { title: "啓発ポスター・グッズ", category: "ad", label: "Advertising", year: "代理店時代",
    desc: "啓発活動のシンボルカラーを使ったポスターやグッズを制作。色そのものがメッセージになるよう設計しました。",
    role: "ポスター・グッズのデザイン",
    point: "テーマカラーを軸に、媒体をまたいで統一感を出す",
    palette: ["#d94f8a", "#f6e3ea", "#1b1a17"] },
  { title: "求人誌・タウン情報誌・新聞広告", category: "editorial", label: "Editorial", year: "グループ在籍時",
    desc: "地域の求人誌やタウン情報誌、新聞広告、チラシ、ポスターなど、紙媒体の制作を幅広く経験しました。",
    role: "誌面・広告のデザイン",
    point: "限られた紙面で、読む人が迷わない情報整理",
    palette: ["#3d5afe", "#bfd7ff", "#f4f1ea"] },
  { title: "3ブランドの共通ロゴ", category: "branding", label: "Branding", year: "2026",
    desc: "関連する3つのブランドのロゴ案を、共通の花のモチーフで検討。店舗ブランドの案は花を3輪にして遊び心を加えました。",
    role: "ロゴ案の方向づけ、選定、修正ディレクション",
    point: "共通モチーフと、ブランドごとの見分けやすさの両立",
    palette: ["#7a8f6b", "#efe6d2", "#c9a227"] },
  { title: "植物モチーフのシンボルロゴ", category: "branding", label: "Branding", year: "2026",
    desc: "枝と葉を組み合わせたシンボルマーク。やさしさの中にも弱く見えない力強さが出るよう調整しました。",
    role: "案の選定、形の調整ディレクション、モノクロ展開の指示",
    point: "まず形の美しさを見せ、白黒・使用イメージは分けて提案",
    palette: ["#2f5d50", "#f4f1ea", "#7a8f6b"] },
  { title: "製造業・営業職の採用ページ", category: "web", label: "Web", year: "2026", wide: true,
    desc: "営業職を募集する製造業の採用ページ。PC・スマートフォンの画面と、ボタンなどの操作時の見え方を含むデザイン制作に関わりました。",
    role: "PC・SP・操作状態のデザイン制作（共同制作）",
    point: "働くイメージが湧く構成と、応募までの導線",
    palette: ["#1b1a17", "#f2c14e", "#e2482d"] },
  { title: "フランチャイズ募集LP", category: "web", label: "Web", year: "2026",
    desc: "フランチャイズ加盟店を募集するランディングページ（1ページで完結する宣伝用ページ）の制作に関わりました。",
    role: "デザインと実装（HTML・CSS・JavaScript）の制作、データ引き継ぎ（共同制作）",
    point: "加盟を検討する人が知りたい順に情報を並べる",
    palette: ["#e2482d", "#f4f1ea", "#2f5d50"] },
  { title: "格闘技イベントのLP・メインビジュアル", category: "web", label: "Web", year: "2026",
    desc: "格闘技イベントのランディングページ。PC・スマートフォン向けのデザインと、メインビジュアルの調整に関わりました。",
    role: "PC・SPデザイン、メインビジュアルの改訂（共同制作）",
    point: "スマホでも迫力が伝わるファーストビュー",
    palette: ["#1b1a17", "#e2482d", "#efebe2"] },
  { title: "物流会社のA3会社案内", category: "editorial", label: "Editorial", year: "2026",
    desc: "A3・4ページの会社案内の改訂に参加。ページをめくる流れに沿って、全体の構図を見直しました。",
    role: "4ページを通した構図の再設計（共同制作）",
    point: "1枚ずつではなく、冊子全体のリズムで設計",
    palette: ["#3d5afe", "#f4f1ea", "#f2c14e"] },
  { title: "スクロール連動サイトの試作", category: "web", label: "Web", year: "2026", wide: true,
    desc: "スクロールに合わせてシーンが切り替わるWebサイトのリニューアル試作。ホイールを1回まわすと1シーン進み、次の場面にぴたっと止まる動きを検討しました。",
    role: "動きの方向づけ、メニュー調整、提案案の選定",
    point: "動きで世界観を伝えつつ、操作に迷わせない",
    palette: ["#bfd7ff", "#1b1a17", "#e2482d"] },
  { title: "窓サービスのパンフレット・業界別販促物", category: "editorial", label: "Editorial", year: "2026",
    desc: "窓まわりのサービスを紹介する12ページのパンフレットと、業界ごとに内容を変えたA4両面の販促物の制作に関わりました。",
    role: "パンフレット・営業ツールの制作に参加",
    point: "読む人の業界に合わせて、事例と訴求を出し分け",
    palette: ["#7fb7d9", "#f4f1ea", "#2f5d50"] },
  { title: "靴ブランドのガレージ風ネットショップ", category: "web", label: "Web", year: "2026",
    desc: "靴の写真をガレージ風の背景と影で統一して見せる、ネットショップの見せ方を検討しました。",
    role: "見せ方の方向性、写真の補正方針、ショップ構成の検討",
    point: "補正の強さを調整し、商品の素材感を残す",
    palette: ["#5c5348", "#d9cdb8", "#c9a227"] },
  { title: "非営利団体のキャラクター展開", category: "branding", label: "Branding", year: "2026",
    desc: "アヒルのキャラクターを使った、映画ポスター風の壁紙などの展開を企画。キャラクターごとの役割が絵から伝わるよう方向づけました。",
    role: "世界観・配色・構図の方向づけ",
    point: "元の配色を守りながら、スマホ・PCなど媒体別の案を検討",
    palette: ["#1f3a6b", "#f2c14e", "#f4f1ea"] },
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
        <span class="card-cat">${w.year} · ${w.label}</span>
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
  document.getElementById("modal-cat").textContent = `${w.label} — ${w.year}`;
  document.getElementById("modal-role").textContent = w.role;
  document.getElementById("modal-point").textContent = w.point;
  document.getElementById("modal-title").textContent = w.title;
  document.getElementById("modal-desc").textContent = w.desc;
  modal.showModal();
});
document.getElementById("modal-close").addEventListener("click", () => modal.close());
// 背景（黒い部分）をクリックしても閉じる
modal.addEventListener("click", (e) => { if (e.target === modal) modal.close(); });

document.getElementById("year").textContent = new Date().getFullYear();
