import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { login, getBalance, addBalance } from './userService';
import {
    getFreeSpots,
    getSpotsByLocation,
    reserveSpot,
    getUserReservations,
    endReservation
} from './parkingService';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

app.get('/ping', (req, res) => {
    res.json({ message: 'pong' });
});

// ============ USER ENDPOINTS ============
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

// ============ PARKING ENDPOINTS ============
app.get('/spots/free', async (req, res) => {
    const result = await getFreeSpots();
    res.status(result.success ? 200 : 400).json(result);
});

app.get('/spots/search', async (req, res) => {
    const { location } = req.query;
    if (!location || typeof location !== 'string') {
        return res.status(400).json({
            success: false,
            message: 'Location parameter required'
        });
    }
    const result = await getSpotsByLocation(location);
    res.status(result.success ? 200 : 400).json(result);
});

app.post('/reserve', async (req, res) => {
    const { email, spotId, hours } = req.body;

    if (!email || !spotId || !hours) {
        return res.status(400).json({
            success: false,
            message: 'Missing required fields'
        });
    }

    const result = await reserveSpot(email, spotId, hours);
    res.status(result.success ? 200 : 400).json(result);
});

app.get('/reservations/:email', async (req, res) => {
    const { email } = req.params;
    const result = await getUserReservations(email);
    res.status(result.success ? 200 : 400).json(result);
});

// ============ ADMIN ENDPOINTS ============
app.post('/admin/end-reservation', async (req, res) => {
    const { reservationId } = req.body;

    if (!reservationId) {
        return res.status(400).json({
            success: false,
            message: 'Reservation ID required'
        });
    }

    const result = await endReservation(reservationId);
    res.status(result.success ? 200 : 400).json(result);
});

app.listen(PORT, () => {
    console.log(`Server running at http://localhost:${PORT}`);
});