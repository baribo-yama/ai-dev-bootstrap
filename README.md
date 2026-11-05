# ai-dev-bootstrap

新しいプロジェクトに、AI 駆動開発の基盤を作る Claude Code の skill。

`/ai-dev-bootstrap` を実行して、いくつかの質問に答えると、次の進め方に必要なファイルが生成される。

## 目次
- [何ができるか](#何ができるか)
- [前提条件](#前提条件)
- [インストール](#インストール)
- [使い方](#使い方)
- [生成後の流れ](#生成後の流れ)
- [生成されるフォルダ構成](#生成されるフォルダ構成)
- [生成されるファイルの説明](#生成されるファイルの説明)
- [コマンドの詳細](#コマンドの詳細)
- [安全のための仕組み](#安全のための仕組み)
- [この skill がしないこと](#この-skill-がしないこと)
- [つまずいたとき](#つまずいたとき)
- [ライセンス](#ライセンス)

## 何ができるか
仕様を決めてから PR になるまでを、次の流れにそろえる。

```
/spec → /plan-phases → /plan-issues → 人間が ai-ready を付ける → /next-task → 人間がマージ
                                              ↑                                    │
                                              └────────────────────────────────────┘
```

1. `/spec` で、作りたいものの要件を投げる。Claude Code が `docs/SPEC.md` の下書きを出し、人間が直して、仕様が決まる。判断が分かれた点は `docs/adr/` に残る。
2. `/plan-phases` で、確定した仕様からフェーズとタスク（`docs/PHASES.md`）を作る。
3. `/plan-issues` で、タスクを GitHub Issue にする。
4. 人間が内容を確認し、実装を任せる issue に `ai-ready` ラベルを付ける。
5. `/next-task` で、Claude Code が issue を 1 つ実装して PR を出し、止まる。
6. 人間が PR を確認してマージする。4 に戻る。

Claude Code に任せるのは「実装して PR を出すところまで」。仕様の確定、`ai-ready` の判断、マージは、人間がする。

## 前提条件
使う前に、次がそろっているか確かめる。そろっていないときの案内も、あわせて書く。

| 必要なもの | 確かめ方 | そろっていないとき |
| --- | --- | --- |
| Claude Code | `claude --version` | [公式のドキュメント](https://docs.claude.com/en/docs/claude-code/overview)に従って入れる。 |
| git | `git --version` | [git-scm.com](https://git-scm.com/downloads) から入れる。Windows では Git for Windows を入れると Git Bash も付いてくる。 |
| GitHub のアカウント | — | [github.com](https://github.com/signup) で作る。 |
| `gh`（GitHub CLI） | `gh --version` | [cli.github.com](https://cli.github.com/) から入れる。`winget install GitHub.cli`、`brew install gh` でも入る。 |
| `gh` にログイン済み | `gh auth status` | `gh auth login` を実行して、画面の案内に従う。Claude Code の中なら、`! gh auth login` と打つと、そのセッションで実行できる。 |
| git リポジトリのフォルダ | `git rev-parse --is-inside-work-tree` | `git init -b main` を実行する。skill が聞くので、承認すれば skill が実行する。 |
| Node.js（型チェックのフックを使う場合だけ） | `node --version` | [nodejs.org](https://nodejs.org/) から入れる。フックが要らなければ、質問 10 で「入れない」と答えれば、不要になる。 |
| GitHub のリモートリポジトリ（issue と PR を使う段階から） | `gh repo view` | `gh repo create <名前> --private --source . --push` などで作る。この skill は作らない。 |

### 前提が欠けていても、続けられるもの
- **`gh` にログインしていない**: ファイルの生成は続けられる。ただし `/plan-issues`、`/next-task`、`protect-main.sh` はログインするまで動かない。
- **GitHub のリモートがない**: ファイルの生成はできる。issue と PR の段階に進む前に、リモートを作って push する。
- **Node.js がない**: 型チェックのフックだけが使えない。ほかは影響を受けない。

## インストール
Claude Code の設定フォルダの `skills/` に、クローンする。

```
git clone https://github.com/baribo-yama/ai-dev-bootstrap ~/.claude/skills/ai-dev-bootstrap
```

- `CLAUDE_CONFIG_DIR` を使っている場合は、`~/.claude` をそのフォルダに読み替える。別の設定フォルダで開いたセッションには、この skill は出ない。
- クローンしたあと、Claude Code を開き直す。
- 更新するときは、クローンしたフォルダで `git pull` する。
- 入ったか確かめるには、Claude Code で `/ai-dev-bootstrap` と打つ。候補に出れば入っている。

## 使い方
1. 新しいプロジェクトのフォルダ（git リポジトリ）で Claude Code を開く。
2. `/ai-dev-bootstrap` を実行する。この skill は自動では呼ばれない。必ず手動で呼ぶ。
3. 事前確認が走る。
   - git リポジトリか。違えば `git init -b main` を提案する。
   - `gh auth status` でログイン済みか。
   - 生成先に、同じパスのファイルがすでにあるか。あれば一覧にして、飛ばしてよいか聞く。**既存のファイルは上書きしない。**
4. 質問に答える。まとめて答えてよい。「あとで書く」と答えた項目は、`<!-- 書くこと: ... -->` のコメントとして残る。

   | # | 項目 | 入る場所 |
   | --- | --- | --- |
   | 1 | プロジェクト名 | CLAUDE.md、README.md、docs/SPEC.md |
   | 2 | 何を作るか、何を最優先にするか | CLAUDE.md の冒頭、README.md |
   | 3 | 技術スタック | CLAUDE.md |
   | 4 | ディレクトリの構成 | CLAUDE.md |
   | 5 | 型チェック・lint・テストのコマンド（3 つ） | CLAUDE.md、ci.yml、フック |
   | 6 | 設計の約束（データの持ち方、境界、性能、範囲外の機能） | CLAUDE.md |
   | 7 | 秘密情報の置き場所（ローカルと本番） | CLAUDE.md |
   | 8 | 読ませないファイルの追加（`.env` 系のほか） | `.claude/settings.json` の deny、`.gitignore` |
   | 9 | プロジェクト固有の禁止 | CLAUDE.md |
   | 10 | 型チェックのフックを入れるか。入れるなら対象の拡張子（例 `ts\|tsx`） | フックのスクリプト |

5. 生成される。続けて、次の点が自動で確かめられ、結果が報告される。
   - `{{` のような、置き換え忘れが残っていない。
   - `.claude/settings.json`、`ci.yml`、issue フォームが、正しい形式で読める。
   - `.claude/commands/` の 6 つに `description` がある。
   - フックを入れたなら、対象外のファイルの編集では何も起きない。
   - 飛ばしたファイルが、上書きされていない。
6. 報告を読み、[生成後の流れ](#生成後の流れ)に進む。

## 生成後の流れ
skill は、コミット、push、リモートの作成をしない。次を人間がする。

1. **CI の環境セットアップを書く。** `.github/workflows/ci.yml` の `# TODO` に、言語のバージョンと依存のインストールを書く。書くまで CI は失敗する。

   Node.js + pnpm の例:
   ```yaml
   - uses: pnpm/action-setup@v4
   - uses: actions/setup-node@v4
     with:
       node-version: 22
       cache: pnpm
   - run: pnpm install --frozen-lockfile
   ```
2. **PR にして入れる。** `chore/dev-workflow` のようなブランチでコミットして push し、PR を出す。CI が通ることを確かめてからマージする。
3. **main を保護する。** マージ後に、内容を見てから実行する。
   ```
   sh scripts/protect-main.sh --dry-run   # 送る内容を見るだけ
   sh scripts/protect-main.sh             # 設定する
   ```
   PR を必須にし、CI の `check` ジョブを必須にし、管理者を含めて main への直接 push を禁止する。
4. **`/spec <作りたいものの要件>`** で、仕様を決める。要件は粗くてよい。下書きを見て、直しを繰り返し、「これで決まり」と言えば確定する。
5. **`/plan-phases`** で、`docs/PHASES.md` を作る。
6. **`/plan-issues`** で、issue にする。内容を見て、任せる issue に `ai-ready` を付ける。
7. **`/next-task`** で、1 つずつ実装させる。PR を確認してマージし、また `/next-task` を実行する。

## 生成されるフォルダ構成
プロジェクトのルートに、次の構成ができる。

```
your-project/
├── CLAUDE.md                      開発のルール（Claude Code が毎回読む）
├── README.md                      プロジェクトの README（骨組み）
├── .gitignore
├── .gitattributes
├── .claude/
│   ├── settings.json              許可・禁止のコマンド、型チェックのフック
│   └── commands/
│       ├── spec.md                /spec
│       ├── plan-phases.md         /plan-phases
│       ├── plan-issues.md         /plan-issues
│       ├── next-task.md           /next-task
│       ├── adr.md                 /adr
│       └── log.md                 /log
├── .github/
│   ├── ISSUE_TEMPLATE/
│   │   └── task.yml               タスク用の issue フォーム
│   ├── PULL_REQUEST_TEMPLATE.md
│   └── workflows/
│       └── ci.yml                 CI（check ジョブ）
├── docs/
│   ├── SPEC.md                    仕様書
│   ├── PHASES.md                  フェーズとタスク
│   ├── DEVLOG.md                  開発ログ
│   ├── adr/
│   │   ├── TEMPLATE.md
│   │   └── 0001-issue-driven-workflow.md
│   └── todo/
│       └── README.md              人間の作業の管理
└── scripts/
    ├── protect-main.sh            main のブランチ保護
    └── typecheck-hook.mjs         型チェックのフック（任意）
```

テンプレートは `templates/` にあり、生成先と同じパスで置いてある。`CLAUDE.md.template` と `README.md.template` だけは、末尾の `.template` を外してコピーされる。`scripts/typecheck-hook.mjs` は、フックを入れないと答えたときは作られない。

## 生成されるファイルの説明

### ルート
| ファイル | 説明 |
| --- | --- |
| `CLAUDE.md` | Claude Code が毎回読む開発ルール。「最初に読むもの」「技術スタック」「構成」「検証コマンド」「設計の約束」「進め方」「記録のルール」「禁止」の節がある。質問の答えがここに入る。`/next-task` は、ここの「検証コマンド」（型チェック・lint・テスト）を実行する。未記入だと止まる。 |
| `README.md` | プロジェクトの入口。何を作るかの説明、`docs/` へのリンク、Claude Code での進め方、初回の `protect-main.sh` の案内がある。この skill 自体の README とは別物。 |
| `.gitignore` | `.env`、`.env.*`、`*.log`、`.DS_Store` を除外する。質問 8 で答えたファイルも加わる。 |
| `.gitattributes` | 改行を LF に固定する（`* text=auto eol=lf`）。Windows と他の OS で、差分がずれないようにする。 |

### `.claude/`
| ファイル | 説明 |
| --- | --- |
| `settings.json` | `allow` に、`git` の基本操作、`gh issue`、`gh pr create`、`gh pr view`、`gh label`、検証コマンドの先頭語を入れる。`deny` に、`.env` の読み取り、`git push --force`、`rm -rf`、`gh pr merge`、`gh repo delete`、`gh secret` を入れる。フックを入れた場合は、`Edit`・`Write`・`MultiEdit` のあとに `scripts/typecheck-hook.mjs` を走らせる設定（タイムアウト 120 秒）が入る。 |
| `commands/spec.md` | `/spec`。要件から `docs/SPEC.md` を、下書きと修正を繰り返して決める。 |
| `commands/plan-phases.md` | `/plan-phases`。確定した SPEC から `docs/PHASES.md` を作る。 |
| `commands/plan-issues.md` | `/plan-issues`。PHASES の未完了タスクを GitHub Issue にする。 |
| `commands/next-task.md` | `/next-task`。`ai-ready` の issue を 1 つ実装して PR を出し、止まる。 |
| `commands/adr.md` | `/adr`。設計上の決定を ADR として記録する。 |
| `commands/log.md` | `/log`。DEVLOG の先頭に今回の作業を追記する。 |

### `.github/`
| ファイル | 説明 |
| --- | --- |
| `ISSUE_TEMPLATE/task.yml` | タスク用の issue フォーム。「概要」「PHASES のタスク番号」「SPEC.md の参照セクション」「受け入れ条件」「範囲外のこと」「依存する issue」の 6 項目があり、すべて必須。`/plan-issues` が作る issue も、同じ見出しを使う。`/next-task` は「依存する issue」の欄を読む。 |
| `PULL_REQUEST_TEMPLATE.md` | PR の本文の雛形。「対応する issue」（`Closes #`）、「SPEC のどこを実装したか」、「追加・更新した ADR」、「実測値」、「レビューしてほしい点」、チェックリストがある。`/next-task` が、この見出しに沿って埋める。 |
| `workflows/ci.yml` | `pull_request` と `main` への push で動く CI。`check` という 1 つのジョブに、型チェック、lint、テストのステップが並ぶ。`# TODO` の環境セットアップは、自分で書く。ジョブ名 `check` は、ブランチ保護の必須チェック名になっている。変えるときは `protect-main.sh` も直す。`actions/checkout` は、コミット SHA で固定してある。 |

### `docs/`
| ファイル | 説明 |
| --- | --- |
| `SPEC.md` | 仕様書。先頭に `状態:`（下書き / 確定）と確定日がある。章は、概要とスコープ、用語定義、機能要件、データモデル、API・画面、非機能要件、開発ロードマップと未決事項。`/spec` で埋める。`状態: 確定` になるまで、`/plan-phases` と `/plan-issues` は動かない。 |
| `PHASES.md` | フェーズとタスクの一覧。「現在のフェーズ」、タスクのチェックボックス（`- [ ] 1-1 ...`）、各フェーズの「ゲート」（次に進む条件）がある。`/plan-phases` が書き、`/next-task` が完了したタスクにチェックを付ける。 |
| `DEVLOG.md` | 開発ログ。新しいものを上に追記する。`/log` が書く。 |
| `adr/TEMPLATE.md` | ADR の雛形。日付、状態、状況、決定、理由、却下した案、結果・影響。 |
| `adr/0001-issue-driven-workflow.md` | どのプロジェクトにも共通の ADR。issue と PR で進め、着手（`ai-ready`）とマージは人間が決める、という進め方と、その理由、却下した案が書いてある。日付は生成した日になる。 |
| `todo/README.md` | 人間の作業を、日付つきのファイル（`YYYY-MM-DD-内容.md`）で管理するための説明と一覧表。Claude Code のタスクは issue で管理するので、ここには入れない。 |

### `scripts/`
| ファイル | 説明 |
| --- | --- |
| `protect-main.sh` | main のブランチ保護を `gh api` で設定する。PR 必須、`check` ジョブ必須、管理者を含めて直接 push 禁止、force push と削除の禁止。承認数は 0（1 人の開発で、自分の PR を承認できなくなるのを避けるため）。`--dry-run` で、送る内容だけ表示する。実行権限は付けていないので、`sh scripts/protect-main.sh` で実行する。 |
| `typecheck-hook.mjs` | Claude Code のフック。対象の拡張子のファイルを編集すると、型チェックを実行する。失敗したときは、エラーの先頭 40 行を標準エラー出力に書いて、終了コード 2 で終わる。対象外のファイルや、想定外の入力では、何も出さない。Node.js が要る。 |

## コマンドの詳細
生成されるスラッシュコマンドは、すべてプロジェクトの `.claude/commands/` に入る。

### `/spec <要件>`
`docs/SPEC.md` を、下書きと修正を繰り返して決める。
- まず全章の骨格を、仮置きで書く。仮置きにした点は「未決事項」に出る。
- 選択肢が 2 つ以上あり、あとから変えにくい判断（認証方式、ID の持ち方など）は、その場で ADR に残る。
- 人間が「これで決まり」と言うと、「未決事項」が空か、各機能がテストで確かめられる具体さかを確かめて、`状態: 確定` にする。
- 確定したあとの変更も、同じ流れでする。すでに issue になったタスクに影響するときは、その番号を教えてくれる。

### `/plan-phases`
確定した SPEC から、`docs/PHASES.md` にフェーズ、タスク（PR 1 本で終わる粒度）、ゲート（次に進む条件）を書く。SPEC が `確定` でなければ止まる。

### `/plan-issues [フェーズ番号]`
未完了のタスクを GitHub Issue にする。
- 引数がなければ「現在のフェーズ」を使う。
- closed も含めて重複を調べ、すでにあるタスクの issue は作らない。何度実行してもよい。
- 受け入れ条件は、テストで確かめられる形で書く。依存する issue も本文に書く。
- **`ai-ready` は付けない。** 人間が内容を見て付ける。

### `/next-task`
`ai-ready` の issue を 1 つ選んで実装し、PR を出して止まる。
- 番号の小さい順に、依存する issue がすべて完了していて、PR がまだない最初の issue を選ぶ。
- issue に「要確認」が残っている、SPEC と矛盾する、人間の作業が要る、検証コマンドが未記入、のいずれかなら、実装せずに報告して止まる。
- テストを先に書き、失敗を確かめてから実装する。
- 型チェック・lint・テストがすべて通らなければ、PR を出さずに止まる。
- **マージはしない。次の issue にも進まない。**

### `/adr <タイトル>`
設計上の決定を `docs/adr/NNNN-<スラッグ>.md` に記録する。状況、決定、理由、却下した案、結果を書く。分からない部分は、推測せずに聞いてくる。

### `/log`
`docs/DEVLOG.md` の先頭に、今日の作業（やったこと、決めたこと、つまずいたこと、次にやること）を追記する。

## 安全のための仕組み
`.claude/settings.json` で、次を決めている。

- **許可**: `git status`、`diff`、`log`、`add`、`commit`、`checkout`、`switch`、`branch`、`gh issue`、`gh pr create`、`gh pr view`、`gh label`、そして検証コマンドの先頭語。
- **禁止**: `.env` と `.env.*` の読み取り、`git push --force`、`git push -f`、`rm -rf`、`gh pr merge`、`gh repo delete`、`gh secret`。質問 8 で答えたファイルの読み取りも加わる。
- **型チェックのフック（任意）**: 指定した拡張子のファイルを編集するたびに、型チェックを走らせる。失敗は Claude Code に伝わるが、編集は止めない。

マージは人間だけができる。`gh pr merge` が禁止されているうえ、`protect-main.sh` で main への直接 push も止まる。

## この skill がしないこと
- CI の環境セットアップ（言語のバージョン、依存のインストール）。生成された `ci.yml` の `# TODO` に、プロジェクトに合わせて書く。
- コミット、push、リモートリポジトリの作成。
- ブランチ保護の設定。生成された `scripts/protect-main.sh` を、人間が実行する。

## つまずいたとき
| 症状 | 原因と対処 |
| --- | --- |
| `/ai-dev-bootstrap` が候補に出ない | 設定フォルダの `skills/` に入っていないか、開き直していない。`CLAUDE_CONFIG_DIR` を使っているなら、そのフォルダの `skills/` に置く。置いたら Claude Code を開き直す。 |
| `gh: command not found` | `gh` が入っていない。[前提条件](#前提条件)を見て入れる。入れたあと、ターミナルを開き直す。 |
| `gh auth status` が失敗する | ログインしていない。`gh auth login` を実行する。 |
| `protect-main.sh` が 403 で失敗する | private リポジトリでは、ブランチ保護に有料プランが要る。public にするか、プランを確認するか、保護をあきらめる。 |
| `protect-main.sh` が「Branch not found」などで失敗する | main がまだ push されていない。先に push する。 |
| 生成した CI がずっと失敗する | `ci.yml` の `# TODO`（環境のセットアップ）を書いていない。 |
| CI が緑なのに、何も検証されていない気がする | 空のワークスペースでは、`pnpm -r test` などは対象が 0 件で成功する。最初のタスクで、CI が実際にコマンドを実行していることを確かめる。 |
| `/plan-issues` や `/plan-phases` が「仕様が確定していない」と止まる | `docs/SPEC.md` の `状態:` が `確定` でない。`/spec` で仕様を決める。 |
| `/next-task` が「要確認」で止まる | issue の本文に「要確認」が残っている。決まったら「決定」に書き換える。書き換えるまで止まり続ける。 |
| `/next-task` が「検証コマンドがない」と止まる | CLAUDE.md の「検証コマンド」が未記入。型チェック・lint・テストのコマンドを書く。 |
| `/next-task` が「条件を満たす issue がない」と報告する | `ai-ready` が付いていない、依存する issue が未完了、すでに PR がある、のどれか。報告に理由が出る。 |
| 自分のコマンドが拒否される | `rm -rf` など、deny にあるコマンドを使っていないか見る。 |
| フックが型エラーを出す | テストを先に書く途中は、型エラーが出るのが正しい。編集は止まらないので、通常は無視してよい。 |
| フックのコマンドが壊れる | コマンドに `"` や `\` が含まれると、JS の文字列を壊す。`scripts/typecheck-hook.mjs` では、エスケープする。 |
| Windows で改行やパスがおかしい | `.gitattributes` で改行を LF に固定してある。`/tmp` は Git Bash と Node で別の場所を指すので、一時ファイルは標準入力で渡す。 |

## ライセンス
[MIT](LICENSE)
