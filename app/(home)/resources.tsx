import { View, Platform, Image, Text, ScrollView } from 'react-native';
import { Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Entypo } from '@expo/vector-icons';
import { Button, ExpandableSection } from 'react-native-ui-lib';
import { useToggleValue } from 'react-native-ui-lib/src/hooks';
import * as Linking from 'expo-linking';

export default function Resources() {
    // If the page was reloaded or navigated to directly, then the modal should be presented as
    // a full screen page. You may need to change the UI to account for this.
    const isPresented = router.canGoBack();
    const windowWidth = Dimensions.get('window').width;

    let section1 = false;

    return (
        <ScrollView style={{ flex: 1 }}>
            {/* Use `../` as a simple way to navigate to the root. This is not analogous to "goBack". */}
            {!isPresented && <Link href="../">Dismiss</Link>}
            {/* Native modals have dark backgrounds on iOS. Set the status bar to light content and add a fallback for other platforms with auto. */}
            <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />


            <View style={{ position: 'relative' }}>
                <Image source={require('../../assets/images/home/resources.png')} style={{ width: 450, height: 275, opacity: 0.3 }} />
                <Text style={{
                    position: 'absolute',
                    top: Platform.OS === 'android' ? 50 : 0,
                    left: Platform.OS === 'android' ? 20 : 'auto',
                    alignSelf: 'center',
                    marginTop: 10,
                    color: Platform.OS === 'android' ? 'black' : 'gray',
                    fontWeight: 'bold'
                }}>
                    {Platform.OS === 'android' ? '<  Swipe Left to Close' : 'Swipe Down to Close'}
                </Text>
                {Platform.OS === 'ios' && <Entypo name="chevron-down" size={24} color="gray" style={{ position: 'absolute', alignSelf: 'center', top: 25 }} />}
                <Text style={{ position: 'absolute', bottom: 0, fontWeight: 'bold', fontSize: 35, marginLeft: 20, marginBottom: 15, marginRight: 10, color: 'black' }}>Additional Resources</Text>
            </View>

            <View style={{ padding: 20, paddingBottom: 10 }}>

                <Text style={{ fontSize: 19, fontWeight: 'bold', marginBottom: 10 }}>Free Resources</Text>
                <Button label="Advancing Conservation Through Empathy" onPress={() => Linking.openURL('https://www.aceforwildlife.org/')} style={{ marginBottom: 10 }} />
                <Button label="Empathy Best Practices - Woodland Park Zoo" onPress={() => Linking.openURL('https://www.zoo.org/document.doc?id=2560')} style={{ marginBottom: 10 }} />
                <Button label="Fostering Empathy for Wildlife - Woodland Park Zoo " onPress={() => Linking.openURL('https://www.zoo.org/document.doc?id=2561')} style={{ marginBottom: 10 }} />
                <Button label="Best Practices in Developing Empathy Towards Wildlife - Seattle Aquarium" onPress={() => Linking.openURL('https://www.informalscience.org/sites/default/files/Best%20Practices%20Briefing%202019%20FINAL.pdf')} style={{ marginBottom: 10 }} />
                <Button label="The Case for Empathy - Kathryn Owen" onPress={() => Linking.openURL('https://www.zoo.org/document.doc?id=2556')} style={{ marginBottom: 10 }} />

            </View>

            <View style={{ padding: 20, paddingBottom: 10 }}>

                <Text style={{ fontSize: 19, fontWeight: 'bold', marginBottom: 10 }}>Peer Reviewed Articles (contact Wilson Sherman for help accessing)</Text>
                <Button label="Empathy for Animals: A Review of the Existing Literature - Ashley Young, Jim Wharton, Kathayoon Khalil" onPress={() => Linking.openURL('https://onlinelibrary.wiley.com/doi/abs/10.1111/cura.12257')} style={{ marginBottom: 10 }} />
                <Button label="Best Practices for Building Empathy Through Live Animal Encounters - Susan Akerman" onPress={() => Linking.openURL('https://www.tandfonline.com/doi/abs/10.1080/10598650.2018.1496388')} style={{ marginBottom: 10 }} />
                <Button label="Anthropomorphism and Anthropodenial: Consistency in Our Thinking about Humans and Other Animals - Frans de Waal" onPress={() => Linking.openURL('https://www.jstor.org/stable/43154308')} style={{ marginBottom: 10 }} />

            </View>

            <View style={{ padding: 20, paddingBottom: 30 }}>

                <Text style={{ fontSize: 19, fontWeight: 'bold', marginBottom: 10 }}>Books</Text>
                <Button label="An Immense Word - Ed Young" onPress={() => Linking.openURL('https://www.penguinrandomhouse.com/books/616914/an-immense-world-by-ed-yong/')} style={{ marginBottom: 10 }} />
                <Button label="Are We Smart Enough to Know How Smart Animals Are? - Frans de Wall" onPress={() => Linking.openURL('https://wwnorton.com/books/Are-We-Smart-Enough-to-Know-How-Smart-Animals-Are/')} style={{ marginBottom: 10 }} />
                <Button label="Beyond Words: What Animals Think and Feel - Carl Safina " onPress={() => Linking.openURL('https://us.macmillan.com/books/9781250094599/beyondwords')} style={{ marginBottom: 10 }} />
                <Button label="In the Shadow of Man - Jane Goodall" onPress={() => Linking.openURL('https://shop.janegoodall.org/product/In-The-Shadow-Of-Man/JGI107')} style={{ marginBottom: 10 }} />

            </View>


        </ScrollView>
    );
}
