import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  SafeAreaView,
  TouchableOpacity,
  ActivityIndicator,
  TextInput,
} from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '../../theme/colors';
import { apiService } from '../../services/api';
import { useAuth } from '../../context/AuthContext';

const TenantReportsScreen = () => {
  const router = useRouter();
  const { user } = useAuth();
  const [loading, setLoading] = useState(true);
  const [complaints, setComplaints] = useState<any[]>([]);
  const [searchQuery, setSearchQuery] = useState('');

  const getStatusColor = (status: string) => {
    switch (status.toLowerCase()) {
      case 'completed':
        return '#4CAF50'; // Green
      case 'in_progress':
      case 'in-progress':
        return colors.secondary; // Orange
      case 'pending':
        return '#FFA500'; // Orange
      case 'cancelled':
        return '#F44336'; // Red
      default:
        return '#FFA500'; // Default orange
    }
  };

  useEffect(() => {
    loadComplaints();
  }, []);

  const loadComplaints = async () => {
    try {
      setLoading(true);

      // Try to get actual maintenance requests from backend
      try {
        const response = await apiService.getMaintenanceRequests();
        const formattedComplaints = Array.isArray(response) ? response.map((request: any) => ({
          id: request.id,
          title: request.title,
          description: request.description,
          date: new Date(request.createdAt).toLocaleDateString('en-US', {
            month: 'short',
            day: 'numeric',
            year: 'numeric'
          }),
          status: request.status || 'pending',
          statusColor: getStatusColor(request.status || 'pending'),
          priority: request.priority,
          images: request.images,
          createdAt: request.createdAt,
        })) : [];
        console.log('🔍 Formatted complaints:', formattedComplaints);
        setComplaints(formattedComplaints);
      } catch (apiError) {
        console.log('API not available, using mock data:', apiError);
        // Fallback to mock data if API is not available
        setComplaints([
          {
            id: '1',
            title: 'Generator Not Working',
            date: 'May 5, 2025',
            status: 'In Progress',
            statusColor: colors.secondary,
          },
          {
            id: '2',
            title: 'Leaking Kitchen Tap',
            date: 'May 6, 2025',
            status: 'Pending',
            statusColor: '#FFA500',
          },
          {
            id: '3',
            title: 'Leaking Kitchen Tap',
            date: 'May 5, 2025',
            status: 'Resolved',
            statusColor: '#4CAF50',
          },
          {
            id: '4',
            title: 'Leaking Kitchen Tap',
            date: 'May 5, 2025',
            status: 'Resolved',
            statusColor: '#4CAF50',
          },
        ]);
      }
    } catch (error) {
      console.error('Error loading complaints:', error);
      // Ensure complaints is always an array even if there's an error
      setComplaints([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSubmitComplaint = () => {
    router.push('/tenant-screens/submit-complaint');
  };

  const handleViewComplaint = (complaintId: string) => {
    router.push(`/tenant-screens/complaint-detail?id=${complaintId}`);
  };

  const filteredComplaints = (complaints || []).filter(complaint =>
    complaint?.title?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color={colors.secondary} />
          <Text style={styles.loadingText}>Loading reports...</Text>
        </View>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
      >
        <View style={styles.content}>
          {/* Header */}
          <View style={styles.header}>
            <Text style={styles.title}>Maintenance & Reports</Text>
            <Text style={styles.subtitle}>
              Log any complaint or maintenance request for your apartment or building.
            </Text>
          </View>

          {/* Submit New Complaint Button */}
          <TouchableOpacity style={styles.submitButton} onPress={handleSubmitComplaint}>
            <Text style={styles.submitButtonText}>Submit New Complaint</Text>
          </TouchableOpacity>

          {/* Past Complaints Section */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Past Complaints</Text>

            {/* Search Bar */}
            <View style={styles.searchContainer}>
              <MaterialIcons name="search" size={20} color="#999" />
              <TextInput
                style={styles.searchInput}
                placeholder="Search"
                value={searchQuery}
                onChangeText={setSearchQuery}
                placeholderTextColor="#999"
              />
            </View>

            {/* Complaints List */}
            <View style={styles.complaintsContainer}>
              {filteredComplaints.length === 0 ? (
                <View style={styles.noComplaintsCard}>
                  <Text style={styles.noComplaintsText}>
                    {searchQuery ? 'No complaints match your search' : 'No maintenance requests submitted yet'}
                  </Text>
                  <Text style={styles.noComplaintsSubtext}>
                    {!searchQuery && 'Submit your first maintenance request using the button above'}
                  </Text>
                </View>
              ) : (
                filteredComplaints.map((complaint) => (
                  <View key={complaint.id} style={styles.complaintCard}>
                    <View style={styles.complaintHeader}>
                      <Text style={styles.complaintTitle}>{complaint.title}</Text>
                      <View style={[styles.statusBadge, { backgroundColor: complaint.statusColor }]}>
                        <Text style={styles.statusText}>{complaint.status}</Text>
                      </View>
                    </View>
                    <Text style={styles.complaintDate}>{complaint.date}</Text>
                    <TouchableOpacity
                      style={styles.viewButton}
                      onPress={() => handleViewComplaint(complaint.id)}
                    >
                      <Text style={styles.viewButtonText}>View</Text>
                      <MaterialIcons name="arrow-forward" size={16} color={colors.secondary} />
                    </TouchableOpacity>
                  </View>
                ))
              )}
            </View>
          </View>
        </View>
      </ScrollView>
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
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: 20,
  },
  content: {
    padding: 20,
  },
  header: {
    marginBottom: 24,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    lineHeight: 20,
  },
  submitButton: {
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 16,
    alignItems: 'center',
    marginBottom: 32,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  section: {
    marginBottom: 24,
  },
  sectionTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    marginBottom: 16,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff',
    borderRadius: 12,
    paddingHorizontal: 16,
    paddingVertical: 12,
    marginBottom: 20,
    borderWidth: 1,
    borderColor: '#E1E1E1',
    gap: 12,
  },
  searchInput: {
    flex: 1,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
  },
  complaintsContainer: {
    gap: 12,
  },
  complaintCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  complaintHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  complaintTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    flex: 1,
    marginRight: 12,
  },
  statusBadge: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
    color: '#fff',
  },
  complaintDate: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginBottom: 12,
  },
  viewButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  viewButtonText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
  },
  noComplaintsCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 32,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#E1E1E1',
  },
  noComplaintsText: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  noComplaintsSubtext: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#999',
    textAlign: 'center',
    marginTop: 8,
  },
});

export default TenantReportsScreen;