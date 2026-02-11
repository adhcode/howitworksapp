import React from 'react';
import { Tabs } from 'expo-router';
import { Image, StyleSheet, View, Animated } from 'react-native';
import colors from '../../theme/colors';

const AnimatedTabIcon = ({ icon, focused }: { icon: any, focused: boolean }) => {
  const scaleValue = React.useRef(new Animated.Value(focused ? 1.1 : 1)).current;
  
  React.useEffect(() => {
    Animated.spring(scaleValue, {
      toValue: focused ? 1.1 : 1,
      useNativeDriver: true,
      tension: 300,
      friction: 10,
    }).start();
  }, [focused, scaleValue]);

  return (
    <Animated.View style={[
      styles.iconContainer,
      { 
        backgroundColor: focused ? 'rgba(255,255,255,0.2)' : 'transparent',
        transform: [{ scale: scaleValue }],
      }
    ]}>
      <Image
        source={icon}
        style={[
          styles.icon,
          { tintColor: focused ? '#fff' : 'rgba(255,255,255,0.7)' },
        ]}
        resizeMode="contain"
      />
    </Animated.View>
  );
};

const tabIcons = {
    home: require('../../assets/images/home.png'),
    wallet: require('../../assets/images/payment.png'), // Reuse payment icon for wallet
    reports: require('../../assets/images/property.png'), // Reuse property icon for reports
    settings: require('../../assets/images/profile.png'), // Reuse profile icon for settings
};

export default function TenantTabsLayout() {
    return (
        <Tabs
            screenOptions={({ route }) => ({
                tabBarIcon: ({ focused }) => {
                    let icon;
                    switch (route.name) {
                        case 'home':
                            icon = tabIcons.home;
                            break;
                        case 'wallet':
                            icon = tabIcons.wallet;
                            break;
                        case 'reports':
                            icon = tabIcons.reports;
                            break;
                        case 'settings':
                            icon = tabIcons.settings;
                            break;
                        default:
                            icon = tabIcons.home;
                    }
                    return <AnimatedTabIcon icon={icon} focused={focused} />;
                },
                tabBarActiveTintColor: '#fff',
                tabBarInactiveTintColor: 'rgba(255,255,255,0.7)',
                tabBarShowLabel: true,
                tabBarLabelStyle: { 
                    fontSize: 11, 
                    fontFamily: 'Outfit_500Medium',
                    marginTop: 2,
                },
                tabBarStyle: {
                    height: 85,
                    paddingBottom: 8,
                    paddingTop: 8,
                    borderTopWidth: 0,
                    backgroundColor: colors.secondary,
                    elevation: 8,
                    shadowColor: '#000',
                    shadowOffset: {
                        width: 0,
                        height: -2,
                    },
                    shadowOpacity: 0.1,
                    shadowRadius: 4,
                },
                tabBarItemStyle: {
                    paddingVertical: 4,
                },
                headerShown: false,
            })}
        >
            <Tabs.Screen name="home" options={{ title: 'Home' }} />
            <Tabs.Screen name="wallet" options={{ title: 'Wallet' }} />
            <Tabs.Screen name="reports" options={{ title: 'Reports' }} />
            <Tabs.Screen name="settings" options={{ title: 'Profile' }} />
        </Tabs>
    );
}

const styles = StyleSheet.create({
    iconContainer: {
        borderRadius: 12,
        padding: 6,
        alignItems: 'center',
        justifyContent: 'center',
    },
    icon: {
        width: 20,
        height: 20,
    },
});