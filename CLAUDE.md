# プロジェクト: WEB

デザイナー向けポートフォリオサイト。

## Claude への指示
- 回答・説明・コードコメント・コミットメッセージは**日本語**で書く。
- 変更する前に、何をするかを短く説明する。大きな変更は先に計画を見せる。
- 初心者にもわかるように、専門用語には簡単な補足をつける。
- 秘密情報（APIキー、パスワード、`.env`）はコミットしない。

## 構成（決まったら追記）
- 技術スタック: 素の HTML / CSS / JavaScript（ビルド不要）
- ファイル: `index.html`（構成）/ `styles.css`（見た目。色は先頭の `:root` で一括管理）/ `script.js`（作品データ `works` 配列と動き）
- 確認方法: `index.html` をブラウザで開く。Playwright でスクリーンショットを撮って見た目を確認する
- 作品の追加・変更は `script.js` の `works` 配列を編集する（`image` に画像パス、`glyph` にポスターに描く1文字、`palette` にポスターの色）
- 画像がない作品は、作品ごとにポスター（SVG）を自動生成して表示する
- 主な動き: トップの筆で書いたコピー（`phrases` 配列で言葉を変更。毛筆書体「Yuji Boku」を WebGL のシェーダーで加工し、筆のかすれ・にじみ・濃淡・墨の飛沫を表現。一文字ずつ書かれ、最後に朱の落款「川上」。マウスで濡れた墨がゆがむ。言葉を増やすときは `index.html` の Yuji Boku の読み込みURLの `text=` にも文字を足す）／読み込み画面／独自カーソル／流れる帯／ステートメントの文字送り／作品リストのプレビュー・シャッフル／「つくり方」の横スクロール。「動きを止める」ボタンと端末の「動きを減らす」設定で止まる
- 質感: 紙のムラ・繊維・フィルムの粒子を `styles.css` 末尾の「シズル感」で重ねている（SVGノイズ。濃さは `body::before` / `body::after` の opacity）。作品ポスターは `index.html` の `#riso` フィルターでリソグラフ風に。クリックでインクが飛ぶ
- デザインの参考調査は `docs/design-research.md`
- `works` 配列は**公開作品だけ**（自主制作・個人のサイト）。`url` に公開URLを入れると詳細に「サイトを見る」リンクが出る
- 会社員・業務委託の実績（広告代理店・マイナビ・アイドマ・ムスビ）は**非公開**。パスワードで暗号化した `private-works.js` に入っていて、サイトの「実務の実績」でIDとパスワードを入れた人だけが読める
  - 編集手順: ① `PORTFOLIO_ID=… PORTFOLIO_PASSWORD=… node tools/private-works.mjs decrypt` で `private/works.json` に戻す → ② 編集 → ③ 同じ書き方で `encrypt` → ④ `private-works.js` をコミット
  - `private/` フォルダ（暗号化前の元データ）とID・パスワードは**絶対にコミットしない**（`.gitignore` 済み）
  - パスワードを変えたいときは、①で復号したあと新しいパスワードで③を実行する

## Codex（ChatGPT）との連携
Claude が設計・指示役、Codex が実装・レビュー・調査の実行役。
- クラウドでは「WEB」環境を使う（OpenAIへの通信許可と Codex の自動インストール済み）。
- セッション開始時に `codex login status` を確認する。未ログインなら `codex login --device-auth` をバックグラウンドで起動し、表示されたURLとコードをユーザーに伝える。
- 調査・実装を頼む: `codex exec --skip-git-repo-check "依頼内容"`（書き込みを許すときは `--sandbox workspace-write`）
- レビューを頼む: `codex review`
- Claude と Codex に同じファイルを同時に編集させない。Codex の結果は Claude が確認してからユーザーに要約する。
