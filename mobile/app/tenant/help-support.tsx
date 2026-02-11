import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Linking,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';

export default function TenantHelpSupportScreen() {
  const router = useRouter();

  const contactMethods = [
    {
      icon: 'email',
      title: 'Email Support',
      subtitle: 'support@propertyhomecare.com.ng',
      action: () => Linking.openURL('mailto:support@propertyhomecare.com.ng'),
    },
    {
      icon: 'phone',
      title: 'Phone Support',
      subtitle: '+234 800 123 4567',
      action: () => Linking.openURL('tel:+2348001234567'),
    },
    {
      icon: 'chat',
      title: 'WhatsApp',
      subtitle: 'Chat with us on WhatsApp',
      action: () => Linking.openURL('https://wa.me/2348001234567'),
    },
  ];

  const faqItems = [
    {
      question: 'How do I make a rent payment?',
      answer: 'Go to the Wallet tab and tap "Make Payment". You\'ll be redirected to a secure payment page to complete your transaction.',
    },
    {
      question: 'How do I report a maintenance issue?',
      answer: 'Go to the Reports tab and tap "Report Issue". Fill in the details and submit. Your landlord will be notified immediately.',
    },
    {
      question: 'When is my rent due?',
      answer: 'Your rent due date is displayed on your home screen and wallet tab. You\'ll also receive notifications before the due date.',
    },
    {
      question: 'How do I view my payment history?',
      answer: 'Go to the Wallet tab and scroll down to see your complete payment history with status badges.',
    },
  ];

  return (
    <SafeAreaView style={styles.container} edges={['top']}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.back()}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Help & Support</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Contact Methods */}
          <Text style={styles.sectionTitle}>Contact Us</Text>
          <View style={styles.contactSection}>
            {contactMethods.map((method, index) => (
              <TouchableOpacity
                key={index}
                style={styles.contactCard}
                onPress={method.action}
                activeOpacity={0.7}
              >
                <View style={styles.contactIcon}>
                  <MaterialIcons name={method.icon as any} size={24} color={colors.secondary} />
                </View>
                <View style={styles.contactDetails}>
                  <Text style={styles.contactTitle}>{method.title}</Text>
                  <Text style={styles.contactSubtitle}>{method.subtitle}</Text>
                </View>
                <MaterialIcons name="chevron-right" size={24} color="#D1D5DB" />
              </TouchableOpacity>
            ))}
          </View>

          {/* FAQ Section */}
          <Text style={styles.sectionTitle}>Frequently Asked Questions</Text>
          <View style={styles.faqSection}>
            {faqItems.map((item, index) => (
              <View key={index} style={styles.faqItem}>
                <Text style={styles.faqQuestion}>{item.question}</Text>
                <Text style={styles.faqAnswer}>{item.answer}</Text>
              </View>
            ))}
          </View>

          {/* Support Hours */}
          <View style={styles.supportHours}>
            <MaterialIcons name="access-time" size={20} color={colors.secondary} />
            <View style={styles.supportHoursText}>
              <Text style={styles.supportHoursTitle}>Support Hours</Text>
              <Text style={styles.supportHoursSubtitle}>
                Monday - Friday: 8:00 AM - 6:00 PM{'\n'}
                Saturday: 9:00 AM - 2:00 PM{'\n'}
                Sunday: Closed
              </Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: colors.background,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 40,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    paddingVertical: 16,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  content: {
    padding: 20,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 16,
    marginTop: 8,
  },
  contactSection: {
    marginBottom: 24,
  },
  contactCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  contactIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 16,
  },
  contactDetails: {
    flex: 1,
  },
  contactTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 4,
  },
  contactSubtitle: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  faqSection: {
    marginBottom: 24,
  },
  faqItem: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  faqQuestion: {
    fontSize: 15,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 8,
  },
  faqAnswer: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    lineHeight: 20,
  },
  supportHours: {
    flexDirection: 'row',
    backgroundColor: `${colors.secondary}10`,
    borderRadius: 12,
    padding: 16,
    gap: 12,
  },
  supportHoursText: {
    flex: 1,
  },
  supportHoursTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 8,
  },
  supportHoursSubtitle: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    lineHeight: 20,
  },
});
