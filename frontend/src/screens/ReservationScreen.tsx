import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { RootStackParamList } from '../types';
import { createReservation, getBalance } from '../api/parkingApi';

type ReservationScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'ReservationDetails'>;
    route: RouteProp<RootStackParamList, 'ReservationDetails'>;
};

const ReservationScreen: React.FC<ReservationScreenProps> = ({
                                                                 navigation,
                                                                 route,
                                                             }) => {
    const { spot } = route.params;
    const [selectedHours, setSelectedHours] = useState(2);
    const [loading, setLoading] = useState(false);

    const totalCost = spot.price_per_hour * selectedHours;

    const handleReserve = async () => {
        setLoading(true);
        try {
            const email = await AsyncStorage.getItem('userEmail');
            if (!email) {
                Alert.alert('Error', 'User not logged in');
                return;
            }

            const balanceResponse = await getBalance(email);
            if (balanceResponse.success && balanceResponse.balance < totalCost) {
                Alert.alert(
                    'Insufficient Balance',
                    `You need ${totalCost} PLN but have ${balanceResponse.balance} PLN. Please add more balance.`
                );
                return;
            }

            const response = await createReservation(email, spot.id, selectedHours);

            if (response.success) {
                Alert.alert(
                    'Success!',
                    `Parking spot reserved successfully!\nLocation: ${spot.location}\nDuration: ${selectedHours} hours\nTotal: ${totalCost} PLN`,
                    [
                        {
                            text: 'OK',
                            onPress: () => navigation.navigate('Home'),
                        },
                    ]
                );
            } else {
                Alert.alert('Error', response.message);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to create reservation');
        } finally {
            setLoading(false);
        }
    };

    const hourOptions = [1, 2, 3, 4, 6, 8, 12, 24];

    return (
        <View style={styles.container}>
            <View style={styles.card}>
                <Text style={styles.title}>Reserve Parking Spot</Text>

                <View style={styles.infoSection}>
                    <Text style={styles.label}>Location</Text>
                    <Text style={styles.value}>📍 {spot.location}</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.label}>Price per hour</Text>
                    <Text style={styles.value}>{spot.price_per_hour} PLN</Text>
                </View>

                <View style={styles.infoSection}>
                    <Text style={styles.label}>Select Duration</Text>
                    <View style={styles.hoursGrid}>
                        {hourOptions.map((hours) => (
                            <TouchableOpacity
                                key={hours}
                                style={[
                                    styles.hourButton,
                                    selectedHours === hours && styles.hourButtonSelected,
                                ]}
                                onPress={() => setSelectedHours(hours)}>
                                <Text
                                    style={[
                                        styles.hourButtonText,
                                        selectedHours === hours && styles.hourButtonTextSelected,
                                    ]}>
                                    {hours}h
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </View>
                </View>

                <View style={styles.totalSection}>
                    <Text style={styles.totalLabel}>Total Cost</Text>
                    <Text style={styles.totalAmount}>{totalCost.toFixed(2)} PLN</Text>
                </View>

                <TouchableOpacity
                    style={[styles.reserveButton, loading && styles.reserveButtonDisabled]}
                    onPress={handleReserve}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.reserveButtonText}>Confirm Reservation</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
        padding: 20,
    },
    card: {
        backgroundColor: '#fff',
        borderRadius: 15,
        padding: 20,
        elevation: 3,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoSection: {
        marginBottom: 20,
    },
    label: {
        fontSize: 14,
        color: '#666',
        marginBottom: 5,
    },
    value: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    hoursGrid: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 10,
        marginTop: 10,
    },
    hourButton: {
        backgroundColor: '#f0f0f0',
        paddingVertical: 10,
        paddingHorizontal: 20,
        borderRadius: 10,
        borderWidth: 2,
        borderColor: 'transparent',
    },
    hourButtonSelected: {
        backgroundColor: '#E3F2FD',
        borderColor: '#2196F3',
    },
    hourButtonText: {
        fontSize: 16,
        color: '#666',
    },
    hourButtonTextSelected: {
        color: '#2196F3',
        fontWeight: 'bold',
    },
    totalSection: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        paddingVertical: 15,
        borderTopWidth: 1,
        borderTopColor: '#eee',
        marginTop: 10,
    },
    totalLabel: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    totalAmount: {
        fontSize: 24,
        fontWeight: 'bold',
        color: '#2196F3',
    },
    reserveButton: {
        backgroundColor: '#4CAF50',
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
        marginTop: 20,
    },
    reserveButtonDisabled: {
        backgroundColor: '#ccc',
    },
    reserveButtonText: {
        color: '#fff',
        fontSize: 18,
        fontWeight: 'bold',
    },
    cancelButton: {
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    cancelButtonText: {
        color: '#666',
        fontSize: 16,
    },
});

export default ReservationScreen;