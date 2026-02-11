import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  TouchableOpacity,
  Modal,
  Share,
  Alert,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import * as Clipboard from 'expo-clipboard';
import colors from '../theme/colors';
import Header from '../components/Header';
import { apiService } from '../services/api';
import { TenantListSkeleton } from '../components/skeletons';

const TenantListScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const propertyId = params.propertyId as string;
  const propertyName = params.propertyName as string;

  const [tenants, setTenants] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [tokenModalVisible, setTokenModalVisible] = useState(false);
  const [selectedInvitation, setSelectedInvitation] = useState<any>(null);

  useEffect(() => {
    loadTenants();
  }, [propertyId]);

  const loadTenants = async () => {
    try {
      // Load invitations which includes ALL tenants (pending, accepted, etc.)
      const invitationsResponse = await apiService.getMyInvitations();
      
      const allInvitations = Array.isArray(invitationsResponse) 
        ? invitationsResponse 
        : (invitationsResponse.data || []);
      
      // Filter invitations for this property - exclude cancelled invitations
      const propertyInvitations = allInvitations.filter((inv: any) => 
        inv.propertyId === propertyId && inv.status !== 'cancelled'
      );
      
      setTenants(propertyInvitations);
    } catch (error) {
      console.error('Error loading tenants:', error);
      setTenants([]);
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadTenants();
    setRefreshing(false);
  };

  const formatCurrency = (amount: string | number) => {
    return new Intl.NumberFormat('en-NG', {
      style: 'currency',
      currency: 'NGN',
      minimumFractionDigits: 0,
    }).format(typeof amount === 'string' ? parseFloat(amount) : amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const handleViewToken = (tenant: any) => {
    setSelectedInvitation(tenant);
    setTokenModalVisible(true);
  };

  const handleCopyToken = async () => {
    if (selectedInvitation?.invitationToken) {
      await Clipboard.setStringAsync(selectedInvitation.invitationToken);
      Alert.alert('Success', 'Token copied to clipboard!');
    }
  };

  const handleShareToken = async () => {
    if (selectedInvitation?.invitationToken) {
      try {
        const message = `Your Property HomeCare invitation token is: ${selectedInvitation.invitationToken}\n\nUse this token to complete your registration.`;
        await Share.share({
          message,
        });
      } catch (error) {
        console.error('Error sharing token:', error);
      }
    }
  };

  const handleCancelInvitation = async (invitation: any) => {
    Alert.alert(
      'Cancel Invitation',
      `Are you sure you want to cancel the invitation for ${invitation.firstName} ${invitation.lastName}? This will free up the unit for a new tenant.`,
      [
        { text: 'No', style: 'cancel' },
        {
          text: 'Yes, Cancel',
          style: 'destructive',
          onPress: async () => {
            try {
              await apiService.cancelInvitation(invitation.id);
              Alert.alert('Success', 'Invitation cancelled successfully');
              loadTenants(); // Reload the list
            } catch (error: any) {
              console.error('Error cancelling invitation:', error);
              Alert.alert('Error', error.message || 'Failed to cancel invitation');
            }
          },
        },
      ]
    );
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header 
          title={propertyName || 'Tenants'} 
          showBack={true} 
          onBack={() => router.push('/landlord/tabs/tenants')}
        />
        <ScrollView style={styles.scrollView} contentContainerStyle={styles.scrollContent}>
          <TenantListSkeleton count={3} />
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header 
        title={propertyName || 'Tenants'} 
        showBack={true} 
        onBack={() => router.push('/landlord/tabs/tenants')}
      />
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            tintColor={colors.secondary}
            colors={[colors.secondary]}
          />
        }
      >
        <View style={styles.content}>
          {/* Summary */}
          <View style={styles.summaryCard}>
            <Text style={styles.summaryTitle}>Total Invitations</Text>
            <Text style={styles.summaryValue}>{tenants.length}</Text>
            <Text style={styles.summarySubtext}>
              {tenants.filter(t => t.status === 'accepted').length} active, {' '}
              {tenants.filter(t => t.status === 'pending').length} pending
            </Text>
          </View>

          {/* Tenant List */}
          {tenants.length === 0 ? (
            <View style={styles.emptyState}>
              <MaterialIcons name="people-outline" size={64} color="#E0E0E0" />
              <Text style={styles.emptyStateTitle}>No Invitations Yet</Text>
              <Text style={styles.emptyStateText}>
                Invite tenants to this property to see them here
              </Text>
              <TouchableOpacity
                style={styles.addButton}
                onPress={() => router.push(`/landlord/add-tenant?propertyId=${propertyId}`)}
              >
                <MaterialIcons name="person-add" size={20} color="#fff" />
                <Text style={styles.addButtonText}>Invite Tenant</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View style={styles.tenantsList}>
              {tenants.map((tenant) => (
                <View key={tenant.id} style={styles.tenantCard}>
                  <View style={styles.tenantHeader}>
                    <View style={styles.tenantAvatar}>
                      <Text style={styles.tenantInitials}>
                        {tenant.firstName?.[0]}{tenant.lastName?.[0]}
                      </Text>
                    </View>
                    <View style={styles.tenantInfo}>
                      <Text style={styles.tenantName}>
                        {tenant.firstName} {tenant.lastName}
                      </Text>
                      <Text style={styles.tenantPhone}>{tenant.phone}</Text>
                    </View>
                    <View style={[
                      styles.statusBadge,
                      tenant.status === 'accepted' && styles.statusActive,
                      tenant.status === 'pending' && styles.statusPending,
                      tenant.status === 'expired' && styles.statusExpired
                    ]}>
                      <Text style={[
                        styles.statusText,
                        tenant.status === 'accepted' && styles.statusTextActive,
                        tenant.status === 'pending' && styles.statusTextPending,
                        tenant.status === 'expired' && styles.statusTextExpired
                      ]}>
                        {tenant.status === 'accepted' ? 'Active' : 
                         tenant.status === 'pending' ? 'Pending' : 
                         tenant.status === 'expired' ? 'Expired' : 
                         tenant.status}
                      </Text>
                    </View>
                  </View>

                  <View style={styles.tenantDetails}>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="home" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Unit:</Text>
                      <Text style={styles.detailValue}>{tenant.unit?.unitNumber || 'N/A'}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="attach-money" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Rent:</Text>
                      <Text style={styles.detailValue}>{formatCurrency(tenant.monthlyRent)}</Text>
                    </View>
                    <View style={styles.detailRow}>
                      <MaterialIcons name="calendar-today" size={16} color="#666" />
                      <Text style={styles.detailLabel}>Lease:</Text>
                      <Text style={styles.detailValue}>
                        {formatDate(tenant.leaseStartDate)} - {formatDate(tenant.leaseEndDate)}
                      </Text>
                    </View>
                    
                    {/* View Token Button for pending invitations */}
                    {tenant.status === 'pending' && tenant.invitationToken && (
                      <View style={styles.actionButtons}>
                        <TouchableOpacity
                          style={styles.viewTokenButton}
                          onPress={() => handleViewToken(tenant)}
                        >
                          <MaterialIcons name="vpn-key" size={18} color={colors.secondary} />
                          <Text style={styles.viewTokenButtonText}>View Token</Text>
                        </TouchableOpacity>
                        
                        <TouchableOpacity
                          style={styles.cancelButton}
                          onPress={() => handleCancelInvitation(tenant)}
                        >
                          <MaterialIcons name="cancel" size={18} color="#FF6B6B" />
                          <Text style={styles.cancelButtonText}>Cancel</Text>
                        </TouchableOpacity>
                      </View>
                    )}
                  </View>
                </View>
              ))}
            </View>
          )}
        </View>
      </ScrollView>

      {/* Token Modal */}
      <Modal
        visible={tokenModalVisible}
        transparent={true}
        animationType="fade"
        onRequestClose={() => setTokenModalVisible(false)}
      >
        <View style={styles.modalOverlay}>
          <View style={styles.modalContent}>
            <View style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Invitation Token</Text>
              <TouchableOpacity
                onPress={() => setTokenModalVisible(false)}
                style={styles.closeButton}
              >
                <MaterialIcons name="close" size={24} color="#666" />
              </TouchableOpacity>
            </View>

            <View style={styles.modalBody}>
              <Text style={styles.modalLabel}>Tenant Name:</Text>
              <Text style={styles.modalValue}>
                {selectedInvitation?.firstName} {selectedInvitation?.lastName}
              </Text>

              <Text style={[styles.modalLabel, { marginTop: 16 }]}>Invitation Token:</Text>
              <View style={styles.tokenContainer}>
                <Text style={styles.tokenText}>{selectedInvitation?.invitationToken}</Text>
              </View>

              <Text style={styles.modalHint}>
                Share this token with the tenant so they can complete their registration.
              </Text>

              <View style={styles.modalActions}>
                <TouchableOpacity
                  style={styles.modalButton}
                  onPress={handleCopyToken}
                >
                  <MaterialIcons name="content-copy" size={20} color="#fff" />
                  <Text style={styles.modalButtonText}>Copy Token</Text>
                </TouchableOpacity>

                <TouchableOpacity
                  style={[styles.modalButton, styles.modalButtonSecondary]}
                  onPress={handleShareToken}
                >
                  <MaterialIcons name="share" size={20} color={colors.secondary} />
                  <Text style={[styles.modalButtonText, styles.modalButtonTextSecondary]}>
                    Share Token
                  </Text>
                </TouchableOpacity>
              </View>
            </View>
          </View>
        </View>
      </Modal>
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
    paddingBottom: 20,
  },
  content: {
    flex: 1,
    padding: 16,
  },
  summaryCard: {
    backgroundColor: colors.secondary,
    borderRadius: 16,
    padding: 24,
    alignItems: 'center',
    marginBottom: 24,
  },
  summaryTitle: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#fff',
    opacity: 0.9,
    marginBottom: 8,
  },
  summaryValue: {
    fontSize: 48,
    fontFamily: 'Outfit_700Bold',
    color: '#fff',
    marginBottom: 4,
  },
  summarySubtext: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#fff',
    opacity: 0.9,
  },
  tenantsList: {
    gap: 12,
  },
  tenantCard: {
    backgroundColor: '#fff',
    borderRadius: 16,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 8,
    elevation: 2,
  },
  tenantHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 16,
    paddingBottom: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  tenantAvatar: {
    width: 50,
    height: 50,
    borderRadius: 25,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 12,
  },
  tenantInitials: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  tenantInfo: {
    flex: 1,
  },
  tenantName: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 2,
  },
  tenantEmail: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginBottom: 2,
  },
  tenantPhone: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 12,
    backgroundColor: '#F0F0F0',
  },
  statusActive: {
    backgroundColor: '#40B86915',
  },
  statusPending: {
    backgroundColor: '#FF980015',
  },
  statusExpired: {
    backgroundColor: '#FF6B6B15',
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
    color: '#666',
  },
  statusTextActive: {
    color: '#40B869',
  },
  statusTextPending: {
    color: '#FF9800',
  },
  statusTextExpired: {
    color: '#FF6B6B',
  },
  tenantDetails: {
    gap: 12,
  },
  detailRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
  },
  detailValue: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    flex: 1,
  },
  emptyState: {
    alignItems: 'center',
    paddingVertical: 48,
  },
  emptyStateTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginTop: 16,
    marginBottom: 8,
  },
  emptyStateText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    textAlign: 'center',
    marginBottom: 24,
  },
  addButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 12,
    paddingHorizontal: 24,
    borderRadius: 8,
    gap: 8,
  },
  addButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  actionButtons: {
    flexDirection: 'row',
    gap: 8,
    marginTop: 12,
  },
  viewTokenButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: `${colors.secondary}10`,
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  viewTokenButtonText: {
    fontSize: 13,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.secondary,
  },
  cancelButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#FF6B6B10',
    paddingVertical: 10,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 6,
  },
  cancelButtonText: {
    fontSize: 13,
    fontFamily: 'Outfit_600SemiBold',
    color: '#FF6B6B',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 16,
    width: '100%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
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
  closeButton: {
    padding: 4,
  },
  modalBody: {
    padding: 20,
  },
  modalLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
    marginBottom: 8,
  },
  modalValue: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  tokenContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 12,
    padding: 16,
    borderWidth: 2,
    borderColor: colors.secondary,
    borderStyle: 'dashed',
  },
  tokenText: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.secondary,
    textAlign: 'center',
    letterSpacing: 2,
  },
  modalHint: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    textAlign: 'center',
    marginTop: 12,
    lineHeight: 18,
  },
  modalActions: {
    flexDirection: 'row',
    gap: 12,
    marginTop: 24,
  },
  modalButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    paddingVertical: 14,
    paddingHorizontal: 16,
    borderRadius: 8,
    gap: 8,
  },
  modalButtonSecondary: {
    backgroundColor: `${colors.secondary}15`,
  },
  modalButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  modalButtonTextSecondary: {
    color: colors.secondary,
  },
});

export default TenantListScreen;