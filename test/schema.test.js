// Verifies migrations produced the expected schema. `npm test` runs
// docker:up, migrate:dev, and db:seed:dev automatically before this file
// (see the pretest script in package.json).

import { test, before, after } from "node:test";
import assert from "node:assert/strict";
import { Client } from "pg";

const client = new Client({ connectionString: process.env.DATABASE_URL });

before(async () => {
  await client.connect();
});

after(async () => {
  await client.end();
});

test("all four core tables exist", async () => {
  const { rows } = await client.query(
    `SELECT table_name FROM information_schema.tables
     WHERE table_schema = 'public' AND table_name = ANY($1)`,
    [["stores", "receipts", "line_items", "extraction_reviews"]]
  );
  const tableNames = rows.map((r) => r.table_name).sort();
  assert.deepEqual(tableNames, ["extraction_reviews", "line_items", "receipts", "stores"]);
});

test("receipts.content_hash has a unique index", async () => {
  const { rows } = await client.query(
    `SELECT indexname FROM pg_indexes
     WHERE tablename = 'receipts' AND indexdef ILIKE '%UNIQUE%content_hash%'`
  );
  assert.ok(rows.length > 0, "expected a unique index on receipts.content_hash");
});

test("flagged_reason_type and review_status_type enums exist with expected values", async () => {
  const { rows } = await client.query(
    `SELECT t.typname, e.enumlabel
     FROM pg_type t
     JOIN pg_enum e ON e.enumtypid = t.oid
     WHERE t.typname IN ('flagged_reason_type', 'review_status_type')
     ORDER BY t.typname, e.enumsortorder`
  );

  const flaggedReasons = rows
    .filter((r) => r.typname === "flagged_reason_type")
    .map((r) => r.enumlabel);
  const statuses = rows.filter((r) => r.typname === "review_status_type").map((r) => r.enumlabel);

  assert.deepEqual(flaggedReasons, [
    "low_confidence",
    "conflicting_extractions",
    "validation_failed",
    "illegible",
    "manual_flag",
  ]);
  assert.deepEqual(statuses, ["pending", "resolved", "rejected"]);
});
