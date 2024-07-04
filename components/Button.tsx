import { View, Text, Pressable, Animated, ViewStyle, TextStyle } from 'react-native'
import React from 'react'

interface Styles {
    container: ViewStyle;
    button: ViewStyle;
    text: TextStyle;
}

export default function Button({label, onPress, style}: {label: string, onPress?: () => void, style?: object}) {

    const animated = new Animated.Value(1)

    const fadeIn = () => {
        Animated.timing(animated, {
            toValue: 0.4,
            duration: 100,
            useNativeDriver: true
        }).start()
    }

    const fadeOut = () => {
        Animated.timing(animated, {
            toValue: 1,
            duration: 200,
            useNativeDriver: true
        }).start()
    }

    return (
        <View style={{...styles.container, ...style}}>
            <Pressable style={styles.button} onPress={onPress} onPressIn={fadeIn} onPressOut={fadeOut}>
                <Animated.View
                    style={{
                        opacity: animated
                    }}
                >
                    <Text style={styles.text}>{label}</Text>
                </Animated.View>
            </Pressable>
        </View>
    )
}

const styles: Styles = {
    container: {
        width: '100%',
        height: 60,
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3
    },
    button: {
        borderColor: 'white',
        borderRadius: 20,
        width: '100%',
        height: '100%',
        alignItems: 'center',
        justifyContent: 'center',
        padding: 3,
        backgroundColor: '#002D62'
    },
    text: {
        color: 'white',
        fontSize: 24
    }
}
