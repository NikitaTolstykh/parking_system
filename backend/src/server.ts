import express from 'express';
import cors from 'cors';
import bodyParser from 'body-parser';
import { login, register, getBalance, addBalance } from './userService';
import {
    getFreeSpots,
    getSpotsByLocation,
    reserveSpot,
    getUserReservations,
} from './parkingService';
import {
    getAllSpots,
    addSpot,
    updateSpot,
    changeSpotStatus,
    deleteSpot,
    getAllReservations,
    forceEndReservation,
    getStatistics,
    cleanupExpiredReservations,
} from './adminService';

const app = express();
const PORT = 3000;

app.use(cors());
app.use(bodyParser.json());

// ============ MIDDLEWARE - Automatyczne czyszczenie wygasłych rezerwacji ============
app.use(async (req, res, next) => {
    // Uruchamiaj cleanup co 5 minut
    const lastCleanup = (global as any).lastCleanup || 0;
    const now = Date.now();

    if (now - lastCleanup > 5 * 60 * 1000) {
        try {
            await cleanupExpiredReservations();
            (global as any).lastCleanup = now;
        } catch (error) {
            console.error('Cleanup error:', error);
        }
    }

    next();
});

// ============ HEALTH CHECK ============
app.get('/ping', (req, res) => {
    res.json({ message: 'pong', timestamp: new Date().toISOString() });
});

// ============ USER ENDPOINTS ============
app.post('/register', async (req, res) => {
    const { email, password, role } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password required'
        });
    }

    const userRole = role === 'admin' ? 'admin' : 'user';
    const result = await register(email, password, userRole);
    res.status(result.success ? 200 : 400).json(result);
});

app.post('/login', async (req, res) => {
    const { email, password } = req.body;

    if (!email || !password) {
        return res.status(400).json({
            success: false,
            message: 'Email and password required'
        });
    }

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

    if (!email || amount === undefined) {
        return res.status(400).json({
            success: false,
            message: 'Email and amount required'
        });
    }

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

app.get('/admin/spots', async (req, res) => {
    const result = await getAllSpots();
    res.status(result.success ? 200 : 500).json(result);
});

app.post('/admin/spots', async (req, res) => {
    const { location, pricePerHour } = req.body;

    if (!location || !pricePerHour) {
        return res.status(400).json({
            success: false,
            message: 'Location and price required'
        });
    }

    const result = await addSpot(location, pricePerHour);
    res.status(result.success ? 200 : 400).json(result);
});

app.put('/admin/spots', async (req, res) => {
    const { spotId, location, pricePerHour } = req.body;

    if (!spotId) {
        return res.status(400).json({
            success: false,
            message: 'Spot ID required'
        });
    }

    const result = await updateSpot(spotId, location, pricePerHour);
    res.status(result.success ? 200 : 400).json(result);
});

app.put('/admin/spots/status', async (req, res) => {
    const { spotId, status } = req.body;

    if (!spotId || !status) {
        return res.status(400).json({
            success: false,
            message: 'Spot ID and status required'
        });
    }

    if (!['free', 'reserved', 'occupied'].includes(status)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid status. Must be: free, reserved, or occupied'
        });
    }

    const result = await changeSpotStatus(spotId, status);
    res.status(result.success ? 200 : 400).json(result);
});

app.delete('/admin/spots/:spotId', async (req, res) => {
    const spotId = parseInt(req.params.spotId);

    if (isNaN(spotId)) {
        return res.status(400).json({
            success: false,
            message: 'Invalid spot ID'
        });
    }

    const result = await deleteSpot(spotId);
    res.status(result.success ? 200 : 400).json(result);
});

app.get('/admin/reservations', async (req, res) => {
    const result = await getAllReservations();
    res.status(result.success ? 200 : 500).json(result);
});

app.post('/admin/end-reservation', async (req, res) => {
    const { reservationId } = req.body;

    if (!reservationId) {
        return res.status(400).json({
            success: false,
            message: 'Reservation ID required'
        });
    }

    const result = await forceEndReservation(reservationId);
    res.status(result.success ? 200 : 400).json(result);
});

app.post('/admin/cleanup', async (req, res) => {
    const result = await cleanupExpiredReservations();
    res.status(result.success ? 200 : 500).json(result);
});

app.get('/admin/statistics', async (req, res) => {
    const result = await getStatistics();
    res.status(result.success ? 200 : 500).json(result);
});

// ============ ERROR HANDLING ============
app.use((err: any, req: express.Request, res: express.Response, next: express.NextFunction) => {
    console.error('Error:', err);
    res.status(500).json({
        success: false,
        message: 'Internal server error'
    });
});

// ============ START SERVER ============
app.listen(PORT, () => {
    console.log(`
╔════════════════════════════════════════╗
║   Smart Parking System - Server       ║
╠════════════════════════════════════════╣
║   Port: ${PORT}                           ║
║   Status: Running ✓                    ║
║   Time: ${new Date().toLocaleString('pl-PL')}     ║
║   Auto-cleanup: Enabled (5 min)        ║
╚════════════════════════════════════════╝
    `);

    cleanupExpiredReservations().then(result => {
        console.log('Initial cleanup:', result);
    });
});

export default app;