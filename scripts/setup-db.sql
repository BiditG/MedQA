-- SQL schema for users table compatible with SQLite/Turso
CREATE TABLE IF NOT EXISTS users (
  id TEXT PRIMARY KEY,
  name TEXT,
  email TEXT UNIQUE,
  password_hash TEXT,
  role TEXT,
  created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
);

-- Example insert (replace hashed_password with a real bcrypt hash):
-- INSERT INTO users (id, name, email, password_hash, role) VALUES ('uuid-1', 'Admin', 'admin@example.com', '<hashed_password>', 'admin');
