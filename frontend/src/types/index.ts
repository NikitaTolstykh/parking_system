export interface User {
    id: number;
    email: string;
    password?: string;
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

export type RootStackParamList = {
    Login: undefined;
    Home: undefined;
    Search: undefined;
    ReservationDetails: { spot: ParkingSpot };
    History: undefined;
};