# Ledger — Backend (Spring Boot)

A REST API for a bill-splitting app: groups, expenses, split calculations,
debt simplification, settlement history, and multi-currency support.

## Tech stack
- Java 17
- Spring Boot 3.3 (Web, Data JPA, Security, Validation)
- PostgreSQL
- JWT authentication (io.jsonwebtoken)
- Lombok

## 1. Set up PostgreSQL

```bash
psql -U postgres
CREATE DATABASE billsplit;
\q
```

You don't need to run `database/schema.sql` manually — Hibernate will create
all tables automatically the first time you start the app, because
`spring.jpa.hibernate.ddl-auto` is set to `update` in `application.yml`.
The schema file is there for reference/documentation.

## 2. Configure the connection

Edit `src/main/resources/application.yml` if your Postgres username/password
differ from the defaults (`postgres` / `postgres`):

```yaml
spring:
  datasource:
    url: jdbc:postgresql://localhost:5432/billsplit
    username: postgres
    password: postgres
```

## 3. Run it

```bash
cd backend
mvn spring-boot:run
```

The API starts on **http://localhost:8080**.

## API overview

All endpoints are under `/api`. Everything except `/api/auth/**` requires
an `Authorization: Bearer <token>` header (returned from login/register).

| Method | Endpoint | What it does |
|---|---|---|
| POST | `/api/auth/register` | Create an account |
| POST | `/api/auth/login` | Log in, get a JWT |
| GET | `/api/users/me` | Current logged-in user |
| GET | `/api/groups` | List my groups |
| POST | `/api/groups` | Create a group |
| GET | `/api/groups/{id}` | Group details + members |
| POST | `/api/groups/{id}/members` | Add a member by email |
| GET | `/api/groups/{id}/expenses` | List expenses |
| POST | `/api/groups/{id}/expenses` | Add an expense (EQUAL / EXACT / PERCENTAGE split) |
| DELETE | `/api/groups/{id}/expenses/{expenseId}` | Remove an expense |
| GET | `/api/groups/{id}/balances` | Net balances + simplified debts |
| GET | `/api/groups/{id}/settlements` | Settlement history |
| POST | `/api/groups/{id}/settlements` | Record a payment |
| GET | `/api/currencies` | Static list of currency codes for dropdowns |

## How the debt-simplification algorithm works

See `service/BalanceService.java`. In short:

1. Every expense credits the payer and debits each participant, converted to
   the group's base currency using the exchange rate stored on that expense.
2. Every recorded settlement also adjusts both people's balances.
3. This produces one **net balance** per person (positive = owed money,
   negative = owes money).
4. To simplify the debts into the minimum number of payments, we repeatedly
   match the person owed the *most* against the person who owes the *most*,
   settle the smaller of the two amounts between them, and repeat. This is
   the same greedy approach used by apps like Splitwise.

## Multi-currency support

Every `Expense` and `Settlement` stores its own `currency` plus an
`exchangeRateToBase` snapshot (rate → the group's base currency) at the time
it was created. Balances are always computed in the group's base currency,
so historical amounts never shift even if today's real exchange rate changes.
In a production app you'd fetch live rates from a service like
exchangerate.host and default `exchangeRateToBase` from that.

## Project layout

```
src/main/java/com/notebook/splitter/
├── entity/        JPA entities (User, Group, GroupMember, Expense, ExpenseSplit, Settlement)
├── repository/    Spring Data JPA repositories
├── service/       Business logic (GroupService, ExpenseService, BalanceService, SettlementService, AuthService)
├── controller/    REST controllers
├── dto/           Request/response objects
├── security/      JWT generation/validation + auth filter
├── config/        Spring Security config (CORS, stateless JWT auth)
└── exception/     Centralized error handling
```
