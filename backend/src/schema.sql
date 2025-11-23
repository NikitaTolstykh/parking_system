-- Tabela użytkowników
CREATE TABLE IF NOT EXISTS users (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     email TEXT UNIQUE NOT NULL,
                                     password TEXT NOT NULL,
                                     balance REAL DEFAULT 0
);

-- Tabela miejsc parkingowych
CREATE TABLE IF NOT EXISTS spots (
                                     id INTEGER PRIMARY KEY AUTOINCREMENT,
                                     location TEXT NOT NULL,
                                     price_per_hour REAL NOT NULL,
                                     status TEXT DEFAULT 'free' CHECK(status IN ('free', 'reserved', 'occupied'))
);

-- Tabela rezerwacji
CREATE TABLE IF NOT EXISTS reservations (
                                            id INTEGER PRIMARY KEY AUTOINCREMENT,
                                            user_id INTEGER NOT NULL,
                                            spot_id INTEGER NOT NULL,
                                            start_time TEXT NOT NULL,
                                            end_time TEXT NOT NULL,
                                            paid REAL NOT NULL,
                                            FOREIGN KEY(user_id) REFERENCES users(id),
                                            FOREIGN KEY(spot_id) REFERENCES spots(id)
);

-- Dane testowe - użytkownicy
INSERT INTO users (email, password, balance) VALUES
                                                 ('user@example.com', '123456', 100.0),
                                                 ('admin@example.com', 'admin123', 500.0);

-- Dane testowe - miejsca parkingowe
INSERT INTO spots (location, price_per_hour, status) VALUES
                                                         ('Center Street 12', 5.0, 'free'),
                                                         ('Main Avenue 24', 7.0, 'free'),
                                                         ('Park Road 5', 6.0, 'free'),
                                                         ('Downtown Plaza', 8.0, 'free'),
                                                         ('Shopping Mall A1', 4.5, 'free'),
                                                         ('Central Station', 10.0, 'free'),
                                                         ('Old Town Square', 6.5, 'free'),
                                                         ('Business District 15', 9.0, 'free');