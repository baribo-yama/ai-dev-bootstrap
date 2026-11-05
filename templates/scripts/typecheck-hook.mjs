// Claude Code の PostToolUse フック。対象の拡張子のファイルを編集したら型チェックを走らせる。
// 失敗したら、標準エラー出力に内容を書いて終了コード 2 で終わる（Claude Code に伝わる）。
// 編集自体は止めない。型エラーのない編集、対象外の編集、想定外の入力では何も出さない。
import { spawnSync } from "node:child_process";
import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const root = join(dirname(fileURLToPath(import.meta.url)), "..");
const MAX_LINES = 40;

let filePath = "";
try {
  filePath = JSON.parse(readFileSync(0, "utf8"))?.tool_input?.file_path ?? "";
} catch {
  process.exit(0);
}

if (!/\.({{フック対象の拡張子}})$/.test(filePath)) process.exit(0);

const res = spawnSync("{{型チェックコマンド}}", {
  cwd: root,
  encoding: "utf8",
  shell: true, // コマンドを文字列のまま実行する
});

if (res.status === 0) process.exit(0);

const output = `${res.stdout}${res.stderr}`.trim().split("\n");
const shown = output.slice(0, MAX_LINES).join("\n");
const rest =
  output.length > MAX_LINES
    ? `\n…（残り ${output.length - MAX_LINES} 行）`
    : "";
process.stderr.write(
  `型チェックに失敗しました（${filePath} の編集後）:\n${shown}${rest}\n`,
);
process.exit(2);
