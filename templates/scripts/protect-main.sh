#!/bin/sh
# main のブランチ保護を設定する（PR 必須・CI 必須・管理者を含めて直接 push 禁止）。
# CI を main に入れてから、人間が実行する。--dry-run なら送信内容の表示だけ行う。
set -eu

payload='{
  "required_status_checks": { "strict": false, "checks": [{ "context": "check" }] },
  "enforce_admins": true,
  "required_pull_request_reviews": { "required_approving_review_count": 0 },
  "restrictions": null,
  "allow_force_pushes": false,
  "allow_deletions": false
}'

if [ "${1:-}" = "--dry-run" ]; then
  printf '%s\n' "$payload"
  exit 0
fi

repo=$(gh repo view --json nameWithOwner --jq .nameWithOwner)
printf '%s\n' "$payload" | gh api -X PUT "repos/$repo/branches/main/protection" --input - >/dev/null
echo "$repo の main を保護しました"
