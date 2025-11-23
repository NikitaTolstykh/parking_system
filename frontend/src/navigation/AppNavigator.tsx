import React from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { RootStackParamList } from '../types';

// User screens
import LoginScreen from '../screens/LoginScreen';
import RegisterScreen from '../screens/RegisterScreen';
import HomeScreen from '../screens/HomeScreen';
import SearchScreen from '../screens/SearchScreen';
import ReservationScreen from '../screens/ReservationScreen';
import HistoryScreen from '../screens/HistoryScreen';

// Admin screens
import AdminScreen from '../screens/AdminScreen';
import AdminSpotsScreen from '../screens/AdminSpotsScreen';
import AdminReservationsScreen from '../screens/AdminReservationsScreen';
import AdminAddSpotScreen from '../screens/AdminAddSpotScreen';
import AdminEditSpotScreen from '../screens/AdminEditSpotScreen';

const Stack = createNativeStackNavigator<RootStackParamList>();

const AppNavigator: React.FC = () => {
    return (
        <NavigationContainer>
            <Stack.Navigator
                initialRouteName="Login"
                screenOptions={{
                    headerStyle: {
                        backgroundColor: '#2196F3',
                    },
                    headerTintColor: '#fff',
                    headerTitleStyle: {
                        fontWeight: 'bold',
                    },
                }}>
                {/* Auth Screens */}
                <Stack.Screen
                    name="Login"
                    component={LoginScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Register"
                    component={RegisterScreen}
                    options={{ headerShown: false }}
                />

                {/* User Screens */}
                <Stack.Screen
                    name="Home"
                    component={HomeScreen}
                    options={{ headerShown: false }}
                />
                <Stack.Screen
                    name="Search"
                    component={SearchScreen}
                    options={{ title: 'Search Parking' }}
                />
                <Stack.Screen
                    name="ReservationDetails"
                    component={ReservationScreen}
                    options={{ title: 'Reserve Spot' }}
                />
                <Stack.Screen
                    name="History"
                    component={HistoryScreen}
                    options={{ title: 'Reservation History' }}
                />

                {/* Admin Screens */}
                <Stack.Screen
                    name="Admin"
                    component={AdminScreen}
                    options={{
                        headerShown: false,
                        gestureEnabled: false,
                    }}
                />
                <Stack.Screen
                    name="AdminSpots"
                    component={AdminSpotsScreen}
                    options={{
                        title: 'Manage Parking Spots',
                        headerStyle: {
                            backgroundColor: '#FF5722',
                        },
                    }}
                />
                <Stack.Screen
                    name="AdminReservations"
                    component={AdminReservationsScreen}
                    options={{
                        title: 'Manage Reservations',
                        headerStyle: {
                            backgroundColor: '#FF5722',
                        },
                    }}
                />
                <Stack.Screen
                    name="AdminAddSpot"
                    component={AdminAddSpotScreen}
                    options={{
                        title: 'Add New Spot',
                        headerStyle: {
                            backgroundColor: '#FF5722',
                        },
                    }}
                />
                <Stack.Screen
                    name="AdminEditSpot"
                    component={AdminEditSpotScreen}
                    options={{
                        title: 'Edit Spot',
                        headerStyle: {
                            backgroundColor: '#FF5722',
                        },
                    }}
                />
            </Stack.Navigator>
        </NavigationContainer>
    );
};

export default AppNavigator;