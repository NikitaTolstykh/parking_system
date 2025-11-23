import sqlite3 from "sqlite3";
import { open } from "sqlite";
import path from "path";
import fs from "fs";

const DB_PATH = path.join(__dirname, "../db/db.sqlite");
const SCHEMA_PATH = path.join(__dirname, "schema.sql");

let initialized = false;

export async function getDB() {
    const db = await open({
        filename: DB_PATH,
        driver: sqlite3.Database
    });

    if (!initialized) {
        const sql = fs.readFileSync(SCHEMA_PATH, "utf8");
        await db.exec(sql);
        initialized = true;
        console.log("📌 Database initialized from schema.sql");
    }

    return db;
}
