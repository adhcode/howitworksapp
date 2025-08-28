import React, { useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TextInput, 
  TouchableOpacity, 
  ScrollView, 
  Alert,
  KeyboardAvoidingView,
  Platform 
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';

const SendNoticeScreen = () => {
  const router = useRouter();
  const [formData, setFormData] = useState({
    recipient: 'all', // 'all' or 'specific'
    specificTenant: '',
    subject: '',
    message: '',
    priority: 'normal', // 'low', 'normal', 'high', 'urgent'
  });
  const [loading, setLoading] = useState(false);

  const recipients = [
    { value: 'all', label: 'All Tenants', description: 'Send to all active tenants' },
    { value: 'specific', label: 'Specific Tenant', description: 'Send to a particular tenant' },
  ];

  const priorities = [
    { value: 'low', label: 'Low', color: '#40B869' },
    { value: 'normal', label: 'Normal', color: colors.secondary },
    { value: 'high', label: 'High', color: '#FF9800' },
    { value: 'urgent', label: 'Urgent', color: '#F44336' },
  ];

  const handleInputChange = (field: string, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
  };

  const validateForm = () => {
    if (!formData.subject.trim()) {
      Alert.alert('Error', 'Subject is required');
      return false;
    }
    if (!formData.message.trim()) {
      Alert.alert('Error', 'Message is required');
      return false;
    }
    if (formData.recipient === 'specific' && !formData.specificTenant.trim()) {
      Alert.alert('Error', 'Please specify the tenant');
      return false;
    }
    return true;
  };

  const handleSendNotice = async () => {
    if (!validateForm()) return;

    setLoading(true);
    try {
      // TODO: Implement API call to send notice
      await new Promise(resolve => setTimeout(resolve, 1500)); // Mock delay
      
      Alert.alert(
        'Success!',
        'Notice sent successfully',
        [
          {
            text: 'OK',
            onPress: () => router.back(),
          }
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to send notice');
    } finally {
      setLoading(false);
    }
  };

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Send Notice" showBack={true} />
      
      <KeyboardAvoidingView
        style={{ flex: 1 }}
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
      >
        <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
          {/* Recipient Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Send To</Text>
            {recipients.map((recipient) => (
              <TouchableOpacity
                key={recipient.value}
                style={[
                  styles.optionCard,
                  formData.recipient === recipient.value && styles.selectedOption
                ]}
                onPress={() => handleInputChange('recipient', recipient.value)}
              >
                <View style={styles.optionContent}>
                  <View style={styles.radioContainer}>
                    <View style={[
                      styles.radio,
                      formData.recipient === recipient.value && styles.radioSelected
                    ]}>
                      {formData.recipient === recipient.value && (
                        <View style={styles.radioInner} />
                      )}
                    </View>
                  </View>
                  <View style={styles.optionText}>
                    <Text style={styles.optionLabel}>{recipient.label}</Text>
                    <Text style={styles.optionDescription}>{recipient.description}</Text>
                  </View>
                </View>
              </TouchableOpacity>
            ))}
          </View>

          {/* Specific Tenant Input */}
          {formData.recipient === 'specific' && (
            <View style={styles.section}>
              <Text style={styles.label}>Tenant Name/Email</Text>
              <TextInput
                style={styles.input}
                value={formData.specificTenant}
                onChangeText={(value) => handleInputChange('specificTenant', value)}
                placeholder="Enter tenant name or email"
                placeholderTextColor="#999"
              />
            </View>
          )}

          {/* Priority Selection */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Priority</Text>
            <View style={styles.priorityContainer}>
              {priorities.map((priority) => (
                <TouchableOpacity
                  key={priority.value}
                  style={[
                    styles.priorityChip,
                    formData.priority === priority.value && {
                      backgroundColor: priority.color,
                    }
                  ]}
                  onPress={() => handleInputChange('priority', priority.value)}
                >
                  <Text style={[
                    styles.priorityText,
                    formData.priority === priority.value && styles.priorityTextSelected
                  ]}>
                    {priority.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* Subject */}
          <View style={styles.section}>
            <Text style={styles.label}>Subject</Text>
            <TextInput
              style={styles.input}
              value={formData.subject}
              onChangeText={(value) => handleInputChange('subject', value)}
              placeholder="Enter notice subject"
              placeholderTextColor="#999"
            />
          </View>

          {/* Message */}
          <View style={styles.section}>
            <Text style={styles.label}>Message</Text>
            <TextInput
              style={[styles.input, styles.messageInput]}
              value={formData.message}
              onChangeText={(value) => handleInputChange('message', value)}
              placeholder="Enter your message..."
              placeholderTextColor="#999"
              multiline
              numberOfLines={6}
              textAlignVertical="top"
            />
          </View>
        </ScrollView>

        {/* Send Button */}
        <View style={styles.buttonContainer}>
          <TouchableOpacity
            style={[styles.sendButton, loading && styles.sendButtonDisabled]}
            onPress={handleSendNotice}
            disabled={loading}
          >
            <MaterialIcons 
              name="send" 
              size={20} 
              color="#fff" 
              style={styles.buttonIcon} 
            />
            <Text style={styles.sendButtonText}>
              {loading ? 'Sending...' : 'Send Notice'}
            </Text>
          </TouchableOpacity>
        </View>
      </KeyboardAvoidingView>
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
    paddingHorizontal: 20,
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
  label: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#E1E1E1',
    borderRadius: 8,
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    backgroundColor: '#fff',
  },
  messageInput: {
    height: 120,
    paddingTop: 12,
  },
  optionCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 8,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  selectedOption: {
    borderColor: colors.secondary,
    backgroundColor: `${colors.secondary}05`,
  },
  optionContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  radioContainer: {
    marginRight: 12,
  },
  radio: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: '#E1E1E1',
    justifyContent: 'center',
    alignItems: 'center',
  },
  radioSelected: {
    borderColor: colors.secondary,
  },
  radioInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.secondary,
  },
  optionText: {
    flex: 1,
  },
  optionLabel: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 2,
  },
  optionDescription: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  priorityContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  priorityChip: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  priorityText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
  },
  priorityTextSelected: {
    color: '#fff',
  },
  buttonContainer: {
    paddingHorizontal: 20,
    paddingBottom: 20,
    paddingTop: 10,
  },
  sendButton: {
    backgroundColor: colors.secondary,
    borderRadius: 8,
    paddingVertical: 16,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
  },
  sendButtonDisabled: {
    opacity: 0.6,
  },
  buttonIcon: {
    marginRight: 8,
  },
  sendButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
});

export default SendNoticeScreen;