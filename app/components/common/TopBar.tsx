import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { MaterialIcons } from '@expo/vector-icons';
import colors from '../../theme/colors';

interface TopBarProps {
    onBack?: () => void;
    title?: string;
    showBack?: boolean;
}

const TopBar: React.FC<TopBarProps> = ({ onBack, title, showBack = true }) => (
    <View style={styles.topBar}>
        <View style={styles.row}>
            {showBack && (
                <TouchableOpacity style={styles.backBtn} onPress={onBack}>
                    <MaterialIcons name="chevron-left" size={24} color={colors.primary} />
                </TouchableOpacity>
            )}
        </View>
        {title && <Text style={styles.title}>{title}</Text>}
    </View>
);

const styles = StyleSheet.create({
    topBar: {
        flexDirection: 'column',
        marginBottom: 16,
        minHeight: 40,
    },
    row: {
        flexDirection: 'row',
        alignItems: 'center',
    },
    backBtn: {
        marginLeft: -10,
        marginTop: 0,
        marginRight: 8,
    },
    title: {
        fontFamily: 'Outfit_600SemiBold',
        fontSize: 20,
        color: colors.primary,
        marginLeft: 0,
        marginTop: 4,
        textAlign: 'left',
    },
});

export default TopBar; 