import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  ActivityIndicator,
} from 'react-native';
import { useRouter, useLocalSearchParams } from 'expo-router';
import colors from '../theme/colors';
import Header from '../components/Header';
import { apiService } from '../services/api';
import CustomAlert from '../components/CustomAlert';

const ComplaintDetailScreen = () => {
  const router = useRouter();
  const params = useLocalSearchParams();
  const complaintId = params.id as string;

  const [loading, setLoading] = useState(true);
  const [complaint, setComplaint] = useState<any>(null);
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

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50';
      case 'in_progress':
      case 'in-progress':
        return colors.secondary;
      case 'pending':
        return '#FFA500';
      case 'cancelled':
        return '#F44336';
      default:
        return '#FFA500';
    }
  };

  useEffect(() => {
    loadComplaintDetail();
  }, [complaintId]);

  const loadComplaintDetail = async () => {
    try {
      setLoading(true);

      // Fetch maintenance request from backend
      const response = await apiService.getMaintenanceRequest(complaintId) as any;

      if (response) {
        const formattedComplaint = {
          id: response.id,
          title: response.title,
          description: response.description,
          date: new Date(response.createdAt).toLocaleDateString('en-US', {
            month: 'long',
            day: 'numeric',
            year: 'numeric'
          }),
          status: response.status || 'pending',
          statusColor: getStatusColor(response.status || 'pending'),
          priority: response.priority,
          images: response.images || [],
          assignedFacilitator: response.assignedTo ? 'Property Manager' : 'Not assigned yet',
          createdAt: response.createdAt,
          updatedAt: response.updatedAt,
        };
        setComplaint(formattedComplaint);
      } else {
        showAlert('error', 'Not Found', 'Maintenance request not found');
      }
    } catch (error: any) {
      console.error('Error loading complaint detail:', error);
      showAlert('error', 'Error', 'Failed to load maintenance request details');
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Complaint Detail" showBack={true} onBack={() => router.back()} />
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Loading complaint details...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!complaint) {
    return (
      <SafeAreaView style={styles.container}>
        <Header title="Complaint Detail" showBack={true} onBack={() => router.back()} />
        <View style={styles.errorContainer}>
          <Text style={styles.errorText}>Complaint not found</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <Header title="Complaint Detail" showBack={true} onBack={() => router.back()} />

      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Issue Title */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Issue Title</Text>
            <Text style={styles.detailValue}>{complaint.title}</Text>
          </View>

          {/* Date */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Date</Text>
            <Text style={styles.detailValue}>{complaint.date}</Text>
          </View>

          {/* Description */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Description</Text>
            <Text style={styles.detailValue}>{complaint.description}</Text>
          </View>

          {/* Current Status */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Current Status</Text>
            <View style={[styles.statusBadge, { backgroundColor: complaint.statusColor }]}>
              <Text style={styles.statusText}>{complaint.status}</Text>
            </View>
          </View>

          {/* Assigned Facilitator */}
          <View style={styles.detailRow}>
            <Text style={styles.detailLabel}>Assigned Facilitator</Text>
            <Text style={styles.detailValue}>{complaint.assignedFacilitator}</Text>
          </View>
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
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.text,
    marginTop: 16,
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorText: {
    fontSize: 18,
    fontFamily: 'Outfit_500Medium',
    color: colors.text,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  detailRow: {
    marginBottom: 24,
  },
  detailLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginBottom: 8,
  },
  detailValue: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
  },
  statusBadge: {
    paddingHorizontal: 16,
    paddingVertical: 6,
    borderRadius: 16,
    alignSelf: 'flex-start',
  },
  statusText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#fff',
  },
});

export default ComplaintDetailScreen;