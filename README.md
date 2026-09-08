# receipt-core

Shared schema, migrations, and data model for the [Receipt Intelligence Platform](https://github.com/devdesiignn/receipt-intelligence-platform) — the contract every other service in the set depends on.

## What lives here

- The database schema for the core entities: `stores`, `receipts`, `line_items`, `extraction_reviews`.
- Migrations that create and evolve that schema.
- A data contract (schema definitions) that other services read to build their own native types, independent of what language they're written in.
- Synthetic/seed data for local development and testing, matching the real schema's shape without containing any real receipt data.

## What this does not do

- Does not run a server or expose an API.
- Does not process or extract data from receipt images.
- Does not assume every consuming service is written in the same language.

## Status

Early setup. Schema design in progress.

## Related repos

Part of the [Receipt Intelligence Platform](https://github.com/devdesiignn/receipt-intelligence-platform).
