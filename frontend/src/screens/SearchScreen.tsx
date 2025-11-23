import React, { useState } from 'react';
import {
    View,
    Text,
    TextInput,
    StyleSheet,
    FlatList,
    TouchableOpacity,
    ActivityIndicator,
} from 'react-native';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';
import { RootStackParamList, ParkingSpot } from '../types';
import { searchSpots } from '../api/parkingApi';

type SearchScreenProps = {
    navigation: NativeStackNavigationProp<RootStackParamList, 'Search'>;
};

const SearchScreen: React.FC<SearchScreenProps> = ({ navigation }) => {
    const [searchQuery, setSearchQuery] = useState('');
    const [spots, setSpots] = useState<ParkingSpot[]>([]);
    const [loading, setLoading] = useState(false);
    const [searched, setSearched] = useState(false);

    const handleSearch = async () => {
        if (!searchQuery.trim()) return;

        setLoading(true);
        setSearched(true);
        try {
            const response = await searchSpots(searchQuery);
            if (response.success) {
                setSpots(response.spots);
            }
        } catch (error) {
            console.error('Search error:', error);
        } finally {
            setLoading(false);
        }
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
            <View style={styles.searchContainer}>
                <TextInput
                    style={styles.searchInput}
                    placeholder="Search by location (e.g., Center, Main)"
                    value={searchQuery}
                    onChangeText={setSearchQuery}
                    onSubmitEditing={handleSearch}
                />
                <TouchableOpacity
                    style={styles.searchButton}
                    onPress={handleSearch}
                    disabled={loading}>
                    {loading ? (
                        <ActivityIndicator color="#fff" />
                    ) : (
                        <Text style={styles.searchButtonText}>Search</Text>
                    )}
                </TouchableOpacity>
            </View>

            {loading ? (
                <View style={styles.centerContainer}>
                    <ActivityIndicator size="large" color="#2196F3" />
                </View>
            ) : (
                <FlatList
                    data={spots}
                    keyExtractor={(item) => item.id.toString()}
                    renderItem={renderSpot}
                    ListEmptyComponent={
                        searched ? (
                            <Text style={styles.emptyText}>
                                No spots found for "{searchQuery}"
                            </Text>
                        ) : (
                            <Text style={styles.emptyText}>
                                Enter a location to search for parking spots
                            </Text>
                        )
                    }
                />
            )}
        </View>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: '#f5f5f5',
    },
    searchContainer: {
        flexDirection: 'row',
        padding: 20,
        gap: 10,
    },
    searchInput: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 10,
        padding: 15,
        fontSize: 16,
        borderWidth: 1,
        borderColor: '#ddd',
    },
    searchButton: {
        backgroundColor: '#2196F3',
        borderRadius: 10,
        paddingHorizontal: 20,
        justifyContent: 'center',
        alignItems: 'center',
    },
    searchButtonText: {
        color: '#fff',
        fontWeight: 'bold',
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
    centerContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyText: {
        textAlign: 'center',
        color: '#999',
        marginTop: 50,
        fontSize: 16,
        paddingHorizontal: 40,
    },
});

export default SearchScreen;