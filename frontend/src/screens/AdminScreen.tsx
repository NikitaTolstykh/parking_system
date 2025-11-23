import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    RefreshControl,
    ScrollView,
    Alert,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';
import { getStatistics } from '../api/parkingApi';
import { Statistics } from '../types';

type AdminScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Admin'>;
};

const AdminScreen: React.FC<AdminScreenProps> = ({ navigation }) => {
    const [stats, setStats] = useState<Statistics>({
        totalSpots: 0,
        freeSpots: 0,
        reservedSpots: 0,
        occupiedSpots: 0,
        totalReservations: 0,
        totalRevenue: 0,
        totalUsers: 0,
    });
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadStatistics();
    }, []);

    const loadStatistics = async () => {
        try {
            const response = await getStatistics();
            if (response.success) {
                setStats(response.stats);
            }
        } catch (error) {
            console.error('Error loading statistics:', error);
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadStatistics();
    };

    const handleLogout = async () => {
        await AsyncStorage.clear();
        navigation.replace('Login');
    };

    return (
        <ScrollView
            style={styles.container}
            refreshControl={
                <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
            }>
            <View style={styles.header}>
                <View>
                    <Text style={styles.headerTitle}>Admin Panel</Text>
                    <Text style={styles.headerSubtitle}>Smart Parking Management</Text>
                </View>
                <TouchableOpacity onPress={handleLogout} style={styles.logoutButton}>
                    <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
            </View>

            <View style={styles.statsContainer}>
                <Text style={styles.sectionTitle}>📊 Statistics</Text>

                <View style={styles.statsGrid}>
                    <View style={[styles.statCard, { backgroundColor: '#E3F2FD' }]}>
                        <Text style={styles.statValue}>{stats.totalSpots}</Text>
                        <Text style={styles.statLabel}>Total Spots</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#E8F5E9' }]}>
                        <Text style={styles.statValue}>{stats.freeSpots}</Text>
                        <Text style={styles.statLabel}>Free</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#FFF3E0' }]}>
                        <Text style={styles.statValue}>{stats.reservedSpots}</Text>
                        <Text style={styles.statLabel}>Reserved</Text>
                    </View>

                    <View style={[styles.statCard, { backgroundColor: '#FFEBEE' }]}>
                        <Text style={styles.statValue}>{stats.occupiedSpots}</Text>
                        <Text style={styles.statLabel}>Occupied</Text>
                    </View>
                </View>

                <View style={styles.revenueCard}>
                    <Text style={styles.revenueLabel}>Total Revenue</Text>
                    <Text style={styles.revenueValue}>
                        {stats.totalRevenue.toFixed(2)} PLN
                    </Text>
                </View>

                <View style={styles.infoRow}>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoValue}>{stats.totalReservations}</Text>
                        <Text style={styles.infoLabel}>Total Reservations</Text>
                    </View>
                    <View style={styles.infoCard}>
                        <Text style={styles.infoValue}>{stats.totalUsers}</Text>
                        <Text style={styles.infoLabel}>Total Users</Text>
                    </View>
                </View>
            </View>

            <View style={styles.actionsContainer}>
                <Text style={styles.sectionTitle}>⚙️ Management</Text>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('AdminSpots')}>
                    <Text style={styles.actionIcon}>🅿️</Text>
                    <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>Manage Parking Spots</Text>
                        <Text style={styles.actionSubtitle}>
                            View, add, edit, delete spots
                        </Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionButton}
                    onPress={() => navigation.navigate('AdminReservations')}>
                    <Text style={styles.actionIcon}>📋</Text>
                    <View style={styles.actionTextContainer}>
                        <Text style={styles.actionTitle}>Manage Reservations</Text>
                        <Text style={styles.actionSubtitle}>
                            View and end reservations
                        </Text>
                    </View>
                    <Text style={styles.actionArrow}>›</Text>
                </TouchableOpacity>
            </View>
        </ScrollView>
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
        backgroundColor: '#FF5722',
        paddingTop: 50,
    },
    headerTitle: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#fff',
    },
    headerSubtitle: {
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
    statsContainer: {
        padding: 20,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
        marginBottom: 15,
    },
    statsGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginBottom: 20,
    },
    statCard: {
        flex: 1,
        minWidth: '47%',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    statValue: {
        fontSize: 32,
        fontWeight: 'bold',
        color: '#333',
    },
    statLabel: {
        fontSize: 14,
        color: '#666',
        marginTop: 5,
    },
    revenueCard: {
        backgroundColor: '#4CAF50',
        padding: 20,
        borderRadius: 15,
        alignItems: 'center',
        marginBottom: 20,
    },
    revenueLabel: {
        fontSize: 16,
        color: '#fff',
    },
    revenueValue: {
        fontSize: 36,
        fontWeight: 'bold',
        color: '#fff',
        marginTop: 5,
    },
    infoRow: {
        flexDirection: 'row',
        gap: 10,
    },
    infoCard: {
        flex: 1,
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    infoValue: {
        fontSize: 28,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    infoLabel: {
        fontSize: 12,
        color: '#666',
        marginTop: 5,
        textAlign: 'center',
    },
    actionsContainer: {
        padding: 20,
        paddingTop: 0,
    },
    actionButton: {
        backgroundColor: '#fff',
        flexDirection: 'row',
        alignItems: 'center',
        padding: 15,
        borderRadius: 10,
        marginBottom: 10,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    actionIcon: {
        fontSize: 32,
        marginRight: 15,
    },
    actionTextContainer: {
        flex: 1,
    },
    actionTitle: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 3,
    },
    actionSubtitle: {
        fontSize: 13,
        color: '#666',
    },
    actionArrow: {
        fontSize: 24,
        color: '#ccc',
    },
});

export default AdminScreen;