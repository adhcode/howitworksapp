import React, { useState } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, Modal, TextInput, ActivityIndicator } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import { useRouter } from 'expo-router';
import colors from '../../theme/colors';
import CustomAlert from '../CustomAlert';
import { apiService } from '../../services/api';

const TenantQuickActions = () => {
    const router = useRouter();
    const [modalVisible, setModalVisible] = useState(false);
    const [message, setMessage] = useState('');
    const [sending, setSending] = useState(false);
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

    const handleReportIssue = () => {
        router.push('/tenant-screens/submit-complaint');
    };

    const handleSendMessage = () => {
        setModalVisible(true);
    };

    const handleSendQuickMessage = async () => {
        if (!message.trim()) {
            showAlert('warning', 'Empty Message', 'Please enter a message before sending.');
            return;
        }

        try {
            setSending(true);

            // First get landlord ID from properties
            const properties = await apiService.getProperties();
            if (properties && properties.data && properties.data.length > 0) {
                const landlordId = properties.data[0].landlordId;

                await apiService.sendMessage({
                    receiverId: landlordId,
                    subject: 'Quick Message',
                    content: message.trim(),
                });

                showAlert('success', 'Message Sent', 'Your message has been sent to your property manager.');
                setMessage('');
                setModalVisible(false);
            } else {
                showAlert('warning', 'No Property Manager Found', 'Unable to find your property manager. Please contact support.');
            }
        } catch (error: any) {
            console.error('Error sending message:', error);
            showAlert('error', 'Send Failed', error.message || 'Failed to send message. Please try again.');
        } finally {
            setSending(false);
        }
    };

    const quickMessages = [
        'Hello, I need assistance with my unit.',
        'There is a maintenance issue that needs attention.',
        'I have a question about my lease.',
        'Could you please contact me when convenient?',
    ];

    return (
        <>
            <View style={styles.container}>
                <Text style={styles.title}>Quick Actions</Text>
                <View style={styles.actionsContainer}>
                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleReportIssue}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="report-problem" size={24} color={colors.secondary} />
                        </View>
                        <Text style={styles.actionText}>Report an Issue</Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                        style={styles.actionButton}
                        onPress={handleSendMessage}
                        activeOpacity={0.7}
                    >
                        <View style={styles.iconContainer}>
                            <MaterialIcons name="message" size={24} color={colors.secondary} />
                        </View>
                        <Text style={styles.actionText}>Send Message</Text>
                    </TouchableOpacity>
                </View>
            </View>

            {/* Quick Message Modal */}
            <Modal
                visible={modalVisible}
                animationType="slide"
                transparent={true}
                onRequestClose={() => setModalVisible(false)}
            >
                <View style={styles.modalOverlay}>
                    <View style={styles.modalContent}>
                        <View style={styles.modalHeader}>
                            <Text style={styles.modalTitle}>Send Message to Property Manager</Text>
                            <TouchableOpacity onPress={() => setModalVisible(false)}>
                                <MaterialIcons name="close" size={24} color={colors.text} />
                            </TouchableOpacity>
                        </View>

                        {/* Quick Message Templates */}
                        <Text style={styles.sectionLabel}>Quick Messages:</Text>
                        <View style={styles.quickMessagesContainer}>
                            {quickMessages.map((quickMsg, index) => (
                                <TouchableOpacity
                                    key={index}
                                    style={styles.quickMessageButton}
                                    onPress={() => setMessage(quickMsg)}
                                >
                                    <Text style={styles.quickMessageText}>{quickMsg}</Text>
                                </TouchableOpacity>
                            ))}
                        </View>

                        {/* Custom Message Input */}
                        <Text style={styles.sectionLabel}>Or type your message:</Text>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Type your message here..."
                            placeholderTextColor={colors.textGray}
                            multiline
                            numberOfLines={4}
                            value={message}
                            onChangeText={setMessage}
                            maxLength={500}
                        />

                        {/* Send Button */}
                        <TouchableOpacity
                            style={[styles.sendButton, !message.trim() && styles.sendButtonDisabled]}
                            onPress={handleSendQuickMessage}
                            disabled={!message.trim() || sending}
                            activeOpacity={0.7}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <>
                                    <MaterialIcons name="send" size={20} color="#fff" />
                                    <Text style={styles.sendButtonText}>Send Message</Text>
                                </>
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>

            <CustomAlert
                visible={alertVisible}
                type={alertConfig.type}
                title={alertConfig.title}
                message={alertConfig.message}
                onClose={() => setAlertVisible(false)}
            />
        </>
    );
};

const styles = StyleSheet.create({
    container: {
        marginBottom: 24,
    },
    title: {
        fontSize: 20,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
        marginBottom: 20,
    },
    actionsContainer: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        gap: 16,
    },
    actionButton: {
        flex: 1,
        backgroundColor: '#fff',
        borderRadius: 16,
        padding: 20,
        alignItems: 'center',
        borderWidth: 1,
        borderColor: '#E1E1E1',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: {
            width: 0,
            height: 2,
        },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    iconContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: `${colors.secondary}15`,
        alignItems: 'center',
        justifyContent: 'center',
        marginBottom: 12,
    },
    actionText: {
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: colors.text,
        textAlign: 'center',
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
        padding: 24,
        width: '100%',
        maxHeight: '80%',
    },
    modalHeader: {
        flexDirection: 'row',
        justifyContent: 'space-between',
        alignItems: 'center',
        marginBottom: 20,
    },
    modalTitle: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.primary,
    },
    sectionLabel: {
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: colors.text,
        marginBottom: 12,
        marginTop: 16,
    },
    quickMessagesContainer: {
        gap: 8,
        marginBottom: 8,
    },
    quickMessageButton: {
        backgroundColor: colors.background,
        borderRadius: 8,
        padding: 12,
        borderWidth: 1,
        borderColor: '#E1E1E1',
    },
    quickMessageText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.text,
    },
    messageInput: {
        borderWidth: 1,
        borderColor: '#E1E1E1',
        borderRadius: 12,
        padding: 16,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.text,
        textAlignVertical: 'top',
        minHeight: 100,
    },
    sendButton: {
        backgroundColor: colors.secondary,
        borderRadius: 12,
        paddingVertical: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        gap: 8,
        marginTop: 20,
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    sendButtonText: {
        color: '#fff',
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
    },
});

export default TenantQuickActions; 