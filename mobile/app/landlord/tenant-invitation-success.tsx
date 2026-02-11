import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  SafeAreaView,
  Share,
  Clipboard,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';
import { CustomAlert } from '../components/CustomAlert';

const TenantInvitationSuccessScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  
  const tenantName = `${params.firstName} ${params.lastName}`;
  const phoneNumber = params.phoneNumber as string;
  const invitationToken = params.token as string;

  const [alertVisible, setAlertVisible] = useState(false);
  const [alertConfig, setAlertConfig] = useState({
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
  });

  const showAlert = (type: 'success' | 'error' | 'warning' | 'info', title: string, message: string) => {
    setAlertConfig({ type, title, message });
    setAlertVisible(true);
  };

  const copyToClipboard = async (text: string, label: string) => {
    try {
      await Clipboard.setString(text);
      showAlert('success', 'Copied!', `${label} copied to clipboard`);
    } catch (error) {
      showAlert('error', 'Copy Failed', 'Failed to copy to clipboard');
    }
  };

  const shareInvitation = async () => {
    try {
      const message = `Hi ${tenantName}!\n\nYou've been invited to join as a tenant. Please use this token to complete your registration in the Property HomeCare app:\n\nInvitation Token: ${invitationToken}\n\nDownload the Property HomeCare app and use this token during signup.\n\nThis invitation will expire in 30 days.`;
      
      await Share.share({
        message,
        title: 'Tenant Invitation - Property HomeCare',
      });
    } catch (error) {
      showAlert('error', 'Share Failed', 'Failed to share invitation');
    }
  };

  const sendSMSInvitation = () => {
    // This would typically integrate with an SMS service
    showAlert('info', 'SMS Feature', 'SMS integration will be implemented in the next version. For now, please share the invitation token manually.');
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title="Invitation Sent" 
        showBack={true} 
        onBack={() => router.back()}
      />
      
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Success Icon */}
          <View style={styles.successIconContainer}>
            <MaterialIcons name="check-circle" size={80} color={colors.secondary} />
          </View>

          {/* Success Message */}
          <Text style={styles.successTitle}>Invitation Created Successfully!</Text>
          <Text style={styles.successMessage}>
            An invitation has been created for {tenantName}. Share the invitation details below to get them started.
          </Text>

          {/* Tenant Information */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Tenant Information</Text>
            <View style={styles.infoCard}>
              <View style={styles.infoRow}>
                <MaterialIcons name="person" size={20} color="#666" />
                <Text style={styles.infoLabel}>Name:</Text>
                <Text style={styles.infoValue}>{tenantName}</Text>
              </View>
              <View style={styles.infoRow}>
                <MaterialIcons name="phone" size={20} color="#666" />
                <Text style={styles.infoLabel}>Phone:</Text>
                <Text style={styles.infoValue}>{phoneNumber}</Text>
              </View>
            </View>
          </View>

          {/* Invitation Token */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Invitation Token</Text>
            <View style={styles.tokenCard}>
              <Text style={styles.tokenLabel}>Token:</Text>
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenText} numberOfLines={1}>
                  {invitationToken}
                </Text>
                <TouchableOpacity 
                  style={styles.copyButton}
                  onPress={() => copyToClipboard(invitationToken, 'Token')}
                >
                  <MaterialIcons name="content-copy" size={20} color={colors.secondary} />
                </TouchableOpacity>
              </View>
            </View>
          </View>

          {/* Instructions */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>How to Share</Text>
            <View style={styles.instructionsCard}>
              <Text style={styles.instructionText}>
                Share the invitation token above with {tenantName}. They will need to:
              </Text>
              <Text style={styles.instructionText}>
                1. Download the Property HomeCare app{'\n'}
                2. Select "Sign up with Invitation Token"{'\n'}
                3. Enter the token: <Text style={styles.tokenHighlight}>{invitationToken}</Text>{'\n'}
                4. Complete their registration
              </Text>
            </View>
          </View>



          {/* Action Buttons */}
          <View style={styles.actionButtons}>
            <TouchableOpacity style={styles.shareButton} onPress={shareInvitation}>
              <MaterialIcons name="share" size={20} color="#fff" />
              <Text style={styles.shareButtonText}>Share Invitation</Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.emailButton} onPress={sendSMSInvitation}>
              <MaterialIcons name="sms" size={20} color={colors.secondary} />
              <Text style={styles.emailButtonText}>Send SMS</Text>
            </TouchableOpacity>
          </View>

          {/* Expiration Notice */}
          <View style={styles.expirationNotice}>
            <MaterialIcons name="schedule" size={20} color="#FF9800" />
            <Text style={styles.expirationText}>
              This invitation will expire in 30 days
            </Text>
          </View>

          {/* Done Button */}
          <TouchableOpacity 
            style={styles.doneButton} 
            onPress={() => router.back()}
          >
            <Text style={styles.doneButtonText}>Done</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>

      <CustomAlert
        visible={alertVisible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={() => setAlertVisible(false)}
      />
    </SafeAreaView>
  );
};

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
  content: {
    padding: 20,
  },
  successIconContainer: {
    alignItems: 'center',
    marginBottom: 24,
  },
  successTitle: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    textAlign: 'center',
    marginBottom: 12,
  },
  successMessage: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    textAlign: 'center',
    lineHeight: 24,
    marginBottom: 32,
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 12,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
    marginLeft: 8,
    marginRight: 8,
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    flex: 1,
  },
  tokenCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  tokenLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
    marginBottom: 8,
  },
  tokenContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  tokenText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
  },
  linkCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  linkLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
    marginBottom: 8,
  },
  linkContainer: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    backgroundColor: '#F8F8F8',
    borderRadius: 8,
    padding: 12,
  },
  linkText: {
    flex: 1,
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    lineHeight: 16,
  },
  copyButton: {
    marginLeft: 8,
    padding: 4,
  },
  instructionsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  instructionItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 16,
  },
  instructionText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    lineHeight: 20,
    marginBottom: 8,
  },
  tokenHighlight: {
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
    backgroundColor: `${colors.secondary}15`,
    paddingHorizontal: 4,
    paddingVertical: 2,
    borderRadius: 4,
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 12,
    marginBottom: 24,
  },
  shareButton: {
    flex: 1,
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  shareButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
  },
  emailButton: {
    flex: 1,
    backgroundColor: `${colors.secondary}15`,
    borderRadius: 12,
    paddingVertical: 14,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
    borderWidth: 1,
    borderColor: colors.secondary,
  },
  emailButtonText: {
    color: colors.secondary,
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
  },
  expirationNotice: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FFF3E0',
    borderRadius: 8,
    padding: 12,
    marginBottom: 24,
    gap: 8,
  },
  expirationText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#FF9800',
  },
  doneButton: {
    backgroundColor: colors.primary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
  },
  doneButtonText: {
    color: '#fff',
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
  },
});

export default TenantInvitationSuccessScreen;