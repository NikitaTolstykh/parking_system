import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { login, getBalance, addBalance } from './userService';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;
    const result = await login(email, password);
    res.status(result.success ? 200 : 400).json(result);
});

app.get('/balance/:email', async (req, res) => {
    const { email } = req.params;
    const result = await getBalance(email);
    res.status(result.success ? 200 : 400).json(result);
});

app.post('/add-balance', async (req, res) => {
    const { email, amount } = req.body;
    const result = await addBalance(email, amount);
    res.status(result.success ? 200 : 400).json(result);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});
