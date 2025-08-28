import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import colors from '../theme/colors';
import Header from '../components/Header';
import { useRouter } from 'expo-router';

const TenantListScreen = () => {
  const router = useRouter();

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Tenant List" 
        showBack={true} 
        onBack={() => router.back()}
      />
      <View style={styles.content}>
        <Text style={styles.text}>Tenant List - Coming Soon</Text>
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
    padding: 20,
  },
  text: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
  },
});

export default TenantListScreen;