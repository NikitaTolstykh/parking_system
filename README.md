# parking_system

Celem projektu jest stworzenie kompleksowego systemu mobilnego umożliwiającego zarządzanie miejscami parkingowymi w mieście. System składa się z aplikacji mobilnej (React Native), serwisu webowego (Node.js/Express) oraz bazy danych (SQLite).

Główne wartości użytkowe:
Użytkownicy mogą w czasie rzeczywistym przeglądać wolne miejsca parkingowe
Możliwość rezerwacji i opłacenia miejsca parkingowego z poziomu aplikacji mobilnej
Panel administracyjny do zarządzania miejscami parkingowymi i rezerwacjami
System automatycznie zwalnia miejsca po upływie czasu rezerwacji
Historia wszystkich transakcji i rezerwacji użytkowników

Zakres projektu
System składa się z trzech głównych modułów:

Moduł 1: Aplikacja mobilna (React Native)
Interfejs użytkownika dla klientów końcowych
Interfejs administracyjny dla zarządzania systemem
Komunikacja z Web Service przez REST API
Obsługa dwóch ról użytkowników: USER i ADMIN

Moduł 2: Web Service (Node.js + Express)
REST API obsługujące wszystkie operacje biznesowe
Walidacja danych i autoryzacja użytkowników
Logika biznesowa systemu rezerwacji
Automatyczne czyszczenie wygasłych rezerwacji

Moduł 3: Baza danych (SQLite)
Przechowywanie danych użytkowników
Zarządzanie miejscami parkingowymi
Historia rezerwacji i transakcji
Relacyjny model danych z kluczami obcymi

1. Wymagania systemowe
1.1. Oprogramowanie wymagane

Node.js: v16.0.0 lub nowszy
npm: v8.0.0 lub nowszy (lub yarn)
React Native CLI: Zainstalowany globalnie
Android Studio: Dla emulacji Android (opcjonalnie)
Xcode: Dla emulacji iOS - tylko macOS (opcjonalnie)

1.2. System operacyjny

Windows 10/11
macOS 10.15 lub nowszy
Linux (Ubuntu 20.04+ lub równoważny)

2. Instalacja backendu (Web Service)
Krok 1: Sklonuj repozytorium lub rozpakuj pliki
cd smart-parking-backend

Krok 2: Zainstaluj zależności
npm install

Krok 3: Struktura katalogów
smart-parking-backend/
<img width="415" height="309" alt="image" src="https://github.com/user-attachments/assets/2e7cee05-fb5c-43ca-8d68-c72d6c1b8404" />

Krok 4: Konfiguracja
package.json:
{
  "name": "smart-parking-backend",
  "version": "1.0.0",
  "scripts": {
    "dev": "ts-node src/server.ts",
    "build": "tsc",
    "start": "node dist/server.js"
  },
  "dependencies": {
    "express": "^4.18.2",
    "cors": "^2.8.5",
    "body-parser": "^1.20.2",
    "sqlite": "^5.0.1",
    "sqlite3": "^5.1.6"
  },
  "devDependencies": {
    "@types/node": "^20.0.0",
    "@types/express": "^4.17.17",
    "@types/cors": "^2.8.13",
    "typescript": "^5.0.0",
    "ts-node": "^10.9.1"
  }
}

tsconfig.json:
{
  "compilerOptions": {
    "target": "ES2020",
    "module": "commonjs",
    "outDir": "./dist",
    "rootDir": "./src",
    "strict": true,
    "esModuleInterop": true,
    "skipLibCheck": true,
    "forceConsistentCasingInFileNames": true,
    "resolveJsonModule": true
  },
  "include": ["src/**/*"],
  "exclude": ["node_modules"]
}

Krok 5: Uruchomienie serwera
Tryb developerski:
npm run dev

Tryb produkcyjny:
npm run build
npm start

Krok 6: Weryfikacja
Serwer powinien być dostępny na: http://localhost:3000
Test połączenia:
curl http://localhost:3000/ping

Oczekiwana odpowiedź:
{
  "message": "pong",
  "timestamp": "2024-01-15T10:30:00.000Z"
}
