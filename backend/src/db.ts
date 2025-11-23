import sqlite3 from 'sqlite3';
import { open } from 'sqlite';
import path from 'path';

const DB_PATH = path.join(__dirname, '../db/db.sqlite');

export async function getDB() {
    return open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });
}