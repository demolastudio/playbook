# Project Structure

> Stack-agnostic structure rules. Concrete folder layouts live in each
> stack profile — see `.playbook/stacks/<stack>/STACK.md`.

## Naming

- **Kebab-case everything.** Files, folders, routes — all kebab-case, in every language and framework.
  ```
  ✅ booking-form/booking-form.tsx
  ✅ use-booking.ts
  ✅ booking-schema.py
  ❌ BookingForm/BookingForm.tsx
  ❌ useBooking.ts
  ```

## Code Splitting

Split by concern, not by convenience. Every type of code gets a dedicated home:

| Concern | Next.js | FastAPI | NestJS |
| ------- | ------- | ------- | ------ |
| Type definitions | `types/` | `models/` (Pydantic) | `interfaces/` |
| Validation schemas | `schemas/` (Zod) | `schemas/` (Pydantic) | `dto/` (class-validator) |
| Mutations / handlers | `actions/` | `routers/` | `controllers/` |
| Business logic | `lib/` | `services/` | `services/` |
| Reusable client logic | `hooks/` | — | — |
