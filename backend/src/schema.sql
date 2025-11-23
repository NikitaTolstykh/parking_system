-- Smart Parking System Database Schema
-- SQLite Database

-- ============================================
-- Tabela użytkowników
-- ============================================
CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     email TEXT UNIQUE NOT NULL,
                                     password TEXT NOT NULL,
                                     role TEXT DEFAULT 'user' CHECK(role IN ('user', 'admin')),
                                     balance REAL DEFAULT 0,
                                     created_at TEXT DEFAULT (datetime('now')),
                                     CONSTRAINT email_format CHECK (email LIKE '%@%.%')
);

-- ============================================
-- Tabela miejsc parkingowych
-- ============================================
CREATE TABLE IF NOT EXISTS spots (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     location TEXT NOT NULL,
                                     price_per_hour REAL NOT NULL,
                                     status TEXT DEFAULT 'free' CHECK(status IN ('free', 'reserved', 'occupied')),
                                     created_at TEXT DEFAULT (datetime('now')),
                                     updated_at TEXT DEFAULT (datetime('now')),
                                     CONSTRAINT price_positive CHECK (price_per_hour > 0)
);

-- ============================================
-- Tabela rezerwacji
-- ============================================
CREATE TABLE IF NOT EXISTS reservations (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            user_id INTEGER NOT NULL,
                                            spot_id INTEGER NOT NULL,
                                            start_time TEXT NOT NULL,
                                            end_time TEXT NOT NULL,
                                            paid REAL NOT NULL,
                                            created_at TEXT DEFAULT (datetime('now')),
                                            FOREIGN KEY(user_id) REFERENCES users(id) ON DELETE CASCADE,
                                            FOREIGN KEY(spot_id) REFERENCES spots(id) ON DELETE CASCADE,
                                            CONSTRAINT paid_positive CHECK (paid >= 0)
);

-- ============================================
-- Indeksy dla optymalizacji zapytań
-- ============================================
CREATE INDEX IF NOT EXISTS idx_users_email ON users(email);
CREATE INDEX IF NOT EXISTS idx_spots_status ON spots(status);
CREATE INDEX IF NOT EXISTS idx_reservations_user ON reservations(user_id);
CREATE INDEX IF NOT EXISTS idx_reservations_spot ON reservations(spot_id);
CREATE INDEX IF NOT EXISTS idx_reservations_time ON reservations(start_time, end_time);

-- ============================================
-- Dane testowe - użytkownicy
-- ============================================
INSERT OR IGNORE INTO users (id, email, password, role, balance) VALUES
                                                                     (1, 'user@example.com', '123456', 'user', 100.0),
                                                                     (2, 'admin@example.com', 'admin123', 'admin', 500.0),
                                                                     (3, 'test@example.com', 'test123', 'user', 50.0);

-- ============================================
-- Dane testowe - miejsca parkingowe
-- ============================================
INSERT OR IGNORE INTO spots (id, location, price_per_hour, status) VALUES
                                                                       (1, 'Center Street 12', 5.0, 'free'),
                                                                       (2, 'Main Avenue 24', 7.0, 'free'),
                                                                       (3, 'Park Road 5', 6.0, 'free'),
                                                                       (4, 'Downtown Plaza', 8.0, 'free'),
                                                                       (5, 'Shopping Mall A1', 4.5, 'free'),
                                                                       (6, 'Central Station', 10.0, 'free'),
                                                                       (7, 'Old Town Square', 6.5, 'free'),
                                                                       (8, 'Business District 15', 9.0, 'free'),
                                                                       (9, 'University Campus', 3.5, 'free'),
                                                                       (10, 'Airport Terminal 2', 12.0, 'free');

-- ============================================
-- Dane testowe - przykładowe rezerwacje
-- ============================================
INSERT OR IGNORE INTO reservations (user_id, spot_id, start_time, end_time, paid) VALUES
                                                                                      (1, 1, datetime('now', '-2 days'), datetime('now', '-2 days', '+3 hours'), 15.0),
                                                                                      (1, 3, datetime('now', '-1 day'), datetime('now', '-1 day', '+5 hours'), 30.0),
                                                                                      (3, 2, datetime('now', '-3 hours'), datetime('now', '+1 hour'), 28.0);

-- ============================================
-- Trigger do automatycznej aktualizacji updated_at
-- ============================================
CREATE TRIGGER IF NOT EXISTS update_spots_timestamp
    AFTER UPDATE ON spots
BEGIN
    UPDATE spots SET updated_at = datetime('now') WHERE id = NEW.id;
END;

-- ============================================
-- Widok do raportowania
-- ============================================
CREATE VIEW IF NOT EXISTS reservation_report AS
SELECT
    r.id as reservation_id,
    u.email as user_email,
    s.location as spot_location,
    s.price_per_hour,
    r.start_time,
    r.end_time,
    r.paid,
    ROUND((julianday(r.end_time) - julianday(r.start_time)) * 24, 2) as duration_hours
FROM reservations r
         JOIN users u ON r.user_id = u.id
         JOIN spots s ON r.spot_id = s.id
ORDER BY r.start_time DESC;

-- ============================================
-- Sprawdzenie integralności danych
-- ============================================
PRAGMA foreign_keys = ON;
PRAGMA journal_mode = WAL;

-- ============================================
-- Statystyki bazy danych
-- ============================================
SELECT
    'Database initialized successfully!' as message,
    (SELECT COUNT(*) FROM users) as total_users,
    (SELECT COUNT(*) FROM spots) as total_spots,
    (SELECT COUNT(*) FROM reservations) as total_reservations;