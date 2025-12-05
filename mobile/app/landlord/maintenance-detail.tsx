import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Image,
  KeyboardAvoidingView,
  Platform,
  Animated,
  Easing,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { apiService } from '../services/api';
import { SkeletonLoader } from '../components/skeletons/SkeletonLoader';

export default function MaintenanceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);
  const [showSuccess, setShowSuccess] = useState(false);
  const [showStatusDropdown, setShowStatusDropdown] = useState(false);
  const [showPriorityDropdown, setShowPriorityDropdown] = useState(false);
  const [updatingStatus, setUpdatingStatus] = useState(false);
  const [updatingPriority, setUpdatingPriority] = useState(false);
  const scrollViewRef = useRef<ScrollView>(null);
  const successOpacity = useRef(new Animated.Value(0)).current;
  const successScale = useRef(new Animated.Value(0.8)).current;

  const statusOptions = [
    { value: 'pending', label: 'Pending' },
    { value: 'in_progress', label: 'In Progress' },
    { value: 'completed', label: 'Completed' },
    { value: 'cancelled', label: 'Cancelled' },
  ];

  const priorityOptions = [
    { value: 'low', label: 'Low' },
    { value: 'medium', label: 'Medium' },
    { value: 'high', label: 'High' },
    { value: 'urgent', label: 'Urgent' },
  ];

  useEffect(() => {
    if (id) {
      loadRequest();
    }
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLandlordMaintenanceRequest(id as string);
      // Handle both wrapped and unwrapped responses
      const requestData = response.data?.data || response.data || response;
      console.log('📝 Comments data:', JSON.stringify(requestData.comments, null, 2));
      
      setRequest(requestData);
    } catch (error: any) {
      console.error('Error loading maintenance request:', error);
      console.error('Error details:', JSON.stringify(error.response?.data, null, 2));
      Alert.alert('Error', error.response?.data?.message || 'Failed to load maintenance request');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const showSuccessAnimation = () => {
    setShowSuccess(true);
    Animated.parallel([
      Animated.timing(successOpacity, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }),
      Animated.spring(successScale, {
        toValue: 1,
        friction: 8,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    setTimeout(() => {
      Animated.parallel([
        Animated.timing(successOpacity, {
          toValue: 0,
          duration: 200,
          useNativeDriver: true,
        }),
        Animated.timing(successScale, {
          toValue: 0.8,
          duration: 200,
          useNativeDriver: true,
        }),
      ]).start(() => setShowSuccess(false));
    }, 2000);
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      return;
    }

    try {
      setSubmittingComment(true);
      await apiService.addMaintenanceComment(id as string, comment);
      setComment('');
      await loadRequest();
      showSuccessAnimation();
      
      // Scroll to bottom to show new comment
      setTimeout(() => {
        scrollViewRef.current?.scrollToEnd({ animated: true });
      }, 100);
    } catch (error: any) {
      console.error('Error adding comment:', error);
    } finally {
      setSubmittingComment(false);
    }
  };

  const handleStatusUpdate = async (newStatus: string) => {
    try {
      setUpdatingStatus(true);
      await apiService.updateMaintenanceStatus(id as string, newStatus);
      await loadRequest();
      setShowStatusDropdown(false);
      showSuccessAnimation();
    } catch (error: any) {
      console.error('Error updating status:', error);
    } finally {
      setUpdatingStatus(false);
    }
  };

  const handlePriorityUpdate = async (newPriority: string) => {
    try {
      setUpdatingPriority(true);
      await apiService.updateMaintenancePriority(id as string, newPriority);
      await loadRequest();
      setShowPriorityDropdown(false);
      showSuccessAnimation();
    } catch (error: any) {
      console.error('Error updating priority:', error);
    } finally {
      setUpdatingPriority(false);
    }
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
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  if (loading) {
    return (
      <SafeAreaView style={styles.container}>
        <View style={styles.content}>
          <View style={styles.header}>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => router.back()}
            >
              <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
            </TouchableOpacity>
            <Text style={styles.headerTitle}>Maintenance Details</Text>
          </View>
          
          <SkeletonLoader width="40%" height={30} style={{ marginBottom: 16 }} />
          <SkeletonLoader width="80%" height={24} style={{ marginBottom: 20 }} />
          <SkeletonLoader width="100%" height={150} style={{ marginBottom: 20 }} />
          <SkeletonLoader width="100%" height={100} style={{ marginBottom: 20 }} />
          <SkeletonLoader width="100%" height={200} />
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return null;
  }

  return (
    <SafeAreaView style={styles.container}>
      <KeyboardAvoidingView
        behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
        style={{ flex: 1 }}
        keyboardVerticalOffset={Platform.OS === 'ios' ? 0 : 20}
      >
        <ScrollView
          ref={scrollViewRef}
          style={styles.scrollView}
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
          keyboardShouldPersistTaps="handled"
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
            <Text style={styles.headerTitle}>Maintenance Details</Text>
          </View>

          {/* Status and Priority */}
          <View style={styles.badgesContainer}>
            {/* Status Dropdown */}
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={[
                  styles.badge,
                  { backgroundColor: `${getStatusColor(request.status)}15` },
                ]}
                onPress={() => setShowStatusDropdown(!showStatusDropdown)}
              >
                <Text
                  style={[styles.badgeText, { color: getStatusColor(request.status) }]}
                >
                  {request.status?.replace('_', ' ').toUpperCase()}
                </Text>
                <MaterialIcons
                  name={showStatusDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={16}
                  color={getStatusColor(request.status)}
                />
              </TouchableOpacity>
              {showStatusDropdown && (
                <View style={styles.dropdown}>
                  {statusOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.dropdownItem,
                        request.status === option.value && styles.dropdownItemActive,
                      ]}
                      onPress={() => handleStatusUpdate(option.value)}
                      disabled={updatingStatus}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          request.status === option.value && styles.dropdownItemTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {request.status === option.value && (
                        <MaterialIcons name="check" size={16} color={colors.secondary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>

            {/* Priority Dropdown */}
            <View style={styles.dropdownWrapper}>
              <TouchableOpacity
                style={[
                  styles.badge,
                  { backgroundColor: `${getPriorityColor(request.priority)}15` },
                ]}
                onPress={() => setShowPriorityDropdown(!showPriorityDropdown)}
              >
                <Text
                  style={[
                    styles.badgeText,
                    { color: getPriorityColor(request.priority) },
                  ]}
                >
                  {request.priority?.toUpperCase()} PRIORITY
                </Text>
                <MaterialIcons
                  name={showPriorityDropdown ? 'keyboard-arrow-up' : 'keyboard-arrow-down'}
                  size={16}
                  color={getPriorityColor(request.priority)}
                />
              </TouchableOpacity>
              {showPriorityDropdown && (
                <View style={styles.dropdown}>
                  {priorityOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.dropdownItem,
                        request.priority === option.value && styles.dropdownItemActive,
                      ]}
                      onPress={() => handlePriorityUpdate(option.value)}
                      disabled={updatingPriority}
                    >
                      <Text
                        style={[
                          styles.dropdownItemText,
                          request.priority === option.value && styles.dropdownItemTextActive,
                        ]}
                      >
                        {option.label}
                      </Text>
                      {request.priority === option.value && (
                        <MaterialIcons name="check" size={16} color={colors.secondary} />
                      )}
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          </View>

          {/* Title */}
          <Text style={styles.title}>{request.title}</Text>

          {/* Property Info */}
          <View style={styles.infoCard}>
            <View style={styles.infoRow}>
              <MaterialIcons name="home" size={20} color={colors.secondary} />
              <Text style={styles.infoLabel}>Property:</Text>
              <Text style={styles.infoValue}>{request.propertyName}</Text>
            </View>
            {request.unitNumber && (
              <View style={styles.infoRow}>
                <MaterialIcons name="door-front" size={20} color={colors.secondary} />
                <Text style={styles.infoLabel}>Unit:</Text>
                <Text style={styles.infoValue}>{request.unitNumber}</Text>
              </View>
            )}
            <View style={styles.infoRow}>
              <MaterialIcons name="person" size={20} color={colors.secondary} />
              <Text style={styles.infoLabel}>Reported by:</Text>
              <Text style={styles.infoValue}>{request.reportedBy}</Text>
            </View>
            <View style={styles.infoRow}>
              <MaterialIcons name="calendar-today" size={20} color={colors.secondary} />
              <Text style={styles.infoLabel}>Date:</Text>
              <Text style={styles.infoValue}>{formatDate(request.createdAt)}</Text>
            </View>
            {request.hasFacilitator && (
              <View style={styles.infoRow}>
                <MaterialIcons name="engineering" size={20} color={colors.secondary} />
                <Text style={styles.infoLabel}>Assigned to:</Text>
                <Text style={styles.infoValue}>{request.assignedFacilitator}</Text>
              </View>
            )}
          </View>

          {/* Description */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Description</Text>
            <Text style={styles.description}>{request.description}</Text>
          </View>

          {/* Images */}
          {request.images && request.images.length > 0 && (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Images</Text>
              <ScrollView horizontal showsHorizontalScrollIndicator={false}>
                <View style={styles.imagesContainer}>
                  {request.images.map((image: string, index: number) => (
                    <Image
                      key={index}
                      source={{ uri: image }}
                      style={styles.image}
                      resizeMode="cover"
                    />
                  ))}
                </View>
              </ScrollView>
            </View>
          )}

          {/* Chat-style Comments */}
          <View style={styles.chatSection}>
            <View style={styles.chatHeader}>
              <MaterialIcons name="chat-bubble-outline" size={20} color={colors.primary} />
              <Text style={styles.chatTitle}>
                Discussion ({request.comments?.length || 0})
              </Text>
            </View>

            <View style={styles.chatContainer}>
              {request.comments && request.comments.length > 0 ? (
                request.comments.map((c: any, index: number) => (
                  <View key={index} style={styles.chatBubble}>
                    <View style={styles.avatarContainer}>
                      <View style={styles.avatar}>
                        <Text style={styles.avatarText}>
                          {(c.author || c.authorName || c.userName || 'User')?.charAt(0)?.toUpperCase()}
                        </Text>
                      </View>
                    </View>
                    <View style={styles.chatContent}>
                      <View style={styles.chatBubbleHeader}>
                        <Text style={styles.chatAuthor}>
                          {c.author || c.authorName || c.userName || 'User'}
                        </Text>
                        <Text style={styles.chatTime}>{formatDate(c.createdAt)}</Text>
                      </View>
                      <View style={styles.chatMessageBubble}>
                        <Text style={styles.chatMessage}>
                          {c.comment || c.text || c.message || 'No message'}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))
              ) : (
                <View style={styles.emptyChat}>
                  <MaterialIcons name="chat-bubble-outline" size={48} color="#E0E0E0" />
                  <Text style={styles.emptyChatText}>No messages yet</Text>
                  <Text style={styles.emptyChatSubtext}>Start the conversation</Text>
                </View>
              )}
            </View>
          </View>

          {/* Chat Input */}
          <View style={styles.chatInputSection}>
            <View style={styles.chatInputContainer}>
              <TextInput
                style={styles.chatInput}
                placeholder="Type your message..."
                placeholderTextColor="#999"
                value={comment}
                onChangeText={setComment}
                multiline
                maxLength={500}
              />
              <TouchableOpacity
                style={[
                  styles.sendButton,
                  (!comment.trim() || submittingComment) && styles.sendButtonDisabled,
                ]}
                onPress={handleAddComment}
                disabled={!comment.trim() || submittingComment}
              >
                {submittingComment ? (
                  <MaterialIcons name="hourglass-empty" size={24} color="#fff" />
                ) : (
                  <MaterialIcons name="send" size={24} color="#fff" />
                )}
              </TouchableOpacity>
            </View>
          </View>

          {/* Success Animation */}
          {showSuccess && (
            <Animated.View
              style={[
                styles.successToast,
                {
                  opacity: successOpacity,
                  transform: [{ scale: successScale }],
                },
              ]}
            >
              <MaterialIcons name="check-circle" size={24} color="#fff" />
              <Text style={styles.successText}>Message sent!</Text>
            </Animated.View>
          )}
          </View>
        </ScrollView>
      </KeyboardAvoidingView>
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
    marginBottom: 20,
  },
  backButton: {
    marginRight: 12,
  },
  headerTitle: {
    fontSize: 20,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  badgesContainer: {
    flexDirection: 'row',
    gap: 8,
    marginBottom: 16,
    zIndex: 1000,
  },
  dropdownWrapper: {
    position: 'relative',
    zIndex: 1000,
  },
  badge: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
    gap: 4,
  },
  badgeText: {
    fontSize: 12,
    fontFamily: 'Outfit_600SemiBold',
  },
  dropdown: {
    position: 'absolute',
    top: '100%',
    left: 0,
    right: 0,
    backgroundColor: '#fff',
    borderRadius: 8,
    marginTop: 4,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
    zIndex: 1001,
    minWidth: 150,
  },
  dropdownItem: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#F0F0F0',
  },
  dropdownItemActive: {
    backgroundColor: `${colors.secondary}10`,
  },
  dropdownItemText: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: colors.primary,
  },
  dropdownItemTextActive: {
    color: colors.secondary,
    fontFamily: 'Outfit_600SemiBold',
  },
  title: {
    fontSize: 24,
    fontFamily: 'Outfit_700Bold',
    color: colors.primary,
    marginBottom: 20,
  },
  infoCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 20,
    gap: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  infoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  infoLabel: {
    fontSize: 14,
    fontFamily: 'Outfit_500Medium',
    color: '#666',
  },
  infoValue: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    flex: 1,
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
  description: {
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    lineHeight: 24,
  },
  imagesContainer: {
    flexDirection: 'row',
    gap: 12,
  },
  image: {
    width: 200,
    height: 200,
    borderRadius: 12,
  },
  commentsContainer: {
    gap: 12,
  },
  commentCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 12,
    borderWidth: 1,
    borderColor: '#F0F0F0',
  },
  commentHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  commentAuthor: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  commentDate: {
    fontSize: 12,
    fontFamily: 'Outfit_400Regular',
    color: '#999',
  },
  // Chat Styles
  chatSection: {
    marginBottom: 24,
  },
  chatHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 16,
  },
  chatTitle: {
    fontSize: 18,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  chatContainer: {
    backgroundColor: '#F8F9FA',
    borderRadius: 16,
    padding: 16,
    minHeight: 200,
  },
  chatBubble: {
    flexDirection: 'row',
    marginBottom: 16,
    gap: 12,
  },
  avatarContainer: {
    paddingTop: 4,
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
  },
  avatarText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
  chatContent: {
    flex: 1,
  },
  chatBubbleHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 6,
  },
  chatAuthor: {
    fontSize: 14,
    fontFamily: 'Outfit_600SemiBold',
    color: colors.primary,
  },
  chatTime: {
    fontSize: 11,
    fontFamily: 'Outfit_400Regular',
    color: '#999',
  },
  chatMessageBubble: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderTopLeftRadius: 4,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 1,
  },
  chatMessage: {
    fontSize: 15,
    fontFamily: 'Outfit_400Regular',
    color: '#1A1A1A',
    lineHeight: 22,
  },
  emptyChat: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 40,
  },
  emptyChatText: {
    fontSize: 16,
    fontFamily: 'Outfit_500Medium',
    color: '#999',
    marginTop: 12,
  },
  emptyChatSubtext: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#CCC',
    marginTop: 4,
  },
  chatInputSection: {
    marginBottom: 20,
  },
  chatInputContainer: {
    flexDirection: 'row',
    alignItems: 'flex-end',
    backgroundColor: '#fff',
    borderRadius: 24,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 8,
    gap: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 4,
    elevation: 2,
  },
  chatInput: {
    flex: 1,
    fontSize: 15,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    maxHeight: 100,
    paddingVertical: 8,
  },
  sendButton: {
    width: 44,
    height: 44,
    borderRadius: 22,
    backgroundColor: colors.secondary,
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: colors.secondary,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
    elevation: 3,
  },
  sendButtonDisabled: {
    backgroundColor: '#CCC',
    shadowOpacity: 0,
    elevation: 0,
  },
  successToast: {
    position: 'absolute',
    top: 100,
    alignSelf: 'center',
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#34C759',
    paddingHorizontal: 20,
    paddingVertical: 12,
    borderRadius: 24,
    gap: 8,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.3,
    shadowRadius: 8,
    elevation: 8,
  },
  successText: {
    fontSize: 15,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
});
