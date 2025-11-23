import React, { useState, useEffect } from 'react';
import { AlertButton } from 'react-native';
import {
    View,
    Text,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    Alert,
    RefreshControl,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ParkingSpot } from '../types';
import { getAllSpots, changeSpotStatus, deleteSpot } from '../api/parkingApi';

type AdminSpotsScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'AdminSpots'>;
};

const AdminSpotsScreen: React.FC<AdminSpotsScreenProps> = ({ navigation }) => {
    const [spots, setSpots] = useState<ParkingSpot[]>([]);
    const [refreshing, setRefreshing] = useState(false);

    useEffect(() => {
        loadSpots();
    }, []);

    const loadSpots = async () => {
        try {
            const response = await getAllSpots();
            if (response.success) {
                setSpots(response.spots);
            }
        } catch (error) {
            Alert.alert('Error', 'Failed to load spots');
        } finally {
            setRefreshing(false);
        }
    };

    const onRefresh = () => {
        setRefreshing(true);
        loadSpots();
    };

    const handleChangeStatus = (spot: ParkingSpot) => {
        const statuses: Array<'free' | 'reserved' | 'occupied'> = [
            'free',
            'reserved',
            'occupied',
        ];

        const buttons: AlertButton[] = [
            ...statuses.map((status): AlertButton => ({
                text: status.toUpperCase(),
                onPress: async () => {
                    try {
                        const response = await changeSpotStatus(spot.id, status);
                        if (response.success) {
                            Alert.alert('Success', 'Status updated');
                            loadSpots();
                        }
                    } catch (error) {
                        Alert.alert('Error', 'Failed to update status');
                    }
                },
            })),
            {
                text: 'Cancel',
                style: 'cancel',
            },
        ];

        Alert.alert('Change Status', `Current: ${spot.status}`, buttons);
    };

    const handleDelete = (spot: ParkingSpot) => {
        Alert.alert(
            'Delete Spot',
            `Are you sure you want to delete "${spot.location}"?`,
            [
                { text: 'Cancel', style: 'cancel' },
                {
                    text: 'Delete',
                    style: 'destructive',
                    onPress: async () => {
                        try {
                            const response = await deleteSpot(spot.id);
                            if (response.success) {
                                Alert.alert('Success', 'Spot deleted');
                                loadSpots();
                            } else {
                                Alert.alert('Error', response.message);
                            }
                        } catch (error) {
                            Alert.alert('Error', 'Failed to delete spot');
                        }
                    },
                },
            ]
        );
    };

    const getStatusColor = (status: string) => {
        switch (status) {
            case 'free':
                return '#4CAF50';
            case 'reserved':
                return '#FF9800';
            case 'occupied':
                return '#F44336';
            default:
                return '#999';
        }
    };

    const renderSpot = ({ item }: { item: ParkingSpot }) => (
        <View style={styles.spotCard}>
            <View style={styles.spotHeader}>
                <Text style={styles.spotLocation}>📍 {item.location}</Text>
                <View
                    style={[
                        styles.statusBadge,
                        { backgroundColor: getStatusColor(item.status) },
                    ]}>
                    <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
                </View>
            </View>

            <Text style={styles.spotPrice}>{item.price_per_hour} PLN/hour</Text>

            <View style={styles.actionsRow}>
                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => navigation.navigate('AdminEditSpot', { spot: item })}>
                    <Text style={styles.actionBtnText}>✏️ Edit</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.actionBtn}
                    onPress={() => handleChangeStatus(item)}>
                    <Text style={styles.actionBtnText}>🔄 Status</Text>
                </TouchableOpacity>

                <TouchableOpacity
                    style={[styles.actionBtn, styles.deleteBtnText]}
                    onPress={() => handleDelete(item)}>
                    <Text style={[styles.actionBtnText, { color: '#F44336' }]}>
                        🗑️ Delete
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.addButton}
                onPress={() => navigation.navigate('AdminAddSpot')}>
                <Text style={styles.addButtonText}>+ Add New Spot</Text>
            </TouchableOpacity>

            <FlatList
                data={spots}
                keyExtractor={(item) => item.id.toString()}
                renderItem={renderSpot}
                refreshControl={
                    <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
                }
                ListEmptyComponent={
                    <Text style={styles.emptyText}>No spots available</Text>
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
    addButton: {
        backgroundColor: '#4CAF50',
        margin: 20,
        padding: 15,
        borderRadius: 10,
        alignItems: 'center',
    },
    addButtonText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: 'bold',
    },
    spotCard: {
        backgroundColor: '#fff',
        marginHorizontal: 20,
        marginBottom: 15,
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
        marginBottom: 10,
    },
    spotLocation: {
        fontSize: 16,
        fontWeight: 'bold',
        flex: 1,
    },
    statusBadge: {
        paddingHorizontal: 12,
        paddingVertical: 6,
        borderRadius: 15,
    },
    statusText: {
        fontSize: 11,
        fontWeight: 'bold',
        color: '#fff',
    },
    spotPrice: {
        fontSize: 14,
        color: '#666',
        marginBottom: 10,
    },
    actionsRow: {
        flexDirection: 'row',
        gap: 8,
    },
    actionBtn: {
        flex: 1,
        backgroundColor: '#f0f0f0',
        padding: 10,
        borderRadius: 8,
        alignItems: 'center',
    },
    deleteBtnText: {
        backgroundColor: '#FFEBEE',
    },
    actionBtnText: {
        fontSize: 13,
        fontWeight: 'bold',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
        fontSize: 16,
    },
});

export default AdminSpotsScreen;