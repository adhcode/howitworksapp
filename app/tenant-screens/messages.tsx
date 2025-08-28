import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, TextInput, KeyboardAvoidingView, Platform, ActivityIndicator, Linking } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';
import { apiService } from '../services/api';
import { useAuth } from '../context/AuthContext';
import CustomAlert from '../components/CustomAlert';

interface Message {
    id: string;
    content: string;
    senderId: string;
    receiverId: string;
    senderName?: string;
    senderLastName?: string;
    createdAt: string;
    isRead: boolean;
    subject?: string;
}

interface Conversation {
    otherUserId: string;
    otherUserName: string;
    otherUserLastName: string;
    lastMessage: string;
    lastMessageTime: string;
}

const TenantMessagesScreen = () => {
    const { user } = useAuth();
    const [activeTab, setActiveTab] = useState<'conversations' | 'emergency'>('conversations');
    const [messageText, setMessageText] = useState('');
    const [conversations, setConversations] = useState<Conversation[]>([]);
    const [selectedConversation, setSelectedConversation] = useState<string | null>(null);
    const [messages, setMessages] = useState<Message[]>([]);
    const [loading, setLoading] = useState(false);
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

    useEffect(() => {
        if (user) {
            loadConversations();
        }
    }, [user]);

    const loadConversations = async () => {
        try {
            setLoading(true);
            const data = await apiService.getConversations();
            setConversations(Array.isArray(data) ? data : []);
        } catch (error: any) {
            console.error('Error loading conversations:', error);
            showAlert('error', 'Error', 'Failed to load conversations');
        } finally {
            setLoading(false);
        }
    };

    const loadMessages = async (otherUserId: string) => {
        try {
            setLoading(true);
            const data = await apiService.getConversation(otherUserId);
            setMessages(Array.isArray(data) ? data : []);
            setSelectedConversation(otherUserId);
        } catch (error: any) {
            console.error('Error loading messages:', error);
            showAlert('error', 'Error', 'Failed to load messages');
        } finally {
            setLoading(false);
        }
    };

    const handleSendMessage = async () => {
        if (messageText.trim() && selectedConversation && user) {
            try {
                setSending(true);
                await apiService.sendMessage({
                    receiverId: selectedConversation,
                    content: messageText.trim(),
                });
                setMessageText('');
                // Reload messages to show the new message
                await loadMessages(selectedConversation);
            } catch (error: any) {
                console.error('Error sending message:', error);
                showAlert('error', 'Error', 'Failed to send message');
            } finally {
                setSending(false);
            }
        }
    };

    const formatTime = (dateString: string) => {
        const date = new Date(dateString);
        return date.toLocaleTimeString('en-US', {
            hour: 'numeric',
            minute: '2-digit',
            hour12: true
        });
    };

    const handleCall = (number: string) => {
        Linking.openURL(`tel:${number}`);
    };

    const tabs = [
        { key: 'conversations', label: 'Conversations', icon: 'chat' },
        { key: 'emergency', label: 'Emergency', icon: 'emergency' }
    ];

    const emergencyContacts = [
        { label: 'Property Manager', number: '08030000000' },
        { label: 'Security', number: '07010000000' },
        { label: 'Fire Service', number: '199' },
        { label: 'Police', number: '199' }
    ];

    const renderConversationsTab = () => {
        if (selectedConversation) {
            // Show individual conversation
            return (
                <View style={styles.conversationView}>
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={() => setSelectedConversation(null)}
                    >
                        <MaterialIcons name="arrow-back" size={24} color={colors.primary} />
                        <Text style={styles.backText}>Back to Conversations</Text>
                    </TouchableOpacity>

                    {loading ? (
                        <View style={styles.loadingContainer}>
                            <ActivityIndicator size="large" color={colors.primary} />
                        </View>
                    ) : (
                        <ScrollView style={styles.messagesList} showsVerticalScrollIndicator={false}>
                            {messages.map((message) => (
                                <View
                                    key={message.id}
                                    style={[
                                        styles.messageContainer,
                                        message.senderId === user?.id ? styles.tenantMessage : styles.landlordMessage
                                    ]}
                                >
                                    <Text style={[
                                        styles.messageText,
                                        message.senderId === user?.id ? styles.tenantMessageText : styles.landlordMessageText
                                    ]}>
                                        {message.content}
                                    </Text>
                                    <Text style={styles.messageTime}>
                                        {formatTime(message.createdAt)}
                                    </Text>
                                </View>
                            ))}
                        </ScrollView>
                    )}

                    {/* Message Input */}
                    <View style={styles.messageInputContainer}>
                        <TextInput
                            style={styles.messageInput}
                            placeholder="Type your message..."
                            placeholderTextColor={colors.textGray}
                            value={messageText}
                            onChangeText={setMessageText}
                            multiline
                            maxLength={500}
                        />
                        <TouchableOpacity
                            style={[styles.sendButton, !messageText.trim() && styles.sendButtonDisabled]}
                            onPress={handleSendMessage}
                            disabled={!messageText.trim() || sending}
                        >
                            {sending ? (
                                <ActivityIndicator size="small" color="#fff" />
                            ) : (
                                <MaterialIcons name="send" size={20} color="#fff" />
                            )}
                        </TouchableOpacity>
                    </View>
                </View>
            );
        }

        // Show conversations list
        return (
            <View style={styles.conversationsContainer}>
                {loading ? (
                    <View style={styles.loadingContainer}>
                        <ActivityIndicator size="large" color={colors.primary} />
                    </View>
                ) : conversations.length === 0 ? (
                    <View style={styles.emptyContainer}>
                        <MaterialIcons name="chat-bubble-outline" size={64} color={colors.textGray} />
                        <Text style={styles.emptyTitle}>No Conversations Yet</Text>
                        <Text style={styles.emptySubtitle}>
                            Your messages with landlords and property managers will appear here.
                        </Text>
                    </View>
                ) : (
                    <ScrollView showsVerticalScrollIndicator={false}>
                        {conversations.map((conversation) => (
                            <TouchableOpacity
                                key={conversation.otherUserId}
                                style={styles.conversationItem}
                                onPress={() => loadMessages(conversation.otherUserId)}
                            >
                                <View style={styles.avatarContainer}>
                                    <Text style={styles.avatarText}>
                                        {conversation.otherUserName?.charAt(0)?.toUpperCase() || 'L'}
                                    </Text>
                                </View>
                                <View style={styles.conversationContent}>
                                    <Text style={styles.conversationName}>
                                        {conversation.otherUserName} {conversation.otherUserLastName}
                                    </Text>
                                    <Text style={styles.lastMessage} numberOfLines={1}>
                                        {conversation.lastMessage}
                                    </Text>
                                </View>
                                <Text style={styles.conversationTime}>
                                    {formatTime(conversation.lastMessageTime)}
                                </Text>
                            </TouchableOpacity>
                        ))}
                    </ScrollView>
                )}
            </View>
        );
    };

    const renderEmergencyTab = () => (
        <View style={styles.emergencyContainer}>
            <Text style={styles.emergencyTitle}>Emergency Contacts</Text>
            <Text style={styles.emergencySubtitle}>For urgent issues, call immediately:</Text>

            {emergencyContacts.map((contact, index) => (
                <TouchableOpacity
                    key={index}
                    style={styles.emergencyItem}
                    onPress={() => handleCall(contact.number)}
                >
                    <View style={styles.emergencyContent}>
                        <MaterialIcons name="phone" size={24} color={colors.primary} />
                        <View style={styles.emergencyText}>
                            <Text style={styles.emergencyLabel}>{contact.label}</Text>
                            <Text style={styles.emergencyNumber}>{contact.number}</Text>
                        </View>
                    </View>
                    <MaterialIcons name="call" size={20} color={colors.secondary} />
                </TouchableOpacity>
            ))}
        </View>
    );

    return (
        <SafeAreaView style={styles.container}>
            <Header title="Messages" showBack={true} />

            <View style={styles.content}>
                {/* Tab Navigation */}
                <View style={styles.tabContainer}>
                    {tabs.map((tab) => (
                        <TouchableOpacity
                            key={tab.key}
                            style={[
                                styles.tab,
                                activeTab === tab.key && styles.activeTab
                            ]}
                            onPress={() => setActiveTab(tab.key as any)}
                        >
                            <MaterialIcons
                                name={tab.icon as any}
                                size={20}
                                color={activeTab === tab.key ? colors.secondary : colors.textGray}
                            />
                            <Text style={[
                                styles.tabText,
                                activeTab === tab.key && styles.activeTabText
                            ]}>
                                {tab.label}
                            </Text>
                        </TouchableOpacity>
                    ))}
                </View>

                {/* Tab Content */}
                {activeTab === 'conversations' ? renderConversationsTab() : renderEmergencyTab()}
            </View>

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
    content: {
        flex: 1,
    },
    tabContainer: {
        flexDirection: 'row',
        backgroundColor: '#fff',
        marginHorizontal: 16,
        marginTop: 16,
        borderRadius: 12,
        padding: 4,
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
    },
    tab: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'center',
        paddingVertical: 12,
        paddingHorizontal: 16,
        borderRadius: 8,
        gap: 6,
    },
    activeTab: {
        backgroundColor: colors.primary,
    },
    tabText: {
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: colors.textGray,
    },
    activeTabText: {
        color: '#fff',
    },
    conversationsContainer: {
        flex: 1,
        padding: 16,
    },
    conversationView: {
        flex: 1,
    },
    backButton: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 16,
        gap: 8,
    },
    backText: {
        fontSize: 16,
        fontFamily: 'Outfit_500Medium',
        color: colors.primary,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    emptyContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
        paddingHorizontal: 32,
    },
    emptyTitle: {
        fontSize: 20,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.text,
        marginTop: 16,
        marginBottom: 8,
    },
    emptySubtitle: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
        textAlign: 'center',
        lineHeight: 24,
    },
    conversationItem: {
        flexDirection: 'row',
        alignItems: 'center',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 8,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    avatarContainer: {
        width: 48,
        height: 48,
        borderRadius: 24,
        backgroundColor: colors.primary,
        justifyContent: 'center',
        alignItems: 'center',
        marginRight: 12,
    },
    avatarText: {
        fontSize: 18,
        fontFamily: 'Outfit_600SemiBold',
        color: '#fff',
    },
    conversationContent: {
        flex: 1,
    },
    conversationName: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.text,
        marginBottom: 4,
    },
    lastMessage: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
    },
    conversationTime: {
        fontSize: 12,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
    },
    messagesList: {
        flex: 1,
        padding: 16,
    },
    messageContainer: {
        marginBottom: 12,
        maxWidth: '80%',
    },
    tenantMessage: {
        alignSelf: 'flex-end',
        backgroundColor: colors.primary,
        borderRadius: 16,
        borderBottomRightRadius: 4,
        padding: 12,
    },
    landlordMessage: {
        alignSelf: 'flex-start',
        backgroundColor: '#fff',
        borderRadius: 16,
        borderBottomLeftRadius: 4,
        padding: 12,
        borderWidth: 1,
        borderColor: colors.border,
    },
    messageText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        lineHeight: 20,
    },
    tenantMessageText: {
        color: '#fff',
    },
    landlordMessageText: {
        color: colors.text,
    },
    messageTime: {
        fontSize: 11,
        fontFamily: 'Outfit_400Regular',
        marginTop: 4,
        opacity: 0.7,
    },
    messageInputContainer: {
        flexDirection: 'row',
        alignItems: 'flex-end',
        padding: 16,
        backgroundColor: '#fff',
        borderTopWidth: 1,
        borderTopColor: colors.border,
        gap: 12,
    },
    messageInput: {
        flex: 1,
        borderWidth: 1,
        borderColor: colors.border,
        borderRadius: 20,
        paddingHorizontal: 16,
        paddingVertical: 10,
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.text,
        maxHeight: 100,
    },
    sendButton: {
        width: 40,
        height: 40,
        borderRadius: 20,
        backgroundColor: colors.secondary,
        justifyContent: 'center',
        alignItems: 'center',
    },
    sendButtonDisabled: {
        opacity: 0.5,
    },
    emergencyContainer: {
        padding: 16,
    },
    emergencyTitle: {
        fontSize: 20,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.text,
        marginBottom: 8,
    },
    emergencySubtitle: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
        marginBottom: 24,
    },
    emergencyItem: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        backgroundColor: '#fff',
        padding: 16,
        marginBottom: 12,
        borderRadius: 12,
        elevation: 1,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.05,
        shadowRadius: 2,
    },
    emergencyContent: {
        flexDirection: 'row',
        alignItems: 'center',
        gap: 12,
    },
    emergencyText: {
        flex: 1,
    },
    emergencyLabel: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.text,
        marginBottom: 2,
    },
    emergencyNumber: {
        fontSize: 14,
        fontFamily: 'Outfit_500Medium',
        color: colors.primary,
    },
});

export default TenantMessagesScreen; 