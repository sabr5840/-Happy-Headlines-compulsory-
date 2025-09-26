CREATE TABLE IF NOT EXISTS profanity_words (
    id SERIAL PRIMARY KEY,
    word VARCHAR(50) UNIQUE NOT NULL
);

INSERT INTO profanity_words (word) VALUES
('fuck'),
('shit'),
('bitch')
ON CONFLICT DO NOTHING;
