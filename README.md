# Ledger — a notebook-styled bill splitter

Full-stack bill-splitting app: groups, expenses, "who owes whom," a debt
simplification algorithm, settlement history, and multi-currency support —
wrapped in a hand-drawn notebook look.

- **Backend:** Spring Boot 3 + PostgreSQL + JWT auth → see `backend/README.md`
- **Frontend:** Angular (standalone components/signals) → see `frontend/README.md`
- **Database:** `database/schema.sql` (reference — the backend auto-creates tables)

## Quick start

```bash
# 1. Database
psql -U postgres -c "CREATE DATABASE billsplit;"

# 2. Backend (http://localhost:8080)
cd backend
mvn spring-boot:run

# 3. Frontend (http://localhost:4200), in a second terminal
cd frontend
npm install
npm start
```

Then open http://localhost:4200, create an account, create a group, invite
a friend by email (they need an account too — or just make two accounts
yourself to try it out), and start adding expenses.

## What's implemented

- **Auth**: register/login with JWT, passwords hashed with BCrypt
- **Groups**: create, list, view, invite members by email
- **Expenses**: add with three split modes — equal, exact amounts, or
  percentages — each with its own currency + exchange rate snapshot
- **Balances**: live "who owes whom" per group, in the group's base currency
- **Debt simplification**: a greedy algorithm reduces everyone's tangled
  IOUs down to the minimum number of payments needed to settle up
  (`backend/.../service/BalanceService.java`)
- **Settlements**: record a payment (with optional currency + note), see
  full settlement history per group
- **Multi-currency**: every expense and settlement stores its own currency
  and a snapshot exchange rate to the group's base currency, so historical
  amounts stay accurate even if today's rates change

## Where to look first

- The debt-simplification algorithm: `backend/src/main/java/com/notebook/splitter/service/BalanceService.java`
- The split-calculation logic (equal/exact/percentage): `backend/.../service/ExpenseService.java`
- The notebook design system: `frontend/src/styles.scss`
- The main group screen (tabs for expenses/balances/history): `frontend/src/app/features/groups/group-detail/group-detail.component.ts`

## Beginner-friendly by design

- `spring.jpa.hibernate.ddl-auto: update` means you never have to hand-run
  SQL migrations while learning — the backend builds its own tables.
- Every backend class has a short comment explaining *why* it exists, not
  just what it does.
- The frontend has no NgRx, no UI kit, no build plugins beyond the Angular
  CLI defaults — just components, services, and one shared stylesheet.
- Error messages from the backend are plain English and shown directly in
  the UI (see the `.error-note` boxes).
