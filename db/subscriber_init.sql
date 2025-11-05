-- db/subscriber_init.sql

CREATE TABLE IF NOT EXISTS subscribers (
     id SERIAL PRIMARY KEY,
     name TEXT    NOT NULL,
     email TEXT    NOT NULL UNIQUE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );

-- Queue som NewsletterService kan læse fra
CREATE TABLE IF NOT EXISTS subscriber_queue (
     id SERIAL PRIMARY KEY,
     subscriber_id INTEGER NOT NULL REFERENCES subscribers(id) ON DELETE CASCADE,
     action TEXT NOT NULL,
     processed BOOLEAN NOT NULL DEFAULT FALSE,
     created_at TIMESTAMPTZ NOT NULL DEFAULT NOW()
    );
