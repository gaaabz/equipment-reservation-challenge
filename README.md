# Equipment Reservation Challenge - Starter

Starter application for the **Senior Full Stack Developer Take Home Assessment**. The assessment is designed for **4–6 focused hours** and uses only local, free, open-source tooling.

## Requirements

- Node.js 22 (see `.nvmrc`)
- pnpm 11 (the exact package-manager version is pinned in `package.json`)

## Quick Start

```bash
pnpm install
pnpm db:setup
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). No separate environment setup is required. The application defaults to a local SQLite database at `dev.db`; `DATABASE_URL` may optionally override it.

## Database Setup

`pnpm db:setup` generates the Prisma client, applies the schema to SQLite, and loads deterministic starter data. To restore that known state later, run:

```bash
pnpm db:reset
```

Use `pnpm db:seed` to reload the deterministic seed without recreating the schema. Both reset and seed replace local reservation data.

## Project Overview

- A **Location** owns equipment and reservations.
- **Equipment** has a total quantity at one location.
- A **Reservation** covers a time interval at one location and is either `DRAFT` or `CONFIRMED`.
- A **ReservationItem** explicitly links a reservation to equipment with a requested quantity.
- Only `CONFIRMED` reservations consume availability.

The seeded reservation list is complete starter functionality. The note editor is a small, working mutation example; it is not one of the assessment tickets.

## Architecture

- `src/app` — App Router pages, loading/error boundaries, and API routes
- `src/features/reservations` — reservation-list UI and note form
- `src/schemas` — shared Zod request/form validation
- `src/server/reservations` — typed reads and reservation domain operations
- `src/lib` — Prisma client and small shared server utilities
- `src/types` — shared UI-facing domain types
- `prisma/schema.prisma` — relational data model
- `prisma/seed.ts` — deterministic local data

## Candidate Tasks

1. **Fix Reservation Availability.** Correct the existing availability behavior so it follows all documented business rules.
2. **Implement Create Reservation.** Build the client validation, server mutation, persistence, availability enforcement for confirmed reservations, and appropriate success/error experience.

**Optional bonus:** Edit Reservation. This is not required.

No automated tests are required. Focus on clear production-style code, sound business rules, and useful manual verification.

## Business Rules

- Reservation intervals use `[start, end)` semantics: the start is inclusive and the end is exclusive.
- Adjacent reservations do not overlap. For example, `09:00–12:00` and `12:00–15:00` can both be reserved.
- Only `CONFIRMED` reservations consume inventory; `DRAFT` reservations do not.
- Quantity must be positive.
- Requested quantity may not exceed the available quantity.
- Availability is location-specific.
- The server is authoritative and must re-check availability before confirming a reservation.
- An unavailable confirmed request must return an actionable domain error, such as: `Only 2 Generators are available for the selected period.`

## Useful Commands

| Command | Purpose |
| --- | --- |
| `pnpm dev` | Start the development server |
| `pnpm build` | Create a production build |
| `pnpm lint` | Run ESLint |
| `pnpm typecheck` | Run strict TypeScript checks |
| `pnpm db:setup` | Generate Prisma, apply the schema, and seed SQLite |
| `pnpm db:seed` | Reload deterministic seed data |
| `pnpm db:reset` | Restore deterministic starter data |

## No External Services

No external services, API keys, authentication providers, cloud accounts, paid components, Docker, or private package registries are required.

## Scope

Do not build authentication or user management, payments, invoicing, taxes, accounting, email/SMS, external API integrations, cloud infrastructure, Redis, Datadog, CI/CD, Trigger.dev workflows, microservices, or event sourcing. Edit Reservation is bonus-only, and automated tests are not required.

## Submission

Follow the submission instructions in the assessment document you received.
