---
name: ai-dev-bootstrap
description: 新しいプロジェクトに、AI 駆動開発の基盤（CLAUDE.md、.claude/ のコマンドと設定、.github/ の issue・PR テンプレートと CI、docs/ の骨組み、README）を作る。/ai-dev-bootstrap で手動で呼ぶ。
disable-model-invocation: true
---

# ai-dev-bootstrap

`/plan-issues` → 人間が `ai-ready` を付ける → `/next-task` → 人間がマージ、という進め方の基盤を、今のフォルダに作る。
テンプレートは `templates/` にあり、**生成先と同じパスで置いてある**。コピーするときは、パスを変えず、末尾の `.template` だけ外す（`CLAUDE.md.template` → `CLAUDE.md`、`README.md.template` → `README.md`）。

CI の環境セットアップ（言語のバージョン、依存のインストール）は、この skill では作らない。

## 1. 事前確認
- 今のフォルダが git リポジトリか確かめる。違えば `git init -b main` を提案する（勝手にしない）。
- `gh auth status` で GitHub にログインしているか確かめる。違えば、人間に `gh auth login` を頼む（生成は続けてよい）。
- 生成先に、同じパスのファイルがすでにあるか調べる。**既存のファイルは上書きしない。** ぶつかるものを一覧にして、飛ばしてよいか聞く。

## 2. 質問
次を聞く。まとめて聞いてよい。「あとで書く」と答えた項目は、`<!-- 書くこと: ... -->` のコメントを残す。

| # | 項目 | 入る場所 |
|---|---|---|
| 1 | プロジェクト名 | `{{プロジェクト名}}`（CLAUDE.md、README.md、docs/SPEC.md） |
| 2 | 何を作るか、何を最優先にするか | CLAUDE.md の冒頭、README.md |
| 3 | 技術スタック | CLAUDE.md |
| 4 | ディレクトリの構成 | CLAUDE.md |
| 5 | 型チェック・lint・テストのコマンド（3 つ） | `{{型チェックコマンド}}`、`{{lintコマンド}}`、`{{テストコマンド}}`（CLAUDE.md、ci.yml、フック） |
| 6 | 設計の約束（データの持ち方、境界、性能、範囲外の機能） | CLAUDE.md |
| 7 | 秘密情報の置き場所（ローカルと本番） | CLAUDE.md |
| 8 | 読ませないファイルの追加（`.env` 系のほか） | `.claude/settings.json` の deny、`.gitignore` |
| 9 | プロジェクト固有の禁止 | CLAUDE.md |
| 10 | 型チェックのフックを入れるか。入れるなら対象の拡張子（例 `ts\|tsx`） | `{{フック対象の拡張子}}` |

## 3. 生成
1. `templates/` のファイルを、1 の確認で飛ばしたもの以外すべてコピーし、`{{...}}` とコメントを答えで置き換える。
2. `.claude/settings.json` の `allow` に、検証コマンドの先頭語を `Bash(<先頭語>:*)` で足す（例 `Bash(pnpm:*)`）。8 の答えは `deny` に `Read(./<パス>)` で足す。
3. フックを入れないなら、`scripts/typecheck-hook.mjs` を作らず、`.claude/settings.json` の `hooks` ブロックを消す。
4. `scripts/protect-main.sh` に実行権限は付けない（`sh scripts/protect-main.sh` で実行する）。
5. `docs/adr/0001-issue-driven-workflow.md` の日付を今日にする。

## 4. 検証
生成したあとに、次を確かめて結果を報告する。確かめていないものは、そう書く。
- `{{` が、どの生成物にも残っていない（`grep -rn '{{' .`）。
- `.claude/settings.json` が JSON として読める。
- `ci.yml`、`.github/ISSUE_TEMPLATE/task.yml` が YAML として読める（YAML を読める道具がなければ「目視のみ」と書く）。
- `.claude/commands/` の 4 つに `description` がある。
- フックを入れたなら、`echo '{"tool_input":{"file_path":"x.zzz"}}' | node scripts/typecheck-hook.mjs` が終了コード 0 で終わる。
- 飛ばしたファイルが上書きされていない。

## 5. 報告
作ったファイルの一覧と、残したコメント（あとで書く項目）を出す。そのうえで、人間のやることを伝える。
1. `.github/workflows/ci.yml` の `# TODO` に、環境のセットアップを書く。書くまで CI は失敗する。
2. この一式を、`chore/dev-workflow` のようなブランチで PR にして、CI が通ることを確かめてからマージする。
3. マージ後に `sh scripts/protect-main.sh --dry-run` で内容を見て、`sh scripts/protect-main.sh` を実行する。
4. `docs/SPEC.md` と `docs/PHASES.md` を書く。そのあと `/plan-issues` で issue にする。

**コミット、push、リモートリポジトリの作成は、この skill ではしない。**

## 注意（つまずきやすい点）
- **空のワークスペースの CI は緑になる。** `pnpm -r test` などは、対象のパッケージが 0 件だと成功する。最初のタスクで、CI が実際にコマンドを実行していることを確かめる。
- **「要確認」の検出。** `/next-task` は issue 本文の「要確認」の文字で止まる。`要確認:` と `要確認（…）:` のどちらの書き方でも止まるが、決まったら「決定」に書き換えないと止まり続ける。
- **`rm -rf` は deny にある。** 自分のコマンドが止まったら、`rm -rf` を使っていないか見る。
- **フックはうるさい。** テストを先に書く途中は、型エラーが出るのが正しい。Claude に「編集は止まらない」と伝わっているので、通常は無視してよい。
- **フックのコマンドは JS の文字列に入る。** コマンドに `"` や `\` が含まれるときは、`scripts/typecheck-hook.mjs` に差し込むときにエスケープする。
- **ブランチ保護は、private リポジトリでは有料プランが要る。** `protect-main.sh` が 403 で失敗したら、プランを確認する（public にするか、保護をあきらめる）。
- **Windows。** `.gitattributes` で改行を LF に固定してある。`/tmp` は Git Bash と Node で別の場所を指すので、一時ファイルは標準入力かスクラッチパッドで渡す。
- **見えるプロファイル。** この skill は、`CLAUDE_CONFIG_DIR` で指す設定フォルダ（未設定なら `~/.claude/`）の `skills/` に置く。別の設定フォルダで開いたセッションには出ない。
