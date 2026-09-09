# CLAUDE.md

This file provides guidance to Claude Code (claude.ai/code) when working with code in this repository.

## What this repo is

`receipt-core` is the shared schema/data-contract repo for the [Receipt Intelligence Platform](https://github.com/devdesiignn/receipt-intelligence-platform). It defines the core entities (`stores`, `receipts`, `line_items`, `extraction_reviews`), the migrations that evolve that schema, and synthetic seed data — all consumed by other services in the platform, which may be written in different languages.

**Status: early setup.** The repo currently contains no code — only README, LICENSE, and .gitignore. Schema design is in progress, so there is no established structure, build system, or test suite yet to follow. When adding the first schema/migration files, look for direction from the user rather than assuming a stack.

## Scope boundaries (from README)

This repo does **not**:

- Run a server or expose an API.
- Process or extract data from receipt images.
- Assume every consuming service is written in the same language.

Keep contributions limited to schema, migrations, the data contract, and synthetic seed data — application/service logic belongs in the other repos under the Receipt Intelligence Platform.

## Commit conventions

- Do not add a `Co-Authored-By: Claude` trailer to commit messages in this repo.
- Use Conventional Commits: `type(scope): message` (e.g. `feat(schema): add line_items table`, `chore(migrations): reorder seed step`, `fix(seeds): correct store id reference`). Common types: `feat`, `fix`, `chore`, `docs`, `refactor`, `test`. Scope is the affected domain (`schema`, `migrations`, `seeds`, `db`, etc.) and is optional but preferred when a change is domain-specific.
