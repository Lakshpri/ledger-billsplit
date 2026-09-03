-- ============================================================================
-- Bill Splitter - PostgreSQL schema (reference)
-- ============================================================================
-- NOTE: The Spring Boot backend uses `spring.jpa.hibernate.ddl-auto: update`,
-- so it will CREATE these tables automatically the first time you run it.
-- This file is provided so you can read/understand the schema, or run it
-- manually if you prefer ddl-auto: validate in a production setup.
-- ============================================================================

CREATE DATABASE billsplit;
-- Then connect to it (\c billsplit) before running the rest.

CREATE TABLE IF NOT EXISTS users (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(100) NOT NULL,
    email           VARCHAR(150) NOT NULL UNIQUE,
    password        VARCHAR(255) NOT NULL,
    avatar_color    VARCHAR(10) DEFAULT '#FFE28A',
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS groups (
    id              BIGSERIAL PRIMARY KEY,
    name            VARCHAR(120) NOT NULL,
    description     VARCHAR(255),
    icon            VARCHAR(10) DEFAULT '📒',
    base_currency   VARCHAR(3) NOT NULL DEFAULT 'USD',
    created_by      BIGINT NOT NULL REFERENCES users(id),
    created_at      TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS group_members (
    id              BIGSERIAL PRIMARY KEY,
    group_id        BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id) ON DELETE CASCADE,
    joined_at       TIMESTAMP NOT NULL DEFAULT now(),
    UNIQUE (group_id, user_id)
);

CREATE TABLE IF NOT EXISTS expenses (
    id                      BIGSERIAL PRIMARY KEY,
    group_id                BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    description             VARCHAR(150) NOT NULL,
    category                VARCHAR(30) DEFAULT 'General',
    amount                  NUMERIC(12,2) NOT NULL,
    currency                VARCHAR(3) NOT NULL,
    exchange_rate_to_base   NUMERIC(18,8) NOT NULL DEFAULT 1,
    paid_by                 BIGINT NOT NULL REFERENCES users(id),
    expense_date            DATE NOT NULL,
    created_at              TIMESTAMP NOT NULL DEFAULT now()
);

CREATE TABLE IF NOT EXISTS expense_splits (
    id              BIGSERIAL PRIMARY KEY,
    expense_id      BIGINT NOT NULL REFERENCES expenses(id) ON DELETE CASCADE,
    user_id         BIGINT NOT NULL REFERENCES users(id),
    share_amount    NUMERIC(12,2) NOT NULL
);

CREATE TABLE IF NOT EXISTS settlements (
    id                      BIGSERIAL PRIMARY KEY,
    group_id                BIGINT NOT NULL REFERENCES groups(id) ON DELETE CASCADE,
    from_user               BIGINT NOT NULL REFERENCES users(id),
    to_user                 BIGINT NOT NULL REFERENCES users(id),
    amount                  NUMERIC(12,2) NOT NULL,
    currency                VARCHAR(3) NOT NULL,
    exchange_rate_to_base   NUMERIC(18,8) NOT NULL DEFAULT 1,
    note                    VARCHAR(255),
    settled_at              TIMESTAMP NOT NULL DEFAULT now()
);

-- Helpful indexes
CREATE INDEX IF NOT EXISTS idx_group_members_group ON group_members(group_id);
CREATE INDEX IF NOT EXISTS idx_group_members_user  ON group_members(user_id);
CREATE INDEX IF NOT EXISTS idx_expenses_group       ON expenses(group_id);
CREATE INDEX IF NOT EXISTS idx_expense_splits_exp   ON expense_splits(expense_id);
CREATE INDEX IF NOT EXISTS idx_settlements_group    ON settlements(group_id);
