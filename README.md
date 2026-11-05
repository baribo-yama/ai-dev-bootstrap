# ai-dev-bootstrap

新しいプロジェクトに、AI 駆動開発の基盤を作る Claude Code の skill。

`/ai-dev-bootstrap` を実行すると、いくつかの質問に答えるだけで、次の進め方に必要なファイルが生成される。

1. `/spec` で、作りたいものの要件を投げる。Claude Code が `docs/SPEC.md` の下書きを出し、人間が直して、仕様が決まる（判断が分かれた点は `docs/adr/` に残る）。
2. `/plan-phases` で、確定した仕様からフェーズとタスク（`docs/PHASES.md`）を作る。
3. `/plan-issues` で、タスクを GitHub Issue にする。
4. 人間が内容を確認し、実装を任せる issue に `ai-ready` ラベルを付ける。
5. `/next-task` で、Claude Code が issue を 1 つ実装して PR を出し、止まる。
6. 人間が PR を確認してマージする。4 に戻る。

## インストール
Claude Code の設定フォルダの `skills/` に、クローンする。

```
git clone https://github.com/baribo-yama/ai-dev-bootstrap ~/.claude/skills/ai-dev-bootstrap
```

`CLAUDE_CONFIG_DIR` を使っている場合は、`~/.claude` をそのフォルダに読み替える。クローンしたあと、Claude Code を開き直す。

更新するときは、クローンしたフォルダで `git pull` する。

## 使い方
1. 新しいプロジェクトのフォルダ（git リポジトリ）で Claude Code を開く。
2. `/ai-dev-bootstrap` を実行する。
3. 質問（プロジェクト名、技術スタック、型チェック・lint・テストのコマンドなど）に答える。「あとで書く」も選べる。
4. 生成されたファイルを確認し、CI の環境セットアップを書いて、PR にして入れる。
5. `/spec <作りたいものの要件>` で仕様を決めるところから始める。

既存のファイルは上書きしない。ぶつかるものは一覧にして、飛ばしてよいか聞く。

## 生成されるもの
| 場所 | 内容 |
| --- | --- |
| `CLAUDE.md` | 開発のルール。型チェック・lint・テストのコマンドは「検証コマンド」に書く |
| `.claude/commands/` | `/spec`、`/plan-phases`、`/plan-issues`、`/next-task`、`/adr`、`/log` |
| `.claude/settings.json` | 許可と禁止のコマンド（`git push --force`、`gh pr merge`、`.env` の読み取りなど）、型チェックのフック（任意） |
| `.github/` | issue のフォーム、PR のテンプレート、CI（`check` ジョブ） |
| `docs/` | `SPEC.md`、`PHASES.md`、`DEVLOG.md`、`adr/`（テンプレートと共通の ADR 1 本）、`todo/` |
| `scripts/` | `protect-main.sh`（main のブランチ保護）、`typecheck-hook.mjs`（任意） |
| `README.md`、`.gitignore`、`.gitattributes` | 骨組み |

## 前提
- git、GitHub のアカウント、`gh`（GitHub CLI、ログイン済み）、Claude Code。
- フックを使う場合は Node.js。

## この skill がしないこと
- CI の環境セットアップ（言語のバージョン、依存のインストール）。生成された `ci.yml` の `# TODO` に、プロジェクトに合わせて書く。書くまで CI は失敗する。
- コミット、push、リモートリポジトリの作成。
- ブランチ保護の設定。生成された `scripts/protect-main.sh` を、人間が実行する。private リポジトリでは、有料プランが必要なことがある。

## ライセンス
[MIT](LICENSE)
