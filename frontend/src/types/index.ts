export interface User {
    id: number;
    email: string;
    password?: string;
    role: 'user' | 'admin';
    balance: number;
}

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
    location?: string;
    start_time: string;
    end_time: string;
    paid: number;
    price_per_hour?: number;
}

export interface AdminReservation extends Reservation {
    user_email?: string;
    spot_location?: string;
}

export interface Statistics {
    totalSpots: number;
    freeSpots: number;
    reservedSpots: number;
    occupiedSpots: number;
    totalReservations: number;
    totalRevenue: number;
    totalUsers: number;
}

export type RootStackParamList = {
    Login: undefined;
    Register: undefined;
    Home: undefined;
    Search: undefined;
    ReservationDetails: { spot: ParkingSpot };
    History: undefined;
    Admin: undefined;
    AdminSpots: undefined;
    AdminReservations: undefined;
    AdminAddSpot: undefined;
    AdminEditSpot: { spot: ParkingSpot };
};