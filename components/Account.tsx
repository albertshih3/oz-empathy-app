import { View, Text, TouchableOpacity, StyleSheet } from 'react-native'
import React, { useEffect, useState } from 'react'
import { Avatar } from 'react-native-ui-lib'
import { Ionicons } from '@expo/vector-icons'
import { router } from 'expo-router'
import { isAdminUser } from '../src/firebase/config'

const Account = () => {
    const [isAdmin, setIsAdmin] = useState(false);

    useEffect(() => {
        // Check if user has admin privileges
        setIsAdmin(isAdminUser());
    }, []);

    return (
        <View style={styles.container}>
            <TouchableOpacity
                style={styles.adminButton}
                onPress={() => router.push('/(home)/notifications')}
                activeOpacity={0.7}
            >
                <Ionicons name="notifications" size={24} color="#d9534f" />
            </TouchableOpacity>
            <TouchableOpacity
                style={styles.settingsButton}
                onPress={() => router.push('info')}
                activeOpacity={0.7}
            >
                <Ionicons name="settings-sharp" size={24} color="#0a7ea4" />
            </TouchableOpacity>
        </View>
    )
}

const styles = StyleSheet.create({
    container: {
        flexDirection: 'row',
        alignItems: 'center',
        marginRight: 8
    },
    settingsButton: {
        padding: 6
    },
    adminButton: {
        padding: 6,
        marginRight: 10
    }
});

export default Account