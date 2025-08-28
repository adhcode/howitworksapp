import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import DashboardScreen from '../screens/tenant/DashboardScreen';

const Tab = createBottomTabNavigator();

const TenantNavigator = () => (
    <Tab.Navigator>
        <Tab.Screen name="Home" component={DashboardScreen} />
        {/* Add other tenant screens here */}
    </Tab.Navigator>
);

export default TenantNavigator; 