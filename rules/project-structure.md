# Project Structure

> One layout for every web stack, no `src/`. The concrete tree for each stack
> is in `.playbook/stacks/<stack>/STACK.md`.

## Naming

- **Kebab-case everything** — files, folders, routes (lint-enforced on JS/TS):
  `booking-form.tsx`, `use-booking.ts`, `booking-schema.py`; never `BookingForm.tsx` or `useBooking.ts`.
- **Prefix feature files with the feature**: `booking-schema.ts`, `booking-actions.ts`, `booking-queries.ts`, so search and agents never meet 30 files named `schema.ts`. Use-case files are verb-noun: `create-booking.ts`, `refund-payment.ts`.
- **No `index.ts` barrels.**

## Layout

| Folder | Holds |
| ------ | ----- |
| `app/` | Routes only; pages stay thin and call features |
| `features/<name>/` | One business capability: schema + inferred types, actions, queries, one file per use case, its components, its integration tests |
| `lib/` | Shared infrastructure, no business rules: `define-action`, logger, errors, auth, db client |
| `components/` (`ui/`) | UI used across features; shadcn primitives in `ui/` |
| `db/` + migrations | The whole database schema, in one place, because tables relate across features |
| `e2e/` | Playwright specs, one per money journey |

## Growth Rules

- **Start flat.** No `hooks/`, `types/`, or `utils/` folders up front; a subfolder inside a feature appears past about 8 files of one kind.
- **Shared on the second use.** Code leaves a feature only when a second feature needs it *and* it holds no business rule; business rules stay with the feature that owns them.
- **Imports flow one way:** `app → features → lib · components · db`. Shared code never imports a feature, and features never import each other in a cycle — both are lint errors. When a cycle appears, merge the two features or move the shared piece down to `lib/`.
