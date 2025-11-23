import axios from 'axios';

const API_BASE_URL = 'http://192.168.3.112:3000';

const api = axios.create({
    baseURL: API_BASE_URL,
    timeout: 10000,
    headers: {
        'Content-Type': 'application/json',
    },
});

export interface User {
    id: number;
    email: string;
    role: 'user' | 'admin';
    balance: number;
}

export interface ParkingSpot {
    id: number;
    location: string;
    price_per_hour: number;
    status: string;
}

export interface Reservation {
    id: number;
    user_id: number;
    spot_id: number;
    location?: string;
    start_time: string;
    end_time: string;
    paid: number;
    price_per_hour?: number;
}

// ============ USER ENDPOINTS ============
export const register = async (email: string, password: string) => {
    const response = await api.post('/register', { email, password });
    return response.data;
};

export const login = async (email: string, password: string) => {
    const response = await api.post('/login', { email, password });
    return response.data;
};

export const getBalance = async (email: string) => {
    const response = await api.get(`/balance/${email}`);
    return response.data;
};

export const addBalance = async (email: string, amount: number) => {
    const response = await api.post('/add-balance', { email, amount });
    return response.data;
};

// ============ PARKING ENDPOINTS ============
export const getFreeSpots = async () => {
    const response = await api.get('/spots/free');
    return response.data;
};

export const searchSpots = async (location: string) => {
    const response = await api.get('/spots/search', {
        params: { location },
    });
    return response.data;
};

export const createReservation = async (
    email: string,
    spotId: number,
    hours: number
) => {
    const response = await api.post('/reserve', {
        email,
        spotId,
        hours,
    });
    return response.data;
};

export const getUserReservations = async (email: string) => {
    const response = await api.get(`/reservations/${email}`);
    return response.data;
};

// ============ ADMIN ENDPOINTS ============
export const getAllSpots = async () => {
    const response = await api.get('/admin/spots');
    return response.data;
};

export const addSpot = async (location: string, pricePerHour: number) => {
    const response = await api.post('/admin/spots', { location, pricePerHour });
    return response.data;
};

export const updateSpot = async (
    spotId: number,
    location?: string,
    pricePerHour?: number
) => {
    const response = await api.put('/admin/spots', { spotId, location, pricePerHour });
    return response.data;
};

export const changeSpotStatus = async (
    spotId: number,
    status: 'free' | 'reserved' | 'occupied'
) => {
    const response = await api.put('/admin/spots/status', { spotId, status });
    return response.data;
};

export const deleteSpot = async (spotId: number) => {
    const response = await api.delete(`/admin/spots/${spotId}`);
    return response.data;
};

export const getAllReservations = async () => {
    const response = await api.get('/admin/reservations');
    return response.data;
};

export const forceEndReservation = async (reservationId: number) => {
    const response = await api.post('/admin/end-reservation', { reservationId });
    return response.data;
};

export const getStatistics = async () => {
    const response = await api.get('/admin/statistics');
    return response.data;
};

export default api;