import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Modal,
  ActivityIndicator,
  Keyboard,
  KeyboardAvoidingView,
  Platform,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { apiService } from '../services/api';
import { CustomAlert } from '../components/CustomAlert';

export default function SetupBankScreen() {
  const router = useRouter();
  const [loading, setLoading] = useState(false);
  const [loadingAccounts, setLoadingAccounts] = useState(true);
  const [banks, setBanks] = useState<any[]>([]);
  const [savedAccounts, setSavedAccounts] = useState<any[]>([]);
  const [selectedBank, setSelectedBank] = useState<any>(null);
  const [accountNumber, setAccountNumber] = useState('');
  const [accountName, setAccountName] = useState('');
  const [verifying, setVerifying] = useState(false);
  const [showBankModal, setShowBankModal] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const [saving, setSaving] = useState(false);
  
  // Custom Alert State
  const [alertConfig, setAlertConfig] = useState({
    visible: false,
    type: 'info' as 'success' | 'error' | 'warning' | 'info',
    title: '',
    message: '',
    onConfirm: undefined as (() => void) | undefined,
    confirmText: 'OK',
    cancelText: 'Cancel',
  });

  const showAlert = (config: Omit<typeof alertConfig, 'visible'>) => {
    setAlertConfig({ ...config, visible: true });
  };

  const hideAlert = () => {
    setAlertConfig((prev) => ({ ...prev, visible: false }));
  };

  useEffect(() => {
    loadBanks();
    loadSavedAccounts();
  }, []);

  const loadSavedAccounts = async () => {
    try {
      setLoadingAccounts(true);
      const response = await apiService.getBankAccounts();
      console.log('💳 Saved accounts:', response);
      if (response && Array.isArray(response)) {
        setSavedAccounts(response);
      } else if (response.data && Array.isArray(response.data)) {
        setSavedAccounts(response.data);
      }
    } catch (error: any) {
      console.error('Error loading saved accounts:', error);
      // Don't show error if no accounts exist yet
      if (!error.message?.includes('404') && !error.message?.includes('not found')) {
        showAlert({
          type: 'error',
          title: 'Error',
          message: 'Failed to load saved bank accounts',
        });
      }
    } finally {
      setLoadingAccounts(false);
    }
  };

  const loadBanks = async () => {
    try {
      setLoading(true);
      console.log('🏦 Fetching banks list...');
      const response = await apiService.getBanks();
      console.log('🏦 Banks response:', response);
      console.log('🏦 Banks array:', response.banks);
      console.log('🏦 Number of banks:', response.banks?.length || 0);
      
      if (response.banks && response.banks.length > 0) {
        setBanks(response.banks);
        console.log('✅ Banks loaded successfully:', response.banks.length);
      } else {
        console.warn('⚠️ No banks returned from API');
        showAlert({
          type: 'warning',
          title: 'No Banks Available',
          message: 'No banks available at the moment. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('❌ Error loading banks:', error);
      console.error('❌ Error message:', error.message);
      console.error('❌ Error response:', error.response);
      showAlert({
        type: 'error',
        title: 'Error Loading Banks',
        message: error.message || 'Failed to load banks list. Please check your connection.',
      });
    } finally {
      setLoading(false);
    }
  };

  const verifyAccount = async (accountNum?: string, bank?: any) => {
    const accNumber = accountNum || accountNumber;
    const selectedBankToUse = bank || selectedBank;
    
    if (!selectedBankToUse) {
      console.warn('⚠️ No bank selected');
      showAlert({
        type: 'warning',
        title: 'Bank Not Selected',
        message: 'Please select a bank first before verifying your account.',
      });
      return;
    }

    if (accNumber.length !== 10) {
      console.warn('⚠️ Invalid account number length:', accNumber.length);
      return;
    }

    // Prevent duplicate verification
    if (verifying) {
      console.log('⏳ Already verifying...');
      return;
    }

    try {
      setVerifying(true);
      console.log('🔍 Verifying account:', accNumber, 'Bank:', selectedBankToUse.name, selectedBankToUse.code);
      
      const response = await apiService.verifyBankAccount(
        selectedBankToUse.code,
        accNumber
      );
      
      console.log('✅ Verification response:', response);
      console.log('✅ Account name:', response.accountName);
      
      if (response.accountName) {
        setAccountName(response.accountName);
        console.log('✅ Account name set:', response.accountName);
      } else {
        console.warn('⚠️ No account name in response');
        showAlert({
          type: 'warning',
          title: 'Verification Warning',
          message: 'Account verified but no name was returned. Please try again.',
        });
      }
    } catch (error: any) {
      console.error('❌ Verification error:', error);
      showAlert({
        type: 'error',
        title: 'Verification Failed',
        message: error.message || 'Failed to verify account. Please check the account number and try again.',
      });
      setAccountName('');
    } finally {
      setVerifying(false);
    }
  };

  const handleSave = async () => {
    if (!selectedBank || !accountNumber || !accountName) {
      showAlert({
        type: 'warning',
        title: 'Incomplete Information',
        message: 'Please complete all fields before saving.',
      });
      return;
    }

    try {
      setSaving(true);
      await apiService.setupBankAccount(selectedBank.code, accountNumber);
      
      showAlert({
        type: 'success',
        title: 'Success!',
        message: 'Your bank account has been setup successfully. You can now receive withdrawals.',
        onConfirm: () => {
          hideAlert();
          // Reload saved accounts
          loadSavedAccounts();
          // Clear form
          setSelectedBank(null);
          setAccountNumber('');
          setAccountName('');
          // Navigate back to payment screen
          router.push('/landlord/tabs/payment');
        },
        confirmText: 'Done',
      });
    } catch (error: any) {
      showAlert({
        type: 'error',
        title: 'Setup Failed',
        message: error.message || 'Failed to setup bank account. Please try again.',
      });
    } finally {
      setSaving(false);
    }
  };

  const filteredBanks = banks.filter(bank =>
    bank.name.toLowerCase().includes(searchQuery.toLowerCase())
  );

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        keyboardShouldPersistTaps="handled"
      >
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => router.push('/landlord/tabs/payment')}>
            <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Setup Bank Account</Text>
          <View style={{ width: 24 }} />
        </View>

        <View style={styles.content}>
          {/* Saved Bank Accounts */}
          {loadingAccounts ? (
            <View style={styles.loadingAccountsContainer}>
              <ActivityIndicator size="small" color={colors.secondary} />
              <Text style={styles.loadingAccountsText}>Loading accounts...</Text>
            </View>
          ) : savedAccounts.length > 0 ? (
            <View style={styles.savedAccountsSection}>
              <Text style={styles.sectionTitle}>Your Bank Accounts</Text>
              {savedAccounts.map((account, index) => (
                <View key={index} style={styles.savedAccountCard}>
                  <View style={styles.savedAccountIcon}>
                    <MaterialIcons name="account-balance" size={24} color={colors.secondary} />
                  </View>
                  <View style={styles.savedAccountDetails}>
                    <Text style={styles.savedAccountName}>{account.accountName}</Text>
                    <Text style={styles.savedAccountNumber}>
                      {account.bankName} • {account.accountNumber}
                    </Text>
                  </View>
                  <MaterialIcons name="check-circle" size={24} color="#34C759" />
                </View>
              ))}
            </View>
          ) : null}

          {/* Info Card */}
          <View style={styles.infoCard}>
            <MaterialIcons name="info-outline" size={24} color={colors.secondary} />
            <Text style={styles.infoText}>
              {savedAccounts.length > 0 
                ? 'Add another bank account or update your existing one'
                : 'Setup your bank account to receive withdrawals from your wallet'}
            </Text>
          </View>

          {/* Bank Selection */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Select Bank *</Text>
            <TouchableOpacity
              style={styles.selectButton}
              onPress={() => {
                Keyboard.dismiss(); // Dismiss keyboard before opening modal
                setShowBankModal(true);
              }}
            >
              <Text style={[styles.selectButtonText, !selectedBank && styles.placeholder]}>
                {selectedBank ? selectedBank.name : 'Choose your bank'}
              </Text>
              <MaterialIcons name="arrow-drop-down" size={24} color={colors.primary} />
            </TouchableOpacity>
          </View>

          {/* Account Number */}
          <View style={styles.formGroup}>
            <Text style={styles.label}>Account Number *</Text>
            <View style={styles.inputContainer}>
              <TextInput
                style={styles.input}
                placeholder="Enter 10-digit account number"
                keyboardType="numeric"
                maxLength={10}
                value={accountNumber}
                onChangeText={(text) => {
                  console.log('📝 Account number changed:', text, 'Length:', text.length);
                  console.log('🏦 Selected bank:', selectedBank?.name, selectedBank?.code);
                  
                  setAccountNumber(text);
                  setAccountName('');
                  
                  // Auto-verify when 10 digits are entered
                  if (text.length === 10 && selectedBank) {
                    console.log('✅ Conditions met for auto-verify!');
                    console.log('   - Account number length: 10');
                    console.log('   - Bank selected:', selectedBank.name);
                    console.log('🔄 Triggering auto-verification...');
                    // Pass the text directly to avoid state delay
                    setTimeout(() => {
                      console.log('⏰ Timeout fired, calling verifyAccount() with:', text);
                      verifyAccount(text, selectedBank);
                    }, 100);
                  } else {
                    console.log('⏸️ Not auto-verifying yet:');
                    console.log('   - Length:', text.length, '(need 10)');
                    console.log('   - Bank selected:', !!selectedBank);
                  }
                }}
                placeholderTextColor="#999"
              />
              {accountNumber.length === 10 && selectedBank && (
                <TouchableOpacity
                  style={styles.verifyButton}
                  onPress={() => {
                    console.log('🖱️ Manual verify button clicked');
                    verifyAccount();
                  }}
                  disabled={verifying}
                >
                  {verifying ? (
                    <ActivityIndicator size="small" color={colors.secondary} />
                  ) : accountName ? (
                    <MaterialIcons name="check-circle" size={20} color="#34C759" />
                  ) : (
                    <MaterialIcons name="check-circle" size={20} color={colors.secondary} />
                  )}
                </TouchableOpacity>
              )}
            </View>
            {accountNumber.length === 10 && selectedBank && !accountName && !verifying && (
              <Text style={styles.helperText}>
                Tap the icon to verify account
              </Text>
            )}
          </View>

          {/* Account Name */}
          {accountName && (
            <View style={styles.accountNameCard}>
              <MaterialIcons name="account-circle" size={24} color={colors.secondary} />
              <View style={styles.accountNameDetails}>
                <Text style={styles.accountNameLabel}>Account Name</Text>
                <Text style={styles.accountNameText}>{accountName}</Text>
              </View>
              <MaterialIcons name="verified" size={24} color="#34C759" />
            </View>
          )}

          {/* Save Button */}
          <TouchableOpacity
            style={[
              styles.saveButton,
              (!accountName || saving) && styles.saveButtonDisabled,
            ]}
            onPress={handleSave}
            disabled={!accountName || saving}
          >
            <Text style={styles.saveButtonText}>
              {saving ? 'Saving...' : 'Save Bank Account'}
            </Text>
          </TouchableOpacity>

          {/* Security Note */}
          <View style={styles.securityNote}>
            <MaterialIcons name="lock" size={16} color="#666" />
            <Text style={styles.securityText}>
              Your bank details are encrypted and secure
            </Text>
          </View>
        </View>
      </ScrollView>

      {/* Bank Selection Modal */}
      <Modal
        visible={showBankModal}
        transparent
        animationType="slide"
        onRequestClose={() => setShowBankModal(false)}
      >
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.modalOverlay}
        >
          <TouchableOpacity 
            style={styles.modalOverlay}
            activeOpacity={1}
            onPress={() => setShowBankModal(false)}
          >
            <TouchableOpacity 
              activeOpacity={1} 
              onPress={(e) => e.stopPropagation()}
              style={styles.modalContent}
            >
              <View style={styles.modalHeader}>
                <Text style={styles.modalTitle}>Select Bank</Text>
                <TouchableOpacity onPress={() => setShowBankModal(false)}>
                  <MaterialIcons name="close" size={24} color={colors.primary} />
                </TouchableOpacity>
              </View>

              <View style={styles.searchContainer}>
                <MaterialIcons name="search" size={20} color="#999" />
                <TextInput
                  style={styles.searchInput}
                  placeholder="Search banks..."
                  value={searchQuery}
                  onChangeText={setSearchQuery}
                  placeholderTextColor="#999"
                  autoFocus={false}
                />
              </View>

              <ScrollView 
                style={styles.banksList}
                keyboardShouldPersistTaps="handled"
              >
              {loading ? (
                <View style={styles.loadingContainer}>
                  <ActivityIndicator size="large" color={colors.secondary} />
                  <Text style={styles.loadingText}>Loading banks...</Text>
                </View>
              ) : filteredBanks.length > 0 ? (
                filteredBanks.map((bank, index) => (
                  <TouchableOpacity
                    key={`${bank.code}-${bank.id || index}`}
                    style={styles.bankItem}
                    onPress={() => {
                      console.log('🏦 Selected bank:', bank.name, bank.code);
                      setSelectedBank(bank);
                      setShowBankModal(false);
                      setAccountName('');
                    }}
                  >
                    <View style={styles.bankIcon}>
                      <MaterialIcons name="account-balance" size={20} color={colors.secondary} />
                    </View>
                    <Text style={styles.bankName}>{bank.name}</Text>
                    {selectedBank?.code === bank.code && (
                      <MaterialIcons name="check-circle" size={20} color={colors.secondary} />
                    )}
                  </TouchableOpacity>
                ))
              ) : (
                <View style={styles.emptyState}>
                  <MaterialIcons name="account-balance" size={48} color="#D1D5DB" />
                  <Text style={styles.emptyStateText}>
                    {searchQuery ? 'No banks found' : 'No banks available'}
                  </Text>
                  <Text style={styles.emptyStateSubtext}>
                    {searchQuery ? 'Try a different search term' : 'Please try again later'}
                  </Text>
                  {!searchQuery && (
                    <TouchableOpacity 
                      style={styles.retryButton}
                      onPress={loadBanks}
                    >
                      <MaterialIcons name="refresh" size={20} color={colors.secondary} />
                      <Text style={styles.retryButtonText}>Retry</Text>
                    </TouchableOpacity>
                  )}
                </View>
              )}
              </ScrollView>
            </TouchableOpacity>
          </TouchableOpacity>
        </KeyboardAvoidingView>
      </Modal>

      {/* Custom Alert */}
      <CustomAlert
        visible={alertConfig.visible}
        type={alertConfig.type}
        title={alertConfig.title}
        message={alertConfig.message}
        onClose={hideAlert}
        onConfirm={alertConfig.onConfirm}
        confirmText={alertConfig.confirmText}
        cancelText={alertConfig.cancelText}
      />
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
  infoCard: {
    flexDirection: 'row',
    backgroundColor: `${colors.secondary}10`,
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
  },
  infoText: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    lineHeight: 20,
  },
  formGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
    marginBottom: 8,
  },
  selectButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 16,
  },
  selectButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
  },
  placeholder: {
    color: '#999',
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
  },
  input: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    paddingVertical: 16,
  },
  verifyButton: {
    padding: 8,
  },
  helperText: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: colors.secondary,
    marginTop: 4,
  },
  accountNameCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    marginBottom: 24,
    gap: 12,
    borderWidth: 1,
    borderColor: '#34C759',
  },
  accountNameDetails: {
    flex: 1,
  },
  accountNameLabel: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginBottom: 4,
  },
  accountNameText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  loadingAccountsContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    padding: 16,
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    marginBottom: 16,
    gap: 12,
  },
  loadingAccountsText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  savedAccountsSection: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 12,
  },
  savedAccountCard: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    gap: 12,
  },
  savedAccountIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    backgroundColor: `${colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  savedAccountDetails: {
    flex: 1,
  },
  savedAccountName: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 4,
  },
  savedAccountNumber: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  saveButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 16,
  },
  saveButtonDisabled: {
    opacity: 0.5,
  },
  saveButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  securityNote: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    gap: 8,
  },
  securityText: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
    maxHeight: '80%',
  },
  modalHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 20,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  modalTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    paddingHorizontal: 16,
    margin: 20,
    marginBottom: 12,
    gap: 8,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    paddingVertical: 12,
  },
  banksList: {
    maxHeight: 400,
  },
  bankItem: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingVertical: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
    gap: 12,
  },
  bankIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: `${colors.secondary}15`,
    justifyContent: 'center',
    alignItems: 'center',
  },
  bankName: {
    flex: 1,
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
  },
  loadingContainer: {
    alignItems: 'center',
    paddingVertical: 40,
  },
  loadingText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginTop: 12,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 60,
    paddingHorizontal: 40,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#9CA3AF',
    marginTop: 16,
    marginBottom: 4,
  },
  emptyStateSubtext: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#9CA3AF',
    textAlign: 'center',
    marginBottom: 20,
  },
  retryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: `${colors.secondary}15`,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 8,
    gap: 8,
  },
  retryButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
  },
});
