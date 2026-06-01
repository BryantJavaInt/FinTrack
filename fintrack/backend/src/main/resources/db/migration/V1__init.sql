-- V1: initial schema
-- Users
CREATE TABLE users (
    id         BIGSERIAL PRIMARY KEY,
    email      VARCHAR(255) NOT NULL UNIQUE,
    password   VARCHAR(255) NOT NULL,
    full_name  VARCHAR(255) NOT NULL,
    created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

-- Accounts
CREATE TABLE accounts (
    id           BIGSERIAL PRIMARY KEY,
    user_id      BIGINT       NOT NULL REFERENCES users (id) ON DELETE CASCADE,
    name         VARCHAR(255) NOT NULL,
    currency     VARCHAR(3)   NOT NULL,
    created_at   TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    CONSTRAINT uq_account_name_per_user UNIQUE (user_id, name)
);

-- Transactions
CREATE TABLE transactions (
    id          BIGSERIAL PRIMARY KEY,
    account_id  BIGINT           NOT NULL REFERENCES accounts (id) ON DELETE CASCADE,
    amount      NUMERIC(19, 4)   NOT NULL,
    type        VARCHAR(20)      NOT NULL CHECK (type IN ('INCOME', 'EXPENSE')),
    category    VARCHAR(100)     NOT NULL,
    description VARCHAR(500),
    occurred_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW(),
    created_at  TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT NOW()
);

CREATE INDEX idx_transactions_account_id ON transactions (account_id);
CREATE INDEX idx_transactions_occurred_at ON transactions (occurred_at DESC);
CREATE INDEX idx_accounts_user_id ON accounts (user_id);