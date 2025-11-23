import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    TouchableOpacity,
    Alert,
    ActivityIndicator,
    KeyboardAvoidingView,
    Platform,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RouteProp } from '@react-navigation/native';
import { RootStackParamList } from '../types';
import { updateSpot } from '../api/parkingApi';

type AdminEditSpotScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'AdminEditSpot'>;
    route: RouteProp<RootStackParamList, 'AdminEditSpot'>;
};

const AdminEditSpotScreen: React.FC<AdminEditSpotScreenProps> = ({
                                                                     navigation,
                                                                     route,
                                                                 }) => {
    const { spot } = route.params;
    const [location, setLocation] = useState(spot.location);
    const [pricePerHour, setPricePerHour] = useState(spot.price_per_hour.toString());
    const [loading, setLoading] = useState(false);

    const handleUpdateSpot = async () => {
        if (!location || !pricePerHour) {
            Alert.alert('Error', 'Please fill in all fields');
            return;
        }

        const price = parseFloat(pricePerHour);
        if (isNaN(price) || price <= 0) {
            Alert.alert('Error', 'Please enter a valid price');
            return;
        }

        setLoading(true);
        try {
            const response = await updateSpot(spot.id, location, price);

            if (response.success) {
                Alert.alert('Success', 'Parking spot updated successfully!', [
                    {
                        text: 'OK',
                        onPress: () => navigation.goBack(),
                    },
                ]);
            } else {
                Alert.alert('Error', response.message);
            }
        } catch (error: any) {
            Alert.alert('Error', error.message || 'Failed to update spot');
        } finally {
            setLoading(false);
        }
    };

    return (
        <KeyboardAvoidingView
            behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
            style={styles.container}>
            <View style={styles.content}>
                <Text style={styles.title}>Edit Parking Spot</Text>

                <View style={styles.infoCard}>
                    <Text style={styles.infoLabel}>Spot ID:</Text>
                    <Text style={styles.infoValue}>{spot.id}</Text>
                </View>

                <Text style={styles.label}>Location</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., Center Street 15"
                    value={location}
                    onChangeText={setLocation}
                    editable={!loading}
                />

                <Text style={styles.label}>Price per Hour (PLN)</Text>
                <TextInput
                    style={styles.input}
                    placeholder="e.g., 5.50"
                    value={pricePerHour}
                    onChangeText={setPricePerHour}
                    keyboardType="decimal-pad"
                    editable={!loading}
                />

                <TouchableOpacity
                    style={[styles.button, loading && styles.buttonDisabled]}
                    onPress={handleUpdateSpot}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.buttonText}>Update Spot</Text>
                    )}
                </TouchableOpacity>

                <TouchableOpacity
                    style={styles.cancelButton}
                    onPress={() => navigation.goBack()}>
                    <Text style={styles.cancelButtonText}>Cancel</Text>
                </TouchableOpacity>
            </View>
        </KeyboardAvoidingView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    content: {
        flex: 1,
        padding: 20,
    },
    title: {
        fontSize: 24,
        fontWeight: 'bold',
        marginBottom: 20,
        textAlign: 'center',
    },
    infoCard: {
        backgroundColor: '#fff',
        padding: 15,
        borderRadius: 10,
        marginBottom: 20,
        flexDirection: 'row',
        justifyContent: 'space-between',
    },
    infoLabel: {
        fontSize: 14,
        color: '#666',
    },
    infoValue: {
        fontSize: 14,
        fontWeight: 'bold',
    },
    label: {
        fontSize: 16,
        fontWeight: 'bold',
        marginBottom: 8,
        color: '#333',
    },
    input: {
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        marginBottom: 20,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    button: {
        backgroundColor: '#2196F3',
        borderRadius: 10,
        padding: 15,
        alignItems: 'center',
        marginTop: 10,
    },
    buttonDisabled: {
        backgroundColor: '#ccc',
    },
    buttonText: {
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

export default AdminEditSpotScreen;