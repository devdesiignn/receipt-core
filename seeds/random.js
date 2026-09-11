// Randomly generated seed data — adds volume/variety on top of seeds/fixed.js.
// Not deterministic: run it again and you get different (but still valid) rows.

import { faker } from "@faker-js/faker";

const STORE_COUNT = 3;
const RECEIPTS_PER_STORE = [2, 4];
const LINE_ITEMS_PER_RECEIPT = [1, 5];

/**
 * @param client {import('pg').Client}
 */
export const seedRandom = async (client) => {
  for (let s = 0; s < STORE_COUNT; s++) {
    const storeResult = await client.query(
      `INSERT INTO stores (name, address, phone, email, website)
       VALUES ($1, $2, $3, $4, $5)
       RETURNING id`,
      [
        faker.company.name(),
        faker.location.streetAddress({ useFullAddress: true }),
        faker.helpers.maybe(() => faker.phone.number(), { probability: 0.6 }) ?? null,
        faker.helpers.maybe(() => faker.internet.email(), { probability: 0.3 }) ?? null,
        faker.helpers.maybe(() => faker.internet.url(), { probability: 0.2 }) ?? null,
      ]
    );
    const storeId = storeResult.rows[0].id;

    const receiptCount = faker.number.int({
      min: RECEIPTS_PER_STORE[0],
      max: RECEIPTS_PER_STORE[1],
    });

    for (let r = 0; r < receiptCount; r++) {
      const lineItemCount = faker.number.int({
        min: LINE_ITEMS_PER_RECEIPT[0],
        max: LINE_ITEMS_PER_RECEIPT[1],
      });

      const lineItems = Array.from({ length: lineItemCount }, () => {
        const quantity = faker.number.int({ min: 1, max: 10 });
        const unitPrice = faker.number.float({ min: 100, max: 5000, fractionDigits: 2 });
        return {
          description: faker.commerce.productName(),
          quantity,
          unitPrice,
          lineTotal: Math.round(quantity * unitPrice * 100) / 100,
        };
      });

      const total = lineItems.reduce((sum, item) => sum + item.lineTotal, 0);
      const contentHash = faker.string.alphanumeric(32);

      const receiptResult = await client.query(
        `INSERT INTO receipts (
           store_id, source_image_id, transaction_ref, date,
           staff_name, payment_method, total, content_hash
         ) VALUES ($1, $2, $3, $4, $5, $6, $7, $8)
         RETURNING id`,
        [
          storeId,
          `img_${faker.string.uuid()}`,
          faker.string.alphanumeric(8).toUpperCase(),
          faker.date.recent({ days: 90 }).toISOString().slice(0, 10),
          faker.helpers.maybe(() => faker.person.fullName(), { probability: 0.7 }) ?? null,
          faker.helpers.arrayElement(["Cash", "Card", null]),
          total,
          contentHash,
        ]
      );
      const receiptId = receiptResult.rows[0].id;

      for (let i = 0; i < lineItems.length; i++) {
        const item = lineItems[i];
        await client.query(
          `INSERT INTO line_items (receipt_id, description, quantity, unit_price, line_total, line_order)
           VALUES ($1, $2, $3, $4, $5, $6)`,
          [receiptId, item.description, item.quantity, item.unitPrice, item.lineTotal, i + 1]
        );
      }

      // occasionally flag a low-confidence field, to add some extraction_reviews variety
      if (faker.datatype.boolean({ probability: 0.3 })) {
        await client.query(
          `INSERT INTO extraction_reviews (
             receipt_id, field_name, extractor_source, extracted_value,
             confidence_score, flagged_reason, status
           ) VALUES ($1, 'total', $2, $3, $4, 'low_confidence', 'pending')`,
          [
            receiptId,
            faker.helpers.arrayElement(["tesseract-ocr", "claude-vision-v2"]),
            String(total),
            faker.number.float({ min: 0.1, max: 0.65, fractionDigits: 3 }),
          ]
        );
      }
    }
  }
};
