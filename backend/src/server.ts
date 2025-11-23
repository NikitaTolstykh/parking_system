import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import fs from 'fs';
import path from 'path';

const app = express();
const PORT = 3000;
const DB_PATH = path.join(__dirname, '../../db/db.json');

app.use(cors());
app.use(bodyParser.json());

function readDB() {
    const data = fs.readFileSync(DB_PATH, 'utf-8');
    return JSON.parse(data);
}

function saveDB(data: any) {
    fs.writeFileSync(DB_PATH, JSON.stringify(data, null, 2));
}

app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

app.post('/login', (req, res) => {
    const { email, password } = req.body;
    const db = readDB();
    const user = db.users.find((u: any) => u.email === email);

    if (!user) {
        return res.status(400).json({ message: 'User not found' });
    }

    if (user.password !== password) {
        return res.status(400).json({ message: 'Wrong password' });
    }

    res.json({ message: 'Login successful', user });
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
