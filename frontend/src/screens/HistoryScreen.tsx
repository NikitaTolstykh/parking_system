import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    ActivityIndicator,
    RefreshControl,
} from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getUserReservations } from '../api/parkingApi';
import { Reservation } from '../types';

const HistoryScreen: React.FC = () => {
    const [reservations, setReservations] = useState<Reservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            const email = await AsyncStorage.getItem('userEmail');
            if (!email) return;

            const response = await getUserReservations(email);
            if (response.success) {
                setReservations(response.reservations);
            }
        } catch (error) {
            console.error('Error loading reservations:', error);
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadReservations();
    };

    const formatDate = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleString('pl-PL', {
            day: '2-digit',
            month: '2-digit',
            year: 'numeric',
            hour: '2-digit',
            minute: '2-digit',
        });
    };

    const calculateDuration = (start: string, end: string) => {
        const startDate = new Date(start);
        const endDate = new Date(end);
        const hours = Math.round((endDate.getTime() - startDate.getTime()) / 3600000);
        return hours;
    };

    const renderReservation = ({ item }: { item: Reservation }) => {
        const duration = calculateDuration(item.start_time, item.end_time);
        const isPast = new Date(item.end_time) < new Date();

        return (
            <View style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                    <Text style={styles.location}>📍 {item.location || 'Unknown'}</Text>
                    <View
                        style={[
                            styles.statusBadge,
                            isPast ? styles.statusPast : styles.statusActive,
                        ]}>
                        <Text style={styles.statusText}>
                            {isPast ? 'Completed' : 'Active'}
                        </Text>
                    </View>
                </View>

                <View style={styles.reservationDetails}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Start:</Text>
                        <Text style={styles.detailValue}>
                            {formatDate(item.start_time)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>End:</Text>
                        <Text style={styles.detailValue}>{formatDate(item.end_time)}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Duration:</Text>
                        <Text style={styles.detailValue}>{duration} hours</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>Paid:</Text>
                        <Text style={styles.paidAmount}>{item.paid.toFixed(2)} PLN</Text>
                    </View>
                </View>
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#2196F3" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <FlatList
                data={reservations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderReservation}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No reservations yet</Text>
                }
                contentContainerStyle={styles.listContainer}
            />
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    listContainer: {
        padding: 20,
    },
    reservationCard: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 15,
        marginBottom: 15,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    reservationHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 15,
    },
    location: {
        fontSize: 18,
        fontWeight: 'bold',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusActive: {
        backgroundColor: '#E8F5E9',
    },
    statusPast: {
        backgroundColor: '#F5F5F5',
    },
    statusText: {
        fontSize: 12,
        fontWeight: 'bold',
        color: '#666',
    },
    reservationDetails: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
    },
    paidAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
        fontSize: 16,
    },
});

export default HistoryScreen;