import { Client } from "pg";
import { seedFixed } from "./fixed.js";
import { seedRandom } from "./random.js";

const client = new Client({ connectionString: process.env.DATABASE_URL });

await client.connect();

try {
  await client.query("BEGIN");
  // reset to a clean, known state so the seed is safe to re-run
  await client.query("TRUNCATE TABLE stores, receipts, line_items, extraction_reviews CASCADE");
  await seedFixed(client);
  await seedRandom(client);
  await client.query("COMMIT");
  console.log("Seed complete.");
} catch (err) {
  await client.query("ROLLBACK");
  console.error("Seed failed, rolled back:", err);
  process.exitCode = 1;
} finally {
  await client.end();
}
