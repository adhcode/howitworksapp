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

export default function HelpSupportScreen() {
  const router = useRouter();

  const contactMethods = [
    {
      icon: 'email',
      title: 'Email Support',
      subtitle: 'support@howitworks.com.ng',
      action: () => Linking.openURL('mailto:support@howitworks.com.ng'),
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
      question: 'How do I add a new property?',
      answer: 'Go to the Property tab and tap "Add New Property". Fill in the property details and submit.',
    },
    {
      question: 'How do I withdraw my earnings?',
      answer: 'Go to the Payment tab, tap "Withdraw Funds", enter the amount, and confirm. Funds will be transferred to your registered bank account.',
    },
    {
      question: 'How long does withdrawal take?',
      answer: 'Withdrawals are typically processed within 24 hours on business days.',
    },
    {
      question: 'How do I add a tenant?',
      answer: 'Go to the Tenants tab, select a property, and tap "Add Tenant". Fill in the tenant details and generate a token for them.',
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
          <TouchableOpacity onPress={() => router.push('/landlord/tabs/profile')}>
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
