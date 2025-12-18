import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import colors from '../theme/colors';

const WelcomeScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const [logoError, setLogoError] = React.useState(false);
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const slideAnim = useRef(new Animated.Value(30)).current;

  // Check if this is a tenant invitation welcome
  const tenantName = params.tenantName as string;

  useEffect(() => {
    // Entrance animation
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 800,
        useNativeDriver: true,
      }),
    ]).start();
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <Animated.View
        style={[
          styles.content,
          {
            opacity: fadeAnim,
            transform: [{ translateY: slideAnim }],
          },
        ]}
      >
        {/* Logo/Brand Area */}
        <View style={styles.logoContainer}>
          {!logoError ? (
            <Image
              source={require('../assets/images/HIWLogo.png')}
              style={styles.logo}
              resizeMode="contain"
              onError={() => setLogoError(true)}
            />
          ) : (
            <View style={[styles.logo, styles.logoFallback]}>
              <Text style={styles.logoFallbackText}>HIW</Text>
            </View>
          )}
          <Text style={styles.brandName}>HIW Maintenance</Text>
          {tenantName ? (
            <Text style={styles.personalizedTagline}>Welcome back, {tenantName}!</Text>
          ) : (
            <Text style={styles.tagline}>Smart Property Care</Text>
          )}
          {!tenantName && (
            <Text style={styles.description}>
            </Text>
          )}
        </View>

        {/* Action Buttons */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={styles.createAccountButton}
            onPress={() => router.push('/auth/role-selection')}
          >
            <Text style={styles.createAccountButtonText}>
              {tenantName ? 'Complete Your Registration' : 'Create new account'}
            </Text>
          </TouchableOpacity>

          <Text style={styles.orText}>or</Text>

          <TouchableOpacity
            style={styles.loginButton}
            onPress={() => router.push('/auth/login')}
          >
            <Text style={styles.loginButtonText}>Login</Text>
          </TouchableOpacity>


        </View>
      </Animated.View>
    </SafeAreaView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  content: {
    flex: 1,
    paddingHorizontal: 24,
    justifyContent: 'space-between',
    paddingTop: 60,
    paddingBottom: 40,
  },
  logoContainer: {
    alignItems: 'center',
    flex: 1,
    justifyContent: 'center',
  },
  logo: {
    width: 60,
    height: 60,
    marginBottom: 24,
  },
  logoFallback: {
    backgroundColor: colors.secondary,
    borderRadius: 60,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    fontSize: 32,
    fontFamily: 'Outfit_700Bold',
    color: '#fff',
  },
  brandName: {
    fontSize: 32,
    fontFamily: 'Outfit_700Bold',
    color: colors.secondary,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
    textAlign: 'center',
    marginBottom: 16,
  },
  description: {
    fontSize: 15,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    textAlign: 'center',
    lineHeight: 22,
    paddingHorizontal: 20,
  },
  personalizedTagline: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
    textAlign: 'center',
    marginTop: 8,
  },
  buttonContainer: {
    alignItems: 'center',
    gap: 16,
  },
  createAccountButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 18,
    paddingHorizontal: 32,
    width: '100%',
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 6,
  },
  createAccountButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  orText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
  },
  loginButton: {
    paddingVertical: 16,
    paddingHorizontal: 32,
    alignItems: 'center',
    borderWidth: 2,
    borderColor: colors.primary,
    borderRadius: 12,
    width: '100%',
  },
  loginButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },

});

export default WelcomeScreen;