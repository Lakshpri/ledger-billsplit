<div align="center">

<img width="100%" src="https://capsule-render.vercel.app/api?type=waving&color=0:F5E6C8,100:E8B923&height=200&section=header&text=Ledger&fontSize=70&fontColor=2B2416&fontAlignY=38&desc=split%20bills%2C%20not%20friendships&descAlignY=58&descSize=20&animation=fadeIn" alt="Ledger banner"/>

<a href="https://github.com/Lakshpri/ledger-billsplit">
  <img src="https://readme-typing-svg.demolab.com?font=Fira+Code&size=22&duration=2800&pause=1200&color=E8B923&center=true&vCenter=true&width=650&lines=Who+owes+whom%3F+Let+the+algorithm+decide.;Groups.+Expenses.+Settlements.+Simplified.;Built+with+Angular+%2B+Spring+Boot+%2B+PostgreSQL." alt="Typing SVG" />
</a>

<br/>

<img src="https://img.shields.io/badge/Angular-DD0031?style=for-the-badge&logo=angular&logoColor=white" />
<img src="https://img.shields.io/badge/Spring_Boot-6DB33F?style=for-the-badge&logo=springboot&logoColor=white" />
<img src="https://img.shields.io/badge/PostgreSQL-4169E1?style=for-the-badge&logo=postgresql&logoColor=white" />
<img src="https://img.shields.io/badge/JWT-000000?style=for-the-badge&logo=jsonwebtokens&logoColor=white" />

<br/><br/>

<img src="https://img.shields.io/github/last-commit/Lakshpri/ledger-billsplit?style=flat-square&color=E8B923&label=last%20commit" />
<img src="https://img.shields.io/github/languages/top/Lakshpri/ledger-billsplit?style=flat-square&color=E8B923" />
<img src="https://img.shields.io/badge/status-active-brightgreen?style=flat-square" />
<img src="https://img.shields.io/badge/license-MIT-lightgrey?style=flat-square" />

</div>

<br/>

<p align="center">
  <img src="./assets/demo.gif" width="90%" alt="Ledger animated walkthrough" />
</p>
<p align="center"><sub><i>Animated walkthrough mockup — login → create group → add expense → balances → settle up.</i></sub></p>

<p align="center">
  <img src="./assets/app-screenshot.png" width="90%" alt="Ledger app screenshot" />
</p>

---

### ✍️ What is this?

A full-stack, notebook-styled bill splitter. Create a group, log shared expenses in three different ways, and let a **debt-simplification algorithm** figure out the minimum number of payments needed to settle everyone up — instead of everyone paying everyone.

<br/>

<table align="center">
<tr>
<td width="33%" valign="top">

#### 👥 Groups
Create groups, invite members by email, see everyone's avatar at a glance.

</td>
<td width="33%" valign="top">

#### 🧾 Expenses
Split **equally**, by **exact amounts**, or by **percentage** — each with its own currency snapshot.

</td>
<td width="33%" valign="top">

#### ⚖️ Balances
A greedy algorithm collapses tangled IOUs into the *fewest possible payments*.

</td>
</tr>
</table>

<br/>

---

### 🧠 Under the hood
┌─────────────────────┐ JWT ┌──────────────────────┐ JPA ┌─────────────┐
│ Angular Frontend │ ─────────────────▶ │ Spring Boot Backend │ ─────────────────▶ │ PostgreSQL │
│ standalone + signals│ ◀───────────────── │ REST + BCrypt auth │ ◀───────────────── │ │
└─────────────────────┘ └──────────────────────┘ └─────────────┘


| Layer | Stack |
|---|---|
| **Frontend** | Angular (standalone components, signals) — no NgRx, no UI kit, just components + services |
| **Backend** | Spring Boot 3, Spring Security, JWT auth, BCrypt password hashing |
| **Database** | PostgreSQL via JPA/Hibernate — auto-migrated (`ddl-auto: update`) |
| **Auth** | Stateless JWT, 24h expiry |

<br/>

---

### 🚀 Quick start

```bash
# 1. Database
psql -U postgres -c "CREATE DATABASE billsplit;"

# 2. Backend  → http://localhost:8765
cd backend
mvn spring-boot:run

# 3. Frontend → http://localhost:4200 (in a second terminal)
cd frontend
npm install
npm start
```

Then open **http://localhost:4200**, create an account, spin up a group, invite a friend by email (they'll need an account too — or just make two yourself to try it out), and start adding expenses.

<br/>

---

### ⚙️ What's implemented

- 🔐 **Auth** — register/login with JWT, passwords hashed with BCrypt
- 👥 **Groups** — create, list, view, invite members by email
- 🧾 **Expenses** — three split modes (equal / exact / percentage), each with its own currency + exchange-rate snapshot
- ⚖️ **Balances** — live "who owes whom" per group, shown in the group's base currency
- 🧮 **Debt simplification** — a greedy algorithm reduces everyone's tangled IOUs to the minimum number of payments needed to settle up → [`BalanceService.java`](backend/src/main/java/com/notebook/splitter/service/BalanceService.java)
- 💵 **Settlements** — record a payment (currency + note optional), view full settlement history per group
- 🌍 **Multi-currency** — every expense/settlement stores its own currency + a snapshot exchange rate to the group's base currency, so historical amounts stay accurate even if today's rates change

<br/>

---

### 🔍 Where to look first

| Curious about... | Look here |
|---|---|
| The debt-simplification algorithm | [`backend/.../service/BalanceService.java`](backend/src/main/java/com/notebook/splitter/service/BalanceService.java) |
| Split calculation logic (equal/exact/%) | [`backend/.../service/ExpenseService.java`](backend/src/main/java/com/notebook/splitter/service/ExpenseService.java) |
| The notebook design system | [`frontend/src/styles.scss`](frontend/src/styles.scss) |
| The main group screen (tabs) | [`frontend/.../group-detail.component.ts`](frontend/src/app/features/groups/group-detail/group-detail.component.ts) |

<br/>

---

### 🌱 Beginner-friendly by design

- `spring.jpa.hibernate.ddl-auto: update` — no hand-run SQL migrations while learning; the backend builds its own tables
- Every backend class has a short comment explaining **why** it exists, not just what it does
- The frontend has no NgRx, no UI kit, no extra build plugins — just components, services, and one shared stylesheet
- Backend errors are plain English and shown directly in the UI (see the `.error-note` boxes)

<br/>

---

<div align="center">

**Backend docs →** [`backend/README.md`](backend/README.md) &nbsp;|&nbsp; **Frontend docs →** [`frontend/README.md`](frontend/README.md) &nbsp;|&nbsp; **Schema reference →** [`database/schema.sql`](database/schema.sql)

<br/>

<img src="https://capsule-render.vercel.app/api?type=waving&color=0:E8B923,100:F5E6C8&height=100&section=footer" width="100%"/>

</div>
