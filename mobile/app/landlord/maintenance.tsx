import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  RefreshControl,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { apiService } from '../services/api';
import { MaintenanceStatsSkeleton, MaintenanceListSkeleton } from '../components/skeletons';

export default function LandlordMaintenanceScreen() {
  const router = useRouter();
  const [maintenanceRequests, setMaintenanceRequests] = useState<any[]>([]);
  const [stats, setStats] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [filter, setFilter] = useState<string>('all');

  useEffect(() => {
    loadData();
  }, [filter]);

  const loadData = async () => {
    try {
      setLoading(true);
      const filterParams = filter !== 'all' ? { status: filter } : undefined;
      
      console.log('🔄 Loading maintenance data with filter:', filter);
      console.log('Filter params:', filterParams);
      
      const [requestsResponse, statsResponse] = await Promise.all([
        apiService.getLandlordMaintenanceRequests(filterParams),
        apiService.getLandlordMaintenanceStats(),
      ]);

      console.log('📦 Maintenance requests response:', requestsResponse);
      console.log('📊 Stats response:', statsResponse);
      
      // Handle different response formats
      let requestsData: any[] = [];
      if (requestsResponse && requestsResponse.data && Array.isArray(requestsResponse.data)) {
        requestsData = requestsResponse.data;
      } else if (requestsResponse && Array.isArray(requestsResponse)) {
        requestsData = requestsResponse;
      }
      
      console.log('✅ Loaded maintenance requests:', requestsData.length);
      
      setMaintenanceRequests(requestsData);
      setStats(statsResponse?.data || statsResponse || {});
    } catch (error: any) {
      console.error('❌ Error loading maintenance data:', error);
      console.error('Error details:', {
        message: error.message,
        status: error.status,
        response: error.response,
      });
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    await loadData();
    setRefreshing(false);
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case 'urgent':
        return '#FF3B30';
      case 'high':
        return '#FF9500';
      case 'medium':
        return '#FFCC00';
      case 'low':
        return '#34C759';
      default:
        return '#8E8E93';
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return '#34C759';
      case 'in_progress':
        return '#007AFF';
      case 'pending':
        return '#FF9500';
      case 'cancelled':
        return '#8E8E93';
      default:
        return '#8E8E93';
    }
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      year: 'numeric',
    });
  };

  const filters = [
    { label: 'All', value: 'all' },
    { label: 'Pending', value: 'pending' },
    { label: 'In Progress', value: 'in_progress' },
    { label: 'Completed', value: 'completed' },
  ];

  if (loading && !refreshing) {
    return (
      <SafeAreaView style={styles.container}>
        <ScrollView
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          <View style={styles.content}>
            <View style={styles.header}>
              <View style={styles.headerTextContainer}>
                <Text style={styles.title}>Maintenance</Text>
                <Text style={styles.subtitle}>Manage property maintenance requests</Text>
              </View>
            </View>
            <MaintenanceStatsSkeleton />
            <MaintenanceListSkeleton count={4} />
          </View>
        </ScrollView>
      </SafeAreaView>
    );
  }

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        showsVerticalScrollIndicator={false}
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
          {/* Header */}
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <View style={styles.headerTextContainer}>
              <Text style={styles.title}>Maintenance</Text>
              <Text style={styles.subtitle}>Manage property maintenance requests</Text>
            </View>
          </View>

          {/* Stats Overview */}
          {stats && (
            <View style={styles.statsContainer}>
              <View style={styles.statCard}>
                <MaterialIcons name="build" size={24} color={colors.secondary} />
                <Text style={styles.statValue}>{stats.total || 0}</Text>
                <Text style={styles.statLabel}>Total</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="pending" size={24} color="#FF9500" />
                <Text style={styles.statValue}>{stats.pending || 0}</Text>
                <Text style={styles.statLabel}>Pending</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="autorenew" size={24} color="#007AFF" />
                <Text style={styles.statValue}>{stats.inProgress || 0}</Text>
                <Text style={styles.statLabel}>In Progress</Text>
              </View>
              <View style={styles.statCard}>
                <MaterialIcons name="check-circle" size={24} color="#34C759" />
                <Text style={styles.statValue}>{stats.completed || 0}</Text>
                <Text style={styles.statLabel}>Completed</Text>
              </View>
            </View>
          )}

          {/* Filter Tabs */}
          <View style={styles.filterContainer}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false}>
              {filters.map((f) => (
                <TouchableOpacity
                  key={f.value}
                  style={[
                    styles.filterTab,
                    filter === f.value && styles.filterTabActive,
                  ]}
                  onPress={() => setFilter(f.value)}
                >
                  <Text
                    style={[
                      styles.filterTabText,
                      filter === f.value && styles.filterTabTextActive,
                    ]}
                  >
                    {f.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Report Button */}
          <TouchableOpacity
            style={styles.reportButton}
            onPress={() => router.push('/landlord/report-maintenance')}
          >
            <MaterialIcons name="add" size={20} color="#fff" />
            <Text style={styles.reportButtonText}>Report Maintenance Issue</Text>
          </TouchableOpacity>

          {/* Maintenance Requests List */}
          <View style={styles.requestsList}>
            {maintenanceRequests.length === 0 ? (
              <View style={styles.emptyState}>
                <MaterialIcons name="build" size={64} color="#E0E0E0" />
                <Text style={styles.emptyStateTitle}>No Maintenance Requests</Text>
                <Text style={styles.emptyStateText}>
                  {filter !== 'all'
                    ? `No ${filter} maintenance requests found`
                    : 'No maintenance requests have been submitted yet'}
                </Text>
              </View>
            ) : (
              maintenanceRequests.map((request) => (
                <TouchableOpacity
                  key={request.id}
                  style={styles.requestCard}
                  onPress={() =>
                    router.push(`/landlord/maintenance-detail?id=${request.id}`)
                  }
                >
                  <View style={styles.requestHeader}>
                    <View style={styles.requestTitleContainer}>
                      <Text style={styles.requestTitle}>{request.title}</Text>
                      <View
                        style={[
                          styles.priorityBadge,
                          { backgroundColor: `${getPriorityColor(request.priority)}15` },
                        ]}
                      >
                        <Text
                          style={[
                            styles.priorityText,
                            { color: getPriorityColor(request.priority) },
                          ]}
                        >
                          {request.priority?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View
                      style={[
                        styles.statusBadge,
                        { backgroundColor: `${getStatusColor(request.status)}15` },
                      ]}
                    >
                      <Text
                        style={[
                          styles.statusText,
                          { color: getStatusColor(request.status) },
                        ]}
                      >
                        {request.status?.replace('_', ' ').toUpperCase()}
                      </Text>
                    </View>
                  </View>

                  <Text style={styles.requestDescription} numberOfLines={2}>
                    {request.description}
                  </Text>

                  <View style={styles.requestMeta}>
                    <View style={styles.metaItem}>
                      <MaterialIcons name="home" size={16} color="#666" />
                      <Text style={styles.metaText}>{request.propertyName}</Text>
                    </View>
                    {request.unitNumber && (
                      <View style={styles.metaItem}>
                        <MaterialIcons name="door-front" size={16} color="#666" />
                        <Text style={styles.metaText}>Unit {request.unitNumber}</Text>
                      </View>
                    )}
                  </View>

                  <View style={styles.requestFooter}>
                    <View style={styles.reporterInfo}>
                      <MaterialIcons name="person" size={16} color="#666" />
                      <Text style={styles.reporterText}>{request.reportedBy}</Text>
                    </View>
                    <Text style={styles.dateText}>{formatDate(request.createdAt)}</Text>
                  </View>

                  {request.hasFacilitator && (
                    <View style={styles.facilitatorInfo}>
                      <MaterialIcons name="engineering" size={16} color={colors.secondary} />
                      <Text style={styles.facilitatorText}>
                        Assigned to: {request.assignedFacilitator}
                      </Text>
                    </View>
                  )}
                </TouchableOpacity>
              ))
            )}
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
    paddingBottom: 100,
  },
  content: {
    flex: 1,
    padding: 20,
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
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  backButton: {
    marginRight: 12,
  },
  headerTextContainer: {
    flex: 1,
  },
  title: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 4,
  },
  subtitle: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666666',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 20,
  },
  statCard: {
    flex: 1,
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    alignItems: 'center',
    marginHorizontal: 4,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  statValue: {
    fontSize: 18,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginTop: 8,
    marginBottom: 4,
  },
  statLabel: {
    fontSize: 11,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    textAlign: 'center',
  },
  filterContainer: {
    marginBottom: 16,
  },
  filterTab: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    backgroundColor: '#F5F5F5',
    marginRight: 8,
  },
  filterTabActive: {
    backgroundColor: colors.secondary,
  },
  filterTabText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
  },
  filterTabTextActive: {
    color: '#fff',
  },
  reportButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    marginBottom: 20,
    gap: 8,
  },
  reportButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  requestsList: {
    gap: 12,
  },
  requestCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    borderWidth: 1,
    borderColor: '#F0F0F0',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  requestHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 8,
  },
  requestTitleContainer: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginRight: 8,
  },
  requestTitle: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
    flex: 1,
  },
  priorityBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  priorityText: {
    fontSize: 10,
    fontFamily: 'Outfit_600SemiBold',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 8,
  },
  statusText: {
    fontSize: 10,
    fontFamily: 'Outfit_600SemiBold',
  },
  requestDescription: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    marginBottom: 12,
    lineHeight: 20,
  },
  requestMeta: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
    marginBottom: 12,
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  requestFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingTop: 12,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  reporterInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  reporterText: {
    fontSize: 13,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
  },
  dateText: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#999',
  },
  facilitatorInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    marginTop: 8,
    paddingTop: 8,
    borderTopWidth: 1,
    borderTopColor: '#F0F0F0',
  },
  facilitatorText: {
    fontSize: 12,
    fontFamily: 'Outfit_500Medium',
    color: colors.secondary,
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
    color: '#666666',
    textAlign: 'center',
  },
});
