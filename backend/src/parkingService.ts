import { getDB } from "./db";

export interface ParkingSpot {
    id: number;
    location: string;
    price_per_hour: number;
    status: 'free' | 'reserved' | 'occupied';
}

export interface Reservation {
    id: number;
    user_id: number;
    spot_id: number;
    start_time: string;
    end_time: string;
    paid: number;
}

export async function getFreeSpots() {
    const db = await getDB();
    const spots = await db.all<ParkingSpot[]>(
        "SELECT * FROM spots WHERE status = 'free'"
    );
    return { success: true, spots };
}

export async function getSpotsByLocation(location: string) {
    const db = await getDB();
    const spots = await db.all<ParkingSpot[]>(
        "SELECT * FROM spots WHERE location LIKE ? AND status = 'free'",
        `%${location}%`
    );
    return { success: true, spots };
}

export async function reserveSpot(
    userEmail: string,
    spotId: number,
    hours: number
) {
    const db = await getDB();

    const user = await db.get<any>(
        'SELECT * FROM users WHERE email = ?',
        userEmail
    );
    if (!user) {
        return { success: false, message: 'User not found' };
    }
    const spot = await db.get<ParkingSpot>(
        'SELECT * FROM spots WHERE id = ?',
        spotId
    );
    if (!spot) {
        return { success: false, message: 'Spot not found' };
    }
    if (spot.status !== 'free') {
        return { success: false, message: 'Spot not available' };
    }
    const totalCost = spot.price_per_hour * hours;
    if (user.balance < totalCost) {
        return { success: false, message: 'Insufficient balance' };
    }

    await db.run(
        'UPDATE users SET balance = balance - ? WHERE email = ?',
        totalCost,
        userEmail
    );

    await db.run(
        "UPDATE spots SET status = 'reserved' WHERE id = ?",
        spotId
    );

    const startTime = new Date().toISOString();
    const endTime = new Date(Date.now() + hours * 3600000).toISOString();

    const result = await db.run(
        'INSERT INTO reservations (user_id, spot_id, start_time, end_time, paid) VALUES (?, ?, ?, ?, ?)',
        user.id,
        spotId,
        startTime,
        endTime,
        totalCost
    );

    return {
        success: true,
        reservation: {
            id: result.lastID,
            spot_id: spotId,
            location: spot.location,
            start_time: startTime,
            end_time: endTime,
            paid: totalCost
        }
    };
}

export async function getUserReservations(userEmail: string) {
    const db = await getDB();

    const user = await db.get<any>(
        'SELECT id FROM users WHERE email = ?',
        userEmail
    );
    if (!user) {
        return { success: false, message: 'User not found' };
    }

    const reservations = await db.all(
        `SELECT r.*, s.location, s.price_per_hour 
         FROM reservations r 
         JOIN spots s ON r.spot_id = s.id 
         WHERE r.user_id = ? 
         ORDER BY r.start_time DESC`,
        user.id
    );

    return { success: true, reservations };
}

export async function endReservation(reservationId: number) {
    const db = await getDB();

    const reservation = await db.get<any>(
        'SELECT spot_id FROM reservations WHERE id = ?',
        reservationId
    );

    if (!reservation) {
        return { success: false, message: 'Reservation not found' };
    }

    await db.run(
        "UPDATE spots SET status = 'free' WHERE id = ?",
        reservation.spot_id
    );

    return { success: true, message: 'Reservation ended' };
}