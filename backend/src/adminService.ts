import { getDB } from "./db";

export interface AdminSpot {
    id: number;
    location: string;
    price_per_hour: number;
    status: 'free' | 'reserved' | 'occupied';
}

export async function getAllSpots() {
    const db = await getDB();
    const spots = await db.all<AdminSpot[]>('SELECT * FROM spots ORDER BY id');
    return { success: true, spots };
}

export async function addSpot(location: string, pricePerHour: number) {
    const db = await getDB();

    if (!location || pricePerHour <= 0) {
        return { success: false, message: 'Invalid data' };
    }

    try {
        const result = await db.run(
            'INSERT INTO spots (location, price_per_hour, status) VALUES (?, ?, ?)',
            location,
            pricePerHour,
            'free'
        );

        return {
            success: true,
            message: 'Spot added successfully',
            spotId: result.lastID
        };
    } catch (error) {
        return { success: false, message: 'Failed to add spot' };
    }
}

export async function updateSpot(
    spotId: number,
    location?: string,
    pricePerHour?: number
) {
    const db = await getDB();

    const spot = await db.get('SELECT * FROM spots WHERE id = ?', spotId);
    if (!spot) {
        return { success: false, message: 'Spot not found' };
    }

    const updates: string[] = [];
    const params: any[] = [];

    if (location) {
        updates.push('location = ?');
        params.push(location);
    }

    if (pricePerHour !== undefined && pricePerHour > 0) {
        updates.push('price_per_hour = ?');
        params.push(pricePerHour);
    }

    if (updates.length === 0) {
        return { success: false, message: 'No updates provided' };
    }

    params.push(spotId);

    try {
        await db.run(
            `UPDATE spots SET ${updates.join(', ')} WHERE id = ?`,
            ...params
        );

        return { success: true, message: 'Spot updated successfully' };
    } catch (error) {
        return { success: false, message: 'Failed to update spot' };
    }
}

export async function changeSpotStatus(
    spotId: number,
    status: 'free' | 'reserved' | 'occupied'
) {
    const db = await getDB();

    const spot = await db.get('SELECT * FROM spots WHERE id = ?', spotId);
    if (!spot) {
        return { success: false, message: 'Spot not found' };
    }

    try {
        await db.run(
            'UPDATE spots SET status = ? WHERE id = ?',
            status,
            spotId
        );

        return { success: true, message: 'Status updated successfully' };
    } catch (error) {
        return { success: false, message: 'Failed to update status' };
    }
}

export async function deleteSpot(spotId: number) {
    const db = await getDB();

    const activeReservations = await db.get(
        `SELECT COUNT(*) as count FROM reservations 
         WHERE spot_id = ? AND datetime(end_time) > datetime('now')`,
        spotId
    );

    if (activeReservations.count > 0) {
        return {
            success: false,
            message: 'Cannot delete spot with active reservations'
        };
    }

    try {
        await db.run('DELETE FROM spots WHERE id = ?', spotId);
        return { success: true, message: 'Spot deleted successfully' };
    } catch (error) {
        return { success: false, message: 'Failed to delete spot' };
    }
}

export async function getAllReservations() {
    const db = await getDB();

    const reservations = await db.all(
        `SELECT 
            r.id,
            r.user_id,
            r.spot_id,
            r.start_time,
            r.end_time,
            r.paid,
            u.email as user_email,
            s.location as spot_location,
            CASE 
                WHEN datetime(r.end_time) > datetime('now') THEN 'active'
                ELSE 'completed'
            END as reservation_status
         FROM reservations r
         JOIN users u ON r.user_id = u.id
         JOIN spots s ON r.spot_id = s.id
         ORDER BY r.start_time DESC`
    );

    return { success: true, reservations };
}

// POPRAWIONA FUNKCJA - automatycznie zwalnia miejsca po upływie czasu
export async function cleanupExpiredReservations() {
    const db = await getDB();

    try {
        // Znajdź wszystkie wygasłe rezerwacje z zajętymi miejscami
        const expiredReservations = await db.all(
            `SELECT DISTINCT r.spot_id 
             FROM reservations r
             JOIN spots s ON r.spot_id = s.id
             WHERE datetime(r.end_time) <= datetime('now') 
             AND s.status IN ('reserved', 'occupied')`
        );

        // Zwolnij miejsca
        for (const res of expiredReservations) {
            await db.run(
                "UPDATE spots SET status = 'free' WHERE id = ?",
                res.spot_id
            );
        }

        return {
            success: true,
            message: `Cleaned up ${expiredReservations.length} expired reservations`,
            count: expiredReservations.length
        };
    } catch (error) {
        return { success: false, message: 'Failed to cleanup reservations' };
    }
}

// NOWA FUNKCJA - ręczne zakończenie rezerwacji (w przypadku problemów)
export async function forceEndReservation(reservationId: number) {
    const db = await getDB();

    const reservation = await db.get(
        `SELECT r.*, s.status as spot_status 
         FROM reservations r
         JOIN spots s ON r.spot_id = s.id
         WHERE r.id = ?`,
        reservationId
    );

    if (!reservation) {
        return { success: false, message: 'Reservation not found' };
    }

    // Sprawdź czy rezerwacja już nie wygasła
    const now = new Date();
    const endTime = new Date(reservation.end_time);

    if (endTime <= now) {
        return {
            success: false,
            message: 'Reservation already expired. Refresh the list.'
        };
    }

    try {
        // Ustaw czas zakończenia na teraz
        await db.run(
            "UPDATE reservations SET end_time = datetime('now') WHERE id = ?",
            reservationId
        );

        // Zwolnij miejsce
        await db.run(
            "UPDATE spots SET status = 'free' WHERE id = ?",
            reservation.spot_id
        );

        return {
            success: true,
            message: 'Reservation ended and spot freed'
        };
    } catch (error) {
        return { success: false, message: 'Failed to end reservation' };
    }
}

export async function getStatistics() {
    const db = await getDB();

    const stats = {
        totalSpots: 0,
        freeSpots: 0,
        reservedSpots: 0,
        occupiedSpots: 0,
        totalReservations: 0,
        activeReservations: 0,
        completedReservations: 0,
        totalRevenue: 0,
        totalUsers: 0
    };

    const spotStats = await db.all(
        `SELECT status, COUNT(*) as count FROM spots GROUP BY status`
    );

    spotStats.forEach((s: any) => {
        stats.totalSpots += s.count;
        if (s.status === 'free') stats.freeSpots = s.count;
        if (s.status === 'reserved') stats.reservedSpots = s.count;
        if (s.status === 'occupied') stats.occupiedSpots = s.count;
    });

    const reservationStats = await db.get(
        'SELECT COUNT(*) as count, SUM(paid) as revenue FROM reservations'
    );

    stats.totalReservations = reservationStats.count || 0;
    stats.totalRevenue = reservationStats.revenue || 0;

    // Aktywne vs zakończone rezerwacje
    const activeStats = await db.get(
        `SELECT COUNT(*) as count FROM reservations 
         WHERE datetime(end_time) > datetime('now')`
    );

    stats.activeReservations = activeStats.count || 0;
    stats.completedReservations = stats.totalReservations - stats.activeReservations;

    const userStats = await db.get('SELECT COUNT(*) as count FROM users');
    stats.totalUsers = userStats.count || 0;

    return { success: true, stats };
}