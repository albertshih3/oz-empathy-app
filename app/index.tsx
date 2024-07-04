import { Text, View, ImageBackground, StyleSheet } from "react-native";
import { StatusBar } from 'expo-status-bar';
import { Link } from 'expo-router';
import Button from "@/components/Button";
import { LinearGradient } from 'expo-linear-gradient';

export default function Index() {
    return (
        <View style={styles.container}>
            <StatusBar style="light" />
            <ImageBackground
                source={require("@/assets/images/hero.png")}
                style={styles.imageBackground}
                imageStyle={{ resizeMode: "cover" }}
            >
                <View style={styles.safeArea}>
                    <LinearGradient
                        colors={['transparent', 'rgba(255,255,255,0.8)', 'white']}
                        style={styles.linearGradient}
                    >
                        <Text style={styles.textLight}>The Oakland Zoo</Text>
                        <Text style={styles.textBold}>Empathy Guide</Text>
                        <Link href="(auth)/signin" asChild>
                            <Button style={{marginBottom: 35}} label="Let's Go!" />
                        </Link>
                    </LinearGradient>
            </View>
            </ImageBackground>
        </View>
    );
}

const styles = StyleSheet.create({
    container: {
        flex: 1
    },
    imageBackground: {
        flex: 1,
        justifyContent: "flex-end",
    },
    safeArea: {
        flex: 1,
        justifyContent: "flex-end",
    },
    linearGradient: {
        flex: 1,
        justifyContent: "flex-end",
        padding: 10,
    },
    textLight: {
        fontSize: 25,
        fontWeight: "light",
        marginTop: 20,
        marginLeft: 15,
    },
    textBold: {
        marginLeft: 15,
        fontSize: 40,
        fontWeight: "bold",
        marginBottom: 20
    },
});
