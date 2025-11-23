import React, { useState, useEffect, useCallback } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    RefreshControl,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getFreeSpots, getBalance, addBalance } from '../api/parkingApi';
import { ParkingSpot } from '../types';

type HomeScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Home'>;
};

const HomeScreen: React.FC<HomeScreenProps> = ({ navigation }) => {
    const [spots, setSpots] = useState<ParkingSpot[]>([]);
    const [balance, setBalance] = useState(0);
    const [email, setEmail] = useState('');
    const [loading, setLoading] = useState(false);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadUserData();
        loadSpots();
    }, []);

    const loadUserData = async () => {
        try {
            const userEmail = await AsyncStorage.getItem('userEmail');
            if (userEmail) {
                setEmail(userEmail);
                const balanceData = await getBalance(userEmail);
                if (balanceData.success) {
                    setBalance(balanceData.balance);
                }
            }
        } catch (error) {
            console.error('Error loading user data:', error);
        }
    };

    const loadSpots = async () => {
        setLoading(true);
        try {
            const response = await getFreeSpots();
            if (response.success) {
                setSpots(response.spots);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load parking spots');
        } finally {
            setLoading(false);
        }
    };

    const onRefresh = useCallback(async () => {
        setRefreshing(true);
        await Promise.all([loadUserData(), loadSpots()]);
        setRefreshing(false);
    }, []);

    const handleAddBalance = async () => {
        Alert.prompt(
            'Add Balance',
            'Enter amount to add:',
            async (text) => {
                const amount = parseFloat(text);
                if (isNaN(amount) || amount <= 0) {
                    Alert.alert('Error', 'Invalid amount');
                    return;
                }
                try {
                    const response = await addBalance(email, amount);
                    if (response.success) {
                        setBalance(response.balance);
                        Alert.alert('Success', `Added ${amount} PLN to your balance`);
                    }
                } catch (error) {
                    Alert.alert('Error', 'Failed to add balance');
                }
            },
            'plain-text',
            '',
            'numeric'
        );
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.replace('Login');
    };

    const renderSpot = ({ item }: { item: ParkingSpot }) => (
        <TouchableOpacity
            style={styles.spotCard}
            onPress={() => navigation.navigate('ReservationDetails', { spot: item })}>
            <View style={styles.spotHeader}>
                <Text style={styles.spotLocation}>📍 {item.location}</Text>
                <Text style={styles.spotStatus}>✅ Available</Text>
            </View>
            <Text style={styles.spotPrice}>{item.price_per_hour} PLN/hour</Text>
        </TouchableOpacity>
    );

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Smart Parking</Text>
                    <Text style={styles.headerEmail}>{email}</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.balanceCard}>
                <View>
                    <Text style={styles.balanceLabel}>Your Balance</Text>
                    <Text style={styles.balanceAmount}>{balance.toFixed(2)} PLN</Text>
                </View>
                <TouchableOpacity style={styles.addButton} onPress={handleAddBalance}>
                    <Text style={styles.addButtonText}>+ Add</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('Search')}>
                    <Text style={styles.actionButtonText}>🔍 Search</Text>
                </TouchableOpacity>
                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('History')}>
                    <Text style={styles.actionButtonText}>📜 History</Text>
                </TouchableOpacity>
            </View>

            <Text style={styles.sectionTitle}>Available Parking Spots</Text>

            <FlatList
                data={spots}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderSpot}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>
                        {loading ? 'Loading...' : 'No available spots'}
                    </Text>
                }
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    header: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        padding: 20,
        backgroundColor: '#2196F3',
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerEmail: {
        fontSize: 14,
        color: '#fff',
        opacity: 0.9,
    },
    logoutButton: {
        padding: 8,
    },
    logoutText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    balanceCard: {
        backgroundColor: '#fff',
        margin: 20,
        padding: 20,
        borderRadius: 15,
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    balanceLabel: {
        fontSize: 14,
        color: '#666',
    },
    balanceAmount: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    addButton: {
        backgroundColor: '#4CAF50',
        paddingHorizontal: 20,
        paddingVertical: 10,
        borderRadius: 10,
    },
    addButtonText: {
        color: '#fff',
        fontWeight: 'bold',
    },
    actionsRow: {
        flexDirection: 'row',
        paddingHorizontal: 20,
        gap: 10,
        marginBottom: 20,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    actionButtonText: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    sectionTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        marginHorizontal: 20,
        marginBottom: 10,
    },
    spotCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 10,
        padding: 15,
        borderRadius: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    spotHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 5,
    },
    spotLocation: {
        fontSize: 16,
        fontWeight: 'bold',
    },
    spotStatus: {
        fontSize: 12,
        color: '#4CAF50',
    },
    spotPrice: {
        fontSize: 14,
        color: '#666',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
        fontSize: 16,
    },
});

export default HomeScreen;