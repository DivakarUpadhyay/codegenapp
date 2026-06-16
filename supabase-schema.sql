-- ============================================================
--  UniqueCodeApp — Supabase / PostgreSQL Schema
--  Run this entire file in the Supabase SQL Editor
-- ============================================================

-- Roles
CREATE TABLE IF NOT EXISTS roles (
  role_id   SERIAL PRIMARY KEY,
  role_name VARCHAR(50)
);

INSERT INTO roles (role_name) VALUES ('Admin'), ('User')
ON CONFLICT DO NOTHING;

-- Users
CREATE TABLE IF NOT EXISTS users (
  user_id       SERIAL PRIMARY KEY,
  role_id       INT          NOT NULL DEFAULT 0,
  first_name    VARCHAR(50)  NOT NULL,
  last_name     VARCHAR(50)  NOT NULL,
  username      VARCHAR(100),
  password_hash TEXT         NOT NULL,
  email_id      VARCHAR(100) NOT NULL UNIQUE,
  is_active     BOOLEAN      NOT NULL DEFAULT false,
  created_at    TIMESTAMP    NOT NULL DEFAULT NOW(),
  last_login    TIMESTAMP,
  CONSTRAINT fk_role FOREIGN KEY (role_id) REFERENCES roles(role_id)
);

-- Code Storage
CREATE TABLE IF NOT EXISTS code_storage (
  code_id       SERIAL PRIMARY KEY,
  user_id       INT  NOT NULL,
  code          INT  NOT NULL UNIQUE,
  created_date  TIMESTAMP NOT NULL DEFAULT NOW(),
  is_used       BOOLEAN   NOT NULL DEFAULT false,
  user_remarks  TEXT,
  admin_remarks TEXT,
  CONSTRAINT fk_user FOREIGN KEY (user_id) REFERENCES users(user_id)
);

-- Error Log
CREATE TABLE IF NOT EXISTS error_log (
  log_id          SERIAL PRIMARY KEY,
  error_message   VARCHAR(4000),
  error_severity  INT,
  error_state     INT,
  date_created    TIMESTAMP DEFAULT NOW()
);
