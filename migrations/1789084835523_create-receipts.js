/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("receipts", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    store_id: {
      type: "uuid",
      notNull: true,
      references: "stores",
    },
    source_image_id: { type: "text", notNull: true },
    transaction_ref: { type: "text", notNull: true },
    transaction_ref_label: { type: "text" },
    register_ref: { type: "text" },
    date: { type: "date", notNull: true },
    time: { type: "time" },
    staff_name: { type: "text" },
    customer_name: { type: "text" },
    payment_method: { type: "text" },
    subtotal: { type: "numeric(12, 2)" },
    discount: { type: "numeric(12, 2)" },
    vat: { type: "numeric(12, 2)" },
    consumption_tax: { type: "numeric(12, 2)" },
    total: { type: "numeric(12, 2)", notNull: true },
    total_in_words: { type: "text" },
    content_hash: { type: "text", notNull: true },
    extras: { type: "jsonb" },
    created_at: {
      type: "timestamptz",
      notNull: true,
      default: pgm.func("now()"),
    },
  });

  // Guards against the same physical receipt being ingested twice
  // (seen in the Momrota Pharmacy sample: two photos of one receipt)
  pgm.createIndex("receipts", "content_hash", { unique: true, name: "idx_receipts_content_hash" });
  pgm.createIndex("receipts", "store_id", { name: "idx_receipts_store_id" });
  pgm.createIndex("receipts", "date", { name: "idx_receipts_date" });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("receipts");
};
