import { execFileSync } from "node:child_process";

try {
  execFileSync("git", ["rev-parse", "--git-dir"], {
    stdio: "ignore",
  });

  execFileSync("git", ["config", "core.hooksPath", ".githooks"], {
    stdio: "ignore",
  });

  console.log("Hooks de Git configurados en .githooks");
} catch (error) {
  const message = error instanceof Error ? error.message : "";

  if (message.includes("not a git repository")) {
    console.log("No se ha configurado core.hooksPath porque este directorio no parece un repo Git.");
    process.exit(0);
  }

  console.log(
    "No se ha podido configurar core.hooksPath automáticamente. Puedes activarlo manualmente con: git config core.hooksPath .githooks",
  );
}
