# Equipment Reservation Planner

Shared equipment reservation planner built on the provided starter (Next.js, Prisma + SQLite, Material UI). It includes both assessment tickets (the availability fix and the create reservation flow) plus the optional edit flow.

## Setup

Requirements: Node.js 22 (see `.nvmrc`) and pnpm 11.

```bash
pnpm install
pnpm db:setup   # generate the Prisma client, apply migrations and seed SQLite
pnpm dev
```

Open [http://localhost:3000](http://localhost:3000). No environment variables or external services are needed; the app uses a local SQLite file (`dev.db`).

`pnpm db:reset` restores the seed data at any time. If you switch Node versions after installing, run `pnpm rebuild better-sqlite3` so the native SQLite driver matches the new runtime.

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

## Assumptions

- Times are entered and displayed in UTC. The list already showed UTC, so the form uses the same reference instead of the browser's time zone.
- Equipment units are interchangeable. A reservation asks for a quantity of a type, not for specific units.
- There is no buffer between reservations: a unit returned at 12:00 can be picked up again at 12:00.
- Availability for a period is the total quantity minus the highest number of units used at the same time by confirmed reservations in that period. Two back-to-back reservations of 2 Generators (09:00–12:00 and 12:00–15:00) never use 4 at once, so an 11:00–13:00 request still sees 2 available.
- Drafts don't consume inventory and skip the availability check, but they are still validated: dates, quantities, and equipment that belongs to the selected location.
- Each equipment type appears once per reservation, which the database also enforces.
- Past dates are allowed, since the brief doesn't rule them out.

## Technical decisions

- **Availability** (`src/server/reservations/availability.ts`): overlapping reservations are found with a half-open filter (`startAt < end` and `endAt > start`). Peak usage is computed with a small sweep over start/end events, applying releases before claims at the same instant so adjacent reservations don't add up.
- **Validation**: one Zod schema (`src/schemas/reservation.ts`) is shared by the form and the API, so both enforce the same rules. Dates must match the `datetime-local` format, because `new Date()` alone accepts values like `"1"`.
- **Create endpoint**: `POST /api/reservations` follows the conventions of the existing note route: flat `{ error, code }` responses, `400` for validation errors, and domain errors with their own status code.
- **Atomic confirmation** (`src/server/reservations/create-reservation.ts`): the availability check and the insert run in the same Prisma transaction, and the availability functions receive the transaction client so the check reads inside it. A conflict returns `409 AVAILABILITY_EXCEEDED` with a message like "Only 2 Generators are available for the selected period."
- **Form** (`src/features/reservations/reservation-form.tsx`): React Hook Form with `useFieldArray` for the items, native `datetime-local` inputs (no date library added), and the same `fetch` + `router.refresh()` pattern the note editor uses. Location and equipment options are loaded by the server page. The same form is used to create and to edit.
- **Edit** (`src/server/reservations/update-reservation.ts`): `PUT /api/reservations/[id]` runs the same checks as create, but the availability query excludes the reservation being edited, so it never conflicts with itself. Items are replaced inside the transaction and the note is kept. Changing a draft to Confirmed is how a draft gets confirmed, and it goes through the availability check like any other confirmation.

## Trade-offs and incomplete work

- When several items conflict, only the first one is reported.
- UTC input keeps the app consistent, but people naturally type their local time. A time zone per location (Austin and Dallas are both `America/Chicago`) would be the better product choice.
- There is no success message after creating or editing a reservation; the user is taken back to the list.
- Error messages pluralize by adding an "s", which works for the current equipment names.
- A missing reservation on the edit page shows the not-found screen, but with a `200` status: the root `loading.tsx` makes pages stream, and Next.js can't change the status once streaming has started.
- There are no automated tests, since the brief doesn't require them. Boundaries, peak usage, drafts, validation errors, conflicts, edits (including a reservation not conflicting with itself), and two concurrent confirmations were verified manually against the seed data.

## Production considerations

**Concurrent confirmations.** SQLite handles one write at a time, so the transaction is enough here: when two confirmations race for the last 2 Generators, one succeeds and the other gets the availability error. On Postgres, the default isolation level would let both pass the check. I would lock the affected equipment rows (`SELECT ... FOR UPDATE`) before checking availability, or use `SERIALIZABLE` transactions and retry on serialization failures.

**Higher traffic.**

- The existing index on `Reservation(locationId, status, startAt, endAt)` covers the overlap query. With many reservations, the peak calculation could move into SQL instead of loading rows into memory.
- The reservation list loads every row; it would need pagination or a date range filter.
- Availability reads could be cached per location and period, and invalidated whenever a reservation for that location is created or changed.
- In a multi-tenant product, every query would be scoped by tenant and permissions checked on the server before any mutation.
- Structured logs and a metric for availability conflicts would show where inventory is running short.
