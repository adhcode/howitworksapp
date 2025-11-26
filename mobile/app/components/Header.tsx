import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ViewStyle, TextStyle } from 'react-native';
import { useRouter } from 'expo-router';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../theme/colors';

interface HeaderProps {
    title: string;
    showBack?: boolean;
    onBack?: () => void;
    subtitle?: string;
    rightElement?: React.ReactNode;
}

interface Styles {
    header: ViewStyle;
    container: ViewStyle;
    backButton: ViewStyle;
    titleContainer: ViewStyle;
    heading: TextStyle;
    subtitle: TextStyle;
    rightElement: ViewStyle;
}

export default function Header({
    title,
    showBack = true,
    onBack,
    subtitle,
    rightElement
}: HeaderProps) {
    const router = useRouter();

    const handleBack = () => {
        if (onBack) {
            onBack();
        } else {
            if (router.canGoBack()) {
                router.back();
            } else {
                // Better fallback - go to landlord home instead of login
                router.replace('/landlord/tabs/home');
            }
        }
    };

    return (
        <View style={styles.header}>
            <View style={styles.container}>
                {showBack && (
                    <TouchableOpacity
                        style={styles.backButton}
                        onPress={handleBack}
                        hitSlop={{ top: 15, bottom: 15, left: 15, right: 15 }}
                        activeOpacity={0.7}
                    >
                        <MaterialIcons
                            name="chevron-left"
                            size={28}
                            color={colors.text}
                        />
                    </TouchableOpacity>
                )}

                <View style={styles.titleContainer}>
                    <Text style={styles.heading}>{title}</Text>
                    {subtitle && <Text style={styles.subtitle}>{subtitle}</Text>}
                </View>

                {rightElement && (
                    <View style={styles.rightElement}>
                        {rightElement}
                    </View>
                )}
            </View>
        </View>
    );
}

const styles = StyleSheet.create<Styles>({
    header: {
        backgroundColor: colors.background,
        paddingTop: 8,
        paddingBottom: 20,
    },
    container: {
        flexDirection: 'column',
        paddingHorizontal: 20,
    },
    backButton: {
        alignSelf: 'flex-start',
        padding: 4,
        marginLeft: -4,
        marginBottom: 16,
    },
    titleContainer: {
        alignItems: 'flex-start',
    },
    heading: {
        fontSize: 24,
        fontFamily: 'Outfit_600SemiBold',
        color: colors.text,
        marginBottom: 4,
    },
    subtitle: {
        fontSize: 14,
        fontFamily: 'Outfit_400Regular',
        color: colors.textGray,
        marginTop: 4,
    },
    rightElement: {
        position: 'absolute',
        right: 20,
        top: 0,
    },
}); 