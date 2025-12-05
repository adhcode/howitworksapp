import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import colors from '../../theme/colors';
import typography from '../../theme/typography';
import { useAuth } from '../../context/AuthContext';
import Avatar from '../shared/Avatar';
import NotificationBell from '../shared/NotificationBell';

const AVATAR_BELL_SIZE = 44;
const CONTAINER_WIDTH = 343;

interface GreetingHeaderProps {
  user?: any;
}

const GreetingHeader: React.FC<GreetingHeaderProps> = ({ user: propUser }) => {
    const { user: contextUser } = useAuth();
    const user = propUser || contextUser;
    
    const displayName = user ? 
        `${user.firstName || 'User'} ${user.lastName || ''}`.trim() :
        'User';
    return (
        <View style={styles.containerOuter}>
            <View style={styles.container}>
                <Avatar size={AVATAR_BELL_SIZE} user={user} />
                <View style={styles.textContainer}>
                    <Text style={[styles.hello, typography.heading]}>Hello,</Text>
                    <Text style={[styles.name, typography.heading]}>{displayName}</Text>
                </View>
                <NotificationBell size={AVATAR_BELL_SIZE} />
            </View>
        </View>
    );
};

const styles = StyleSheet.create({
    containerOuter: {
        width: CONTAINER_WIDTH,
        alignSelf: 'center',
    },
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 32,
        height: AVATAR_BELL_SIZE,
    },

    textContainer: {
        height: AVATAR_BELL_SIZE,
        justifyContent: 'center',
        flex: 1,
        marginLeft: 12,
    },
    hello: {
        fontFamily: 'Outfit_500Medium',
        fontSize: 16,
        color: colors.text,
        marginBottom: 2,
    },
    name: {
        color: colors.primary,
        fontFamily: 'Outfit_500Medium',
        fontSize: 16,
        marginTop: 2,
    },


});

export default GreetingHeader; 