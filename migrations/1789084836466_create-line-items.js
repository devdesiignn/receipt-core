/**
 * @type {import('node-pg-migrate').ColumnDefinitions | undefined}
 */
export const shorthands = undefined;

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const up = (pgm) => {
  pgm.createTable("line_items", {
    id: {
      type: "uuid",
      primaryKey: true,
      default: pgm.func("gen_random_uuid()"),
    },
    receipt_id: {
      type: "uuid",
      notNull: true,
      references: "receipts",
      onDelete: "CASCADE",
    },
    description: { type: "text", notNull: true },
    quantity: { type: "numeric(10, 2)", notNull: true },
    unit_price: { type: "numeric(12, 2)", notNull: true },
    line_total: { type: "numeric(12, 2)", notNull: true },
    line_order: { type: "integer", notNull: true },
  });

  pgm.createIndex("line_items", "receipt_id", { name: "idx_line_items_receipt_id" });
};

/**
 * @param pgm {import('node-pg-migrate').MigrationBuilder}
 * @returns {Promise<void> | void}
 */
export const down = (pgm) => {
  pgm.dropTable("line_items");
};
