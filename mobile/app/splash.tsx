import React, { useEffect, useRef } from 'react';
import { View, Text, StyleSheet, Image, Animated } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import colors from './theme/colors';

const SplashScreen = () => {
  const router = useRouter();
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.8)).current;
  const [logoError, setLogoError] = React.useState(false);

  useEffect(() => {
    // Start entrance animations
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 800,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        tension: 50,
        friction: 7,
        useNativeDriver: true,
      }),
    ]).start();

    // Pulse animation for loading bar
    Animated.loop(
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 0.3,
          duration: 800,
          useNativeDriver: true,
        }),
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 800,
          useNativeDriver: true,
        }),
      ])
    ).start();

    // Navigate to welcome screen after animation with fade out
    const timer = setTimeout(() => {
      Animated.timing(fadeAnim, {
        toValue: 0,
        duration: 400,
        useNativeDriver: true,
      }).start(() => {
        router.replace('/auth/welcome');
      });
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <SafeAreaView style={styles.container}>
      <View style={styles.content}>
        <Animated.View
          style={[
            styles.logoContainer,
            {
              opacity: fadeAnim,
              transform: [{ scale: scaleAnim }],
            },
          ]}
        >
          {!logoError ? (
            <Image
              source={require('../assets/splash.png')}
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
          <Text style={styles.tagline}>Smart Property Care</Text>
          <View style={styles.loadingContainer}>
            <View style={styles.loadingBar}>
              <Animated.View 
                style={[
                  styles.loadingProgress,
                  {
                    opacity: fadeAnim,
                  }
                ]} 
              />
            </View>
          </View>
        </Animated.View>
      </View>
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
    justifyContent: 'center',
    alignItems: 'center',
    paddingHorizontal: 20,
  },
  logoContainer: {
    alignItems: 'center',
  },
  logo: {
    width: 80,
    height: 80,
    marginBottom: 24,
  },
  logoFallback: {
    backgroundColor: colors.secondary,
    borderRadius: 40,
    alignItems: 'center',
    justifyContent: 'center',
  },
  logoFallbackText: {
    fontSize: 36,
    fontFamily: 'Outfit_700Bold',
    color: '#fff',
  },
  brandName: {
    fontSize: 36,
    fontFamily: 'Outfit_700Bold',
    color: colors.secondary,
    marginBottom: 12,
  },
  tagline: {
    fontSize: 18,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
    textAlign: 'center',
    marginBottom: 40,
  },
  loadingContainer: {
    width: '100%',
    alignItems: 'center',
    marginTop: 20,
  },
  loadingBar: {
    width: 200,
    height: 4,
    backgroundColor: '#E1E1E1',
    borderRadius: 2,
    overflow: 'hidden',
  },
  loadingProgress: {
    width: '100%',
    height: '100%',
    backgroundColor: colors.secondary,
  },
});

export default SplashScreen;