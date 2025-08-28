import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import EnhancedDashboardScreen from '../screens/landlord/EnhancedDashboardScreen';

const Tab = createBottomTabNavigator();

const LandlordNavigator = () => (
    <Tab.Navigator>
        <Tab.Screen name="Home" component={EnhancedDashboardScreen} />
        {/* Add other landlord screens here */}
    </Tab.Navigator>
);

export default LandlordNavigator; 