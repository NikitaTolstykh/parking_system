import React, { useState, useEffect } from 'react';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
    ActivityIndicator,
} from 'react-native';
import { getAllReservations, forceEndReservation } from '../api/parkingApi';
import { AdminReservation } from '../types';

const AdminReservationsScreen: React.FC = () => {
    const [reservations, setReservations] = useState<AdminReservation[]>([]);
    const [loading, setLoading] = useState(true);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadReservations();
    }, []);

    const loadReservations = async () => {
        try {
            const response = await getAllReservations();
            if (response.success) {
                setReservations(response.reservations);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load reservations');
        } finally {
            setLoading(false);
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadReservations();
    };

    const handleEndReservation = (reservation: AdminReservation) => {
        Alert.alert(
            'End Reservation',
            `End reservation for ${reservation.user_email} at ${reservation.spot_location}?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'End',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await forceEndReservation(reservation.id);
                            if (response.success) {
                                Alert.alert('Success', 'Reservation ended');
                                loadReservations();
                            } else {
                                Alert.alert('Error', response.message);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to end reservation');
                        }
                    },
                },
            ]
        );
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

    const isActive = (endTime: string) => {
        return new Date(endTime) > new Date();
    };

    const renderReservation = ({ item }: { item: AdminReservation }) => {
        const duration = calculateDuration(item.start_time, item.end_time);
        const active = isActive(item.end_time);

        return (
            <View style={styles.reservationCard}>
                <View style={styles.reservationHeader}>
                    <View style={styles.headerLeft}>
                        <Text style={styles.reservationId}>ID: {item.id}</Text>
                        <View
                            style={[
                                styles.statusBadge,
                                active ? styles.statusActive : styles.statusCompleted,
                            ]}>
                            <Text style={styles.statusText}>
                                {active ? 'ACTIVE' : 'COMPLETED'}
                            </Text>
                        </View>
                    </View>
                </View>

                <View style={styles.detailsContainer}>
                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>👤 User:</Text>
                        <Text style={styles.detailValue}>{item.user_email}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>📍 Location:</Text>
                        <Text style={styles.detailValue}>{item.spot_location}</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>⏰ Start:</Text>
                        <Text style={styles.detailValue}>
                            {formatDate(item.start_time)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>⏱️ End:</Text>
                        <Text style={styles.detailValue}>
                            {formatDate(item.end_time)}
                        </Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>⏳ Duration:</Text>
                        <Text style={styles.detailValue}>{duration} hours</Text>
                    </View>

                    <View style={styles.detailRow}>
                        <Text style={styles.detailLabel}>💰 Paid:</Text>
                        <Text style={styles.paidAmount}>{item.paid.toFixed(2)} PLN</Text>
                    </View>
                </View>

                {active && (
                    <TouchableOpacity
                        style={styles.endButton}
                        onPress={() => handleEndReservation(item)}>
                        <Text style={styles.endButtonText}>🛑 End Reservation</Text>
                    </TouchableOpacity>
                )}
            </View>
        );
    };

    if (loading) {
        return (
            <View style={styles.centerContainer}>
                <ActivityIndicator size="large" color="#FF5722" />
            </View>
        );
    }

    return (
        <View style={styles.container}>
            <View style={styles.header}>
                <Text style={styles.headerTitle}>All Reservations</Text>
                <Text style={styles.headerSubtitle}>
                    Total: {reservations.length}
                </Text>
            </View>

            <FlatList
                data={reservations}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderReservation}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No reservations</Text>
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
    header: {
        backgroundColor: '#fff',
        padding: 15,
        borderBottomWidth: 1,
        borderBottomColor: '#eee',
    },
    headerTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    headerSubtitle: {
        fontSize: 14,
        color: '#666',
        marginTop: 3,
    },
    listContainer: {
        padding: 15,
    },
    reservationCard: {
        backgroundColor: '#fff',
        borderRadius: 12,
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
        marginBottom: 12,
        paddingBottom: 12,
        borderBottomWidth: 1,
        borderBottomColor: '#f0f0f0',
    },
    headerLeft: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 10,
    },
    reservationId: {
        fontSize: 14,
        fontWeight: 'bold',
        color: '#666',
    },
    statusBadge: {
        paddingHorizontal: 10,
        paddingVertical: 4,
        borderRadius: 12,
    },
    statusActive: {
        backgroundColor: '#4CAF50',
    },
    statusCompleted: {
        backgroundColor: '#999',
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#fff',
    },
    detailsContainer: {
        gap: 8,
    },
    detailRow: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
    },
    detailLabel: {
        fontSize: 14,
        color: '#666',
        flex: 1,
    },
    detailValue: {
        fontSize: 14,
        fontWeight: '500',
        flex: 2,
        textAlign: 'right',
    },
    paidAmount: {
        fontSize: 16,
        fontWeight: 'bold',
        color: '#4CAF50',
        flex: 2,
        textAlign: 'right',
    },
    endButton: {
        backgroundColor: '#FFEBEE',
        marginTop: 12,
        padding: 12,
        borderRadius: 8,
        alignItems: 'center',
    },
    endButtonText: {
        color: '#F44336',
        fontSize: 14,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
        fontSize: 16,
    },
});

export default AdminReservationsScreen;