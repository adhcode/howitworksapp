import React from 'react';
import { TouchableOpacity, Text, StyleSheet, TouchableOpacityProps } from 'react-native';

interface IconButtonProps extends TouchableOpacityProps {
    icon?: React.ReactNode;
    label?: string;
}

const IconButton: React.FC<IconButtonProps> = ({ icon, label, style, ...props }) => (
    <TouchableOpacity style={[styles.button, style]} {...props}>
        {icon}
        {label && <Text style={styles.label}>{label}</Text>}
    </TouchableOpacity>
);

const styles = StyleSheet.create({
    button: {
        flexDirection: 'row',
        alignItems: 'center',
        padding: 8,
    },
    label: {
        marginLeft: 8,
        fontSize: 16,
    },
});

export default IconButton; 