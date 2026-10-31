// Hook PostToolUse (Edit|Write): roda o ESLint no arquivo que acabou de ser
// alterado e devolve os erros ao Claude para ele corrigir na hora.
// Escrito em Node (e não em bash/jq) para funcionar igual no Windows e no Mac.
import { spawnSync } from "node:child_process";

let entrada = "";
for await (const parte of process.stdin) entrada += parte;

let arquivo = "";
try {
  arquivo = JSON.parse(entrada)?.tool_input?.file_path ?? "";
} catch {
  process.exit(0); // entrada inesperada: não atrapalha o trabalho
}

const caminho = arquivo.replace(/\\/g, "/");
const vale = /\.(ts|tsx|mjs)$/.test(caminho) && !caminho.includes("/src/generated/");
if (!vale) process.exit(0);

const resultado = spawnSync("npx", ["eslint", "--no-warn-ignored", arquivo], {
  encoding: "utf8",
  shell: true, // necessário para achar o npx no Windows
  timeout: 90_000,
});

if (resultado.status !== 0) {
  const saida = `${resultado.stdout ?? ""}${resultado.stderr ?? ""}`.trim();
  // Se o ESLint nem chegou a rodar (ex.: node_modules ausente), não bloqueia.
  if (!saida || /command not found|could not determine executable|ENOENT/i.test(saida)) {
    process.exit(0);
  }
  console.error(`ESLint encontrou problemas em ${arquivo}:\n${saida}`);
  process.exit(2); // código 2 devolve a mensagem ao Claude
}
