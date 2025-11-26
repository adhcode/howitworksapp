import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  TextInput,
  Alert,
  Image,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter, useLocalSearchParams } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import { apiService } from '../services/api';

export default function MaintenanceDetailScreen() {
  const router = useRouter();
  const { id } = useLocalSearchParams();
  const [request, setRequest] = useState<any>(null);
  const [loading, setLoading] = useState(true);
  const [comment, setComment] = useState('');
  const [submittingComment, setSubmittingComment] = useState(false);

  useEffect(() => {
    if (id) {
      loadRequest();
    }
  }, [id]);

  const loadRequest = async () => {
    try {
      setLoading(true);
      const response = await apiService.getLandlordMaintenanceRequest(id as string);
      setRequest(response.data);
    } catch (error: any) {
      console.error('Error loading maintenance request:', error);
      Alert.alert('Error', 'Failed to load maintenance request');
      router.back();
    } finally {
      setLoading(false);
    }
  };

  const handleAddComment = async () => {
    if (!comment.trim()) {
      Alert.alert('Error', 'Please enter a comment');
      return;
    }

    try {
      setSubmittingComment(true);
      await apiService.addMaintenanceComment(id as string, comment);
      setComment('');
      await loadRequest(); // Reload to get updated comments
      Alert.alert('Success', 'Comment added successfully');
    } catch (error: any) {
      console.error('Error adding comment:', error);
      Alert.alert('Error', 'Failed to add comment');
    } finally {
      setSubmittingComment(false);
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
        <View style={styles.loadingContainer}>
          <Text style={styles.loadingText}>Loading...</Text>
        </View>
      </SafeAreaView>
    );
  }

  if (!request) {
    return null;
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
            <View
              style={[
                styles.badge,
                { backgroundColor: `${getStatusColor(request.status)}15` },
              ]}
            >
              <Text
                style={[styles.badgeText, { color: getStatusColor(request.status) }]}
              >
                {request.status?.replace('_', ' ').toUpperCase()}
              </Text>
            </View>
            <View
              style={[
                styles.badge,
                { backgroundColor: `${getPriorityColor(request.priority)}15` },
              ]}
            >
              <Text
                style={[
                  styles.badgeText,
                  { color: getPriorityColor(request.priority) },
                ]}
              >
                {request.priority?.toUpperCase()} PRIORITY
              </Text>
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

          {/* Comments */}
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>
              Comments ({request.comments?.length || 0})
            </Text>
            {request.comments && request.comments.length > 0 ? (
              <View style={styles.commentsContainer}>
                {request.comments.map((c: any, index: number) => (
                  <View key={index} style={styles.commentCard}>
                    <View style={styles.commentHeader}>
                      <Text style={styles.commentAuthor}>{c.author}</Text>
                      <Text style={styles.commentDate}>{formatDate(c.createdAt)}</Text>
                    </View>
                    <Text style={styles.commentText}>{c.comment}</Text>
                  </View>
                ))}
              </View>
            ) : (
              <Text style={styles.noComments}>No comments yet</Text>
            )}
          </View>

          {/* Add Comment */}
          <View style={styles.addCommentSection}>
            <Text style={styles.sectionTitle}>Add Comment</Text>
            <TextInput
              style={styles.commentInput}
              placeholder="Write a comment..."
              value={comment}
              onChangeText={setComment}
              multiline
              numberOfLines={4}
              textAlignVertical="top"
            />
            <TouchableOpacity
              style={[
                styles.submitButton,
                submittingComment && styles.submitButtonDisabled,
              ]}
              onPress={handleAddComment}
              disabled={submittingComment}
            >
              <MaterialIcons name="send" size={20} color="#fff" />
              <Text style={styles.submitButtonText}>
                {submittingComment ? 'Sending...' : 'Send Comment'}
              </Text>
            </TouchableOpacity>
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
  },
  badge: {
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  badgeText: {
    fontSize: 12,
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
  commentText: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#666',
    lineHeight: 20,
  },
  noComments: {
    fontSize: 14,
    fontFamily: 'Outfit_400Regular',
    color: '#999',
    fontStyle: 'italic',
  },
  addCommentSection: {
    marginBottom: 20,
  },
  commentInput: {
    backgroundColor: '#fff',
    borderRadius: 12,
    borderWidth: 1,
    borderColor: '#E0E0E0',
    paddingHorizontal: 16,
    paddingVertical: 12,
    fontSize: 16,
    fontFamily: 'Outfit_400Regular',
    color: colors.primary,
    minHeight: 100,
    marginBottom: 12,
  },
  submitButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: colors.secondary,
    borderRadius: 12,
    paddingVertical: 14,
    gap: 8,
  },
  submitButtonDisabled: {
    opacity: 0.6,
  },
  submitButtonText: {
    fontSize: 16,
    fontFamily: 'Outfit_600SemiBold',
    color: '#fff',
  },
});
