---
description: ai-ready の issue を 1 つ選んで実装し、PR を出して止まる
---
1. 作業ツリーがきれいなことを確かめ、`git switch main` と `git pull --ff-only` で main を最新にする。未コミットの変更があれば、報告して止まる。
2. 対象の issue を選ぶ。`gh issue list --label ai-ready --state open --limit 200 --json number,title,body` で取得し、番号の小さい順に見て、次をすべて満たす最初の issue を選ぶ。
   - 「依存する issue」の `#<番号>` が、すべて完了している（`gh issue view <番号> --json state,stateReason` で `CLOSED`、かつ `NOT_PLANNED` ではない）。`なし` なら満たす。読み取れないときは、満たさないものとして扱う。
   - その issue の PR がまだない（`gh pr list --state open --json number,headRefName` に `feat/<issue番号>-` で始まるブランチがない）。

   条件を満たす issue がなければ、見送った issue とその理由を報告して止まる。
3. issue と `docs/SPEC.md` の参照セクションを読み、範囲を 3〜5 行で整理して見せる。受け入れ条件と「範囲外のこと」に従う。issue の本文に「要確認」の文字が残っている（「要確認:」「要確認（…）」のどちらの書き方でも。決まったものは「決定」に書き換える）、SPEC と矛盾する、人間の作業（秘密情報の設定など）が必要、のいずれかなら、実装せずに報告して止まる。
4. `feat/<issue番号>-<短い英語スラッグ>` のブランチを切る。
5. テストを先に書き、失敗することを確かめてから実装する。
6. 設計上の決定があれば `/adr` で記録し、`/log` で DEVLOG に追記する。実測値があれば書く（CLAUDE.md の「設計の約束」に実測が必要な項目があれば、それを測る）。issue でそのタスクが完了するなら `docs/PHASES.md` のチェックを付ける（分割したタスクは、最後の issue で付ける）。これらは同じ PR に含める。
7. CLAUDE.md の「検証コマンド」に書いた、型チェック・lint・テストのコマンドをすべて実行して通す。コマンドが書かれていなければ、実装せずに報告して止まる。通らなければ PR を出さず、状況を報告して止まる。
8. `git push -u origin <ブランチ>` のあと、`gh pr create` で PR を出す。本文は `.github/PULL_REQUEST_TEMPLATE.md` の見出しに沿って埋め、`Closes #<issue番号>` を入れる。
9. PR の URL と結果を短く報告して止まる。**マージはしない。次の issue にも進まない。** この PR でフェーズの全タスクが終わるなら、ゲート（`docs/PHASES.md`）の確認を人間に依頼する。
