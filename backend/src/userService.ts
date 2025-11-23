import { getDB} from "./db";

export interface User {
    id: number;
    email: string;
    password: string;
    balance: number;
}

export async function login(email: string, password: string) {
    const db = await getDB();
    const user = await db.get<User>('SELECT * FROM users WHERE email = ?', email);

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    if (user.password !== password) {
        return { success: false, message: 'Wrong password' };
    }

    return { success: true, user };
}

export async function getBalance(email: string) {
    const db = await getDB();
    const user = await db.get<User>('SELECT balance FROM users WHERE email = ?', email);

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    return { success: true, balance: user.balance };
}

export async function addBalance(email: string, amount: number) {
    const db = await getDB();
    const user = await db.get<User>('SELECT balance FROM users WHERE email = ?', email);

    if (!user) {
        return { success: false, message: 'User not found' };
    }

    const newBalance = user.balance + amount;
    await db.run('UPDATE users SET balance = ? WHERE email = ?', newBalance, email);

    return { success: true, balance: newBalance };
}