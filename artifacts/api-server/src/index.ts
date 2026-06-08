import app from "./app";
import { logger } from "./lib/logger";

function fail(msg: string): never {
  console.error("\n" + "━".repeat(60));
  console.error("  RankRight API failed to start:");
  console.error("    " + msg);
  console.error("━".repeat(60) + "\n");
  process.exit(1);
}

if (!process.env["DATABASE_URL"]) {
  fail(
    "DATABASE_URL is not set. Provision a Postgres database and export DATABASE_URL=postgres://… before running the API.",
  );
}

const rawPort = process.env["PORT"] ?? "5000";
const port = Number(rawPort);
if (Number.isNaN(port) || port <= 0) {
  fail(`Invalid PORT value: "${rawPort}"`);
}

app.listen(port, (err) => {
  if (err) {
    logger.error({ err }, "Error listening on port");
    process.exit(1);
  }
  logger.info({ port }, "RankRight API listening");
});
