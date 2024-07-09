import { View, Text } from 'react-native'
import React from 'react'
import { Avatar } from 'react-native-ui-lib'
import { router } from 'expo-router'

const Account = () => {
    return (
        <View>
            <Avatar animate={true} size={30} onPress={() => router.push('info')} source={require('../assets/images/home/settings_icon.png')} />
        </View>
    )
}

export default Account