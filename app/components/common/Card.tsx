import React from 'react';
import { View, StyleSheet, ViewProps } from 'react-native';
import colors from '../../theme/colors';

const Card: React.FC<ViewProps> = ({ children, style, ...props }) => (
    <View style={[styles.card, style]} {...props}>
        {children}
    </View>
);

const styles = StyleSheet.create({
    card: {
        backgroundColor: colors.cardBg,
        borderRadius: 8,
        padding: 16,
        borderWidth: 1,
        borderColor: colors.cardBorder,
        marginVertical: 8,
    },
});

export default Card; 