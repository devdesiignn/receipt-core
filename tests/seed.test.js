// Verifies the seed script leaves the database in a consistent state:
// rows present, FK relationships hold, enum-backed columns stay within
// their allowed values. `npm test` runs docker:up, migrate:dev, and
// db:seed:dev automatically before this file (see the pretest script in
// package.json).

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

test("seed data is present in every table", async () => {
  const { rows: storeRows } = await client.query("SELECT count(*)::int AS count FROM stores");
  const { rows: receiptRows } = await client.query("SELECT count(*)::int AS count FROM receipts");
  const { rows: lineItemRows } = await client.query(
    "SELECT count(*)::int AS count FROM line_items"
  );
  const { rows: reviewRows } = await client.query(
    "SELECT count(*)::int AS count FROM extraction_reviews"
  );

  assert.ok(storeRows[0].count > 0, "expected at least one store");
  assert.ok(receiptRows[0].count > 0, "expected at least one receipt");
  assert.ok(lineItemRows[0].count > 0, "expected at least one line item");
  assert.ok(reviewRows[0].count > 0, "expected at least one extraction review");
});

test("every receipt.store_id references a real store", async () => {
  const { rows } = await client.query(
    `SELECT r.id FROM receipts r
     LEFT JOIN stores s ON s.id = r.store_id
     WHERE s.id IS NULL`
  );
  assert.equal(rows.length, 0, "found receipts with a store_id not present in stores");
});

test("every line_item.receipt_id references a real receipt", async () => {
  const { rows } = await client.query(
    `SELECT li.id FROM line_items li
     LEFT JOIN receipts r ON r.id = li.receipt_id
     WHERE r.id IS NULL`
  );
  assert.equal(rows.length, 0, "found line items with a receipt_id not present in receipts");
});

test("every extraction_review.receipt_id references a real receipt", async () => {
  const { rows } = await client.query(
    `SELECT er.id FROM extraction_reviews er
     LEFT JOIN receipts r ON r.id = er.receipt_id
     WHERE r.id IS NULL`
  );
  assert.equal(
    rows.length,
    0,
    "found extraction_reviews with a receipt_id not present in receipts"
  );
});

test("extraction_reviews.line_item_id, when set, references a real line_item", async () => {
  const { rows } = await client.query(
    `SELECT er.id FROM extraction_reviews er
     LEFT JOIN line_items li ON li.id = er.line_item_id
     WHERE er.line_item_id IS NOT NULL AND li.id IS NULL`
  );
  assert.equal(
    rows.length,
    0,
    "found extraction_reviews with a line_item_id not present in line_items"
  );
});

test("receipts.content_hash values are unique", async () => {
  const { rows } = await client.query(
    `SELECT content_hash, count(*)::int AS count FROM receipts
     GROUP BY content_hash HAVING count(*) > 1`
  );
  assert.equal(rows.length, 0, "found duplicate content_hash values across receipts");
});

test("extraction_reviews.status is always a known value", async () => {
  const { rows } = await client.query(
    `SELECT status, count(*)::int AS count FROM extraction_reviews
     WHERE status NOT IN ('pending', 'resolved', 'rejected')
     GROUP BY status`
  );
  assert.equal(rows.length, 0, "found extraction_reviews rows with an unexpected status value");
});
