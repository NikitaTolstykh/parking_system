import { getDB } from "./db";

export interface User {
    id: number;
    email: string;
    password: string;
    role: 'user' | 'admin';
    balance: number;
}

export async function register(email: string, password: string, role: 'user' | 'admin' = 'user') {
    const db = await getDB();

    try {

        const existingUser = await db.get<User>(
            'SELECT * FROM users WHERE email = ?',
            email
        );

        if (existingUser) {
            return { success: false, message: 'User already exists' };
        }


        if (password.length < 6) {
            return { success: false, message: 'Password must be at least 6 characters' };
        }

        const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        if (!emailRegex.test(email)) {
            return { success: false, message: 'Invalid email format' };
        }

        await db.run(
            'INSERT INTO users (email, password, role, balance) VALUES (?, ?, ?, ?)',
            email,
            password,
            role,
            0
        );

        return {
            success: true,
            message: 'Registration successful',
            user: { email, role, balance: 0 }
        };
    } catch (error) {
        console.error('Registration error:', error);
        return { success: false, message: 'Registration failed' };
    }
}

export async function login(email: string, password: string) {
    const db = await getDB();

    try {
        const user = await db.get<User>('SELECT * FROM users WHERE email = ?', email);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (user.password !== password) {
            return { success: false, message: 'Wrong password' };
        }

        return {
            success: true,
            user: {
                id: user.id,
                email: user.email,
                role: user.role,
                balance: user.balance
            }
        };
    } catch (error) {
        console.error('Login error:', error);
        return { success: false, message: 'Login failed' };
    }
}

export async function getBalance(email: string) {
    const db = await getDB();

    try {
        const user = await db.get<User>('SELECT balance FROM users WHERE email = ?', email);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        return { success: true, balance: user.balance };
    } catch (error) {
        console.error('Get balance error:', error);
        return { success: false, message: 'Failed to get balance' };
    }
}

export async function addBalance(email: string, amount: number) {
    const db = await getDB();

    try {
        const user = await db.get<User>('SELECT balance FROM users WHERE email = ?', email);

        if (!user) {
            return { success: false, message: 'User not found' };
        }

        if (amount <= 0) {
            return { success: false, message: 'Amount must be positive' };
        }

        const newBalance = user.balance + amount;
        await db.run('UPDATE users SET balance = ? WHERE email = ?', newBalance, email);

        return { success: true, balance: newBalance };
    } catch (error) {
        console.error('Add balance error:', error);
        return { success: false, message: 'Failed to add balance' };
    }
}