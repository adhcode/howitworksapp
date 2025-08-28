import React, { useState } from 'react';
import {
    View,
    Text,
    StyleSheet,
    TextInput,
    TouchableOpacity,
    ScrollView,
} from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';
import Header from '../components/Header';

export default function TenantMessageScreen() {
    const router = useRouter();
    const [noticeTitle, setNoticeTitle] = useState('');
    const [noticeType, setNoticeType] = useState('');
    const [messageContent, setMessageContent] = useState('');

    const handleBack = () => {
        router.back();
    };

    const handleSendMessage = () => {
        // Handle sending message logic here
        console.log({ noticeTitle, noticeType, messageContent });
    };

    return (
        <SafeAreaView style={styles.container}>
            <Header
                title="Send Message"
                onBack={handleBack}
            />

            <ScrollView style={styles.content}>
                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Notice Title</Text>
                    <TextInput
                        style={styles.input}
                        placeholder="Enter Notice Title"
                        value={noticeTitle}
                        onChangeText={setNoticeTitle}
                        placeholderTextColor="#666"
                    />
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Notice Types</Text>
                    <TouchableOpacity style={styles.selectInput}>
                        <Text style={styles.selectText}>
                            {noticeType || 'Select Notice Types'}
                        </Text>
                        <MaterialIcons name="keyboard-arrow-down" size={24} color="#666" />
                    </TouchableOpacity>
                </View>

                <View style={styles.inputContainer}>
                    <Text style={styles.label}>Message/Notice Content</Text>
                    <TextInput
                        style={[styles.input, styles.textArea]}
                        placeholder="Text area for custom message"
                        value={messageContent}
                        onChangeText={setMessageContent}
                        multiline
                        numberOfLines={6}
                        textAlignVertical="top"
                        placeholderTextColor="#666"
                    />
                </View>

                <TouchableOpacity
                    style={styles.sendButton}
                    onPress={handleSendMessage}
                >
                    <Text style={styles.sendButtonText}>Send Message</Text>
                </TouchableOpacity>
            </ScrollView>
        </SafeAreaView>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1,
        backgroundColor: colors.background,
    },
    content: {
        flex: 1,
        padding: 20,
    },
    inputContainer: {
        marginBottom: 20,
    },
    label: {
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.primary,
        marginBottom: 8,
    },
    input: {
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        paddingHorizontal: 16,
        fontSize: 16,
        fontFamily: 'Outfit_400Regular',
        color: colors.primary,
        borderWidth: 1,
        borderColor: '#E1E1E1',
    },
    textArea: {
        height: 120,
        paddingTop: 12,
        paddingBottom: 12,
    },
    selectInput: {
        height: 48,
        backgroundColor: '#FFFFFF',
        borderRadius: 4,
        paddingHorizontal: 16,
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        borderWidth: 1,
        borderColor: '#E1E1E1',
    },
    selectText: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: '#666',
    },
    sendButton: {
        height: 48,
        backgroundColor: colors.secondary,
        borderRadius: 4,
        alignItems: 'center',
        justifyContent: 'center',
        marginTop: 12,
    },
    sendButtonText: {
        fontSize: 16,
        fontFamily: 'Outfit_600SemiBold',
        color: '#FFFFFF',
    },
}); 