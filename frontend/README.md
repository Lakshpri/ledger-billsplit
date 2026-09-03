# Ledger — Frontend (Angular)

A notebook-styled UI for the bill-splitting app: ruled paper background,
handwritten headings, sticky-note balance cards, and washi-tape accents.

## Tech stack
- Angular (standalone components + signals — works with Angular 17 and up,
  including the newest majors; no NgModules used anywhere)
- TypeScript
- Plain CSS/SCSS design system (no UI kit) — see `src/styles.scss` for tokens

> **Note on "Angular 21":** at the time this project was built, the latest
> publicly released Angular major was 18/19. This code uses the modern
> **standalone component + signals** API (no NgModules), which is the same
> API surface newer Angular versions build on — so it will keep working as
> Angular ships new majors. If you scaffold this into a real `ng new`
> project on a newer CLI, just copy the `src/app` folder over.

## 1. Install dependencies

```bash
cd frontend
npm install
```

## 2. Point it at your backend

`src/environments/environment.ts` defaults to `http://localhost:8080/api`,
matching the Spring Boot backend's default port. Change it if needed.

## 3. Run it

```bash
npm start
```

Visit **http://localhost:4200**.

## What's inside

```
src/app/
├── core/
│   ├── models/         TypeScript interfaces mirroring backend DTOs
│   ├── services/       AuthService, GroupService, ExpenseService,
│   │                   SettlementService, BalanceService, CurrencyService
│   ├── interceptors/   Attaches the JWT to every request
│   └── guards/         authGuard — redirects to /login if not signed in
├── features/
│   ├── auth/            login + register pages
│   ├── groups/           group-list (dashboard), group-create, group-detail
│   ├── expenses/         expense-form (equal / exact / percentage splits)
│   └── settlements/      settle-up modal (with one-tap suggestions from
│                         the simplified debt plan)
└── shared/components/
    ├── navbar/           top bar
    └── balance-card/     the sticky-note balance widget
```

## Design notes

The whole app leans into a literal "notebook" metaphor because that's what
was asked for:
- Ruled horizontal lines + a red margin rule, like school paper
  (`body` background in `styles.scss`)
- A spiral-binding strip down the left edge
- `Caveat` for headings (handwriting), `Patrick Hand` for UI labels/tape,
  `Nunito Sans` for body copy — see the `<link>` tags in `index.html`
- "Torn paper" cards (asymmetric border-radius) for group tiles and modals
- Sticky-note colored cards for each member's balance
- Washi-tape `<span class="tape">` labels used as little section markers

All of this lives in `src/styles.scss` as reusable classes (`.torn-card`,
`.sticky`, `.tape`, `.btn`, `.field`, `.chip`, `.avatar` …) so new pages can
reuse the same look without redefining it.
