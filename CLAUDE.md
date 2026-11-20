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
- 作品の追加・変更は `script.js` の `works` 配列を編集する（`image` に画像パス、`wide: true` で横長カード）

## Codex（ChatGPT）との連携
Claude が設計・指示役、Codex が実装・レビュー・調査の実行役。
- クラウドでは「WEB」環境を使う（OpenAIへの通信許可と Codex の自動インストール済み）。
- セッション開始時に `codex login status` を確認する。未ログインなら `codex login --device-auth` をバックグラウンドで起動し、表示されたURLとコードをユーザーに伝える。
- 調査・実装を頼む: `codex exec --skip-git-repo-check "依頼内容"`（書き込みを許すときは `--sandbox workspace-write`）
- レビューを頼む: `codex review`
- Claude と Codex に同じファイルを同時に編集させない。Codex の結果は Claude が確認してからユーザーに要約する。
