import { View, Platform, Image, Text } from 'react-native';
import { Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Entypo } from '@expo/vector-icons';
import { Dash } from 'react-native-ui-lib';
import { GestureHandlerRootView, ScrollView } from 'react-native-gesture-handler';

export default function Diet() {
    // If the page was reloaded or navigated to directly, then the modal should be presented as
    // a full screen page. You may need to change the UI to account for this.
    const isPresented = router.canGoBack();
    const windowWidth = Dimensions.get('window').width;
    return (
        <GestureHandlerRootView style={{ flex: 1 }}>
            <ScrollView style={{ flex: 1 }}>
                {/* Use `../` as a simple way to navigate to the root. This is not analogous to "goBack". */}
                {!isPresented && <Link href="../">Dismiss</Link>}
                {/* Native modals have dark backgrounds on iOS. Set the status bar to light content and add a fallback for other platforms with auto. */}
                <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />


                <View style={{ position: 'relative' }}>
                    <Image source={require('../../assets/images/home/welcome.png')} style={{ width: 450, height: 275 }} />
                    <Text style={{ position: 'absolute', bottom: 0, fontWeight: 'bold', fontSize: 35, marginLeft: 20, marginBottom: 15, marginRight: 10, color: 'darkslategrey' }}>Diet</Text>
                </View>

                <View style={{ padding: 20 }}>
                    <Text style={{ fontSize: 19, fontWeight: 'bold', marginBottom: 10 }}>Each animal has a unique diet that can be catagorized into four broad catagories*.</Text>

                    <Dash color='lightgray' length={windowWidth - 40} />

                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>Carnivore/Carnivorous</Text>
                    <Text style={{ marginTop: 10, fontSize: 18, marginBottom: 10 }}>A carnivore (/ˈkɑːrnɪvɔːr/), or meat-eater <Text style={{ fontStyle: 'italic' }}>(Latin, caro, genitive carnis, meaning meat or "flesh" and vorare meaning "to devour")</Text>, is an animal or plant whose food and energy requirements are met by the consumption of animal tissues (mainly muscle, fat and other soft tissues) whether through hunting or scavenging.</Text>

                    <Dash color='lightgray' length={windowWidth - 40} />

                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>Herbivore/Herbivorous</Text>
                    <Text style={{ marginTop: 10, fontSize: 18 }}>A herbivore is an animal anatomically and physiologically adapted to eating plant material, for example foliage or marine algae, for the main component of its diet. As a result of their plant diet, herbivorous animals typically have mouthparts adapted to rasping or grinding. Horses and other herbivores have wide flat teeth that are adapted to grinding grass, tree bark, and other tough plant material.</Text>
                    <Text style={{ marginTop: 10, fontSize: 18, marginBottom: 10 }}>A large percentage of herbivores have mutualistic gut flora that help them digest plant matter, which is more difficult to digest than animal prey. This flora is made up of cellulose-digesting protozoans or bacteria.</Text>

                    <Dash color='lightgray' length={windowWidth - 40} />

                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>Omnivore/Omnivorous</Text>
                    <Text style={{ marginTop: 10, fontSize: 18, marginBottom: 10 }}>An omnivore (/ˈɒmnɪvɔːr/) is an animal that has the ability to eat and survive on both plant and animal matter. Obtaining energy and nutrients from plant and animal matter, omnivores digest carbohydrates, protein, fat, and fiber, and metabolize the nutrients and energy of the sources absorbed. Often, they have the ability to incorporate food sources such as algae, fungi, and bacteria into their diet.</Text>

                    <Dash color='lightgray' length={windowWidth - 40} />

                    <Text style={{ fontSize: 24, fontWeight: 'bold', marginTop: 10 }}>Scavanger</Text>
                    <Text style={{ marginTop: 10, fontSize: 18 }}>Scavengers are animals that consume dead organisms that have died from causes other than predation or have been killed by other predators. While scavenging generally refers to carnivores feeding on carrion, it is also a herbivorous feeding behavior. Scavengers play an important role in the ecosystem by consuming dead animal and plant material. Decomposers and detritivores complete this process, by consuming the remains left by scavengers.</Text>

                    <Text style={{ marginTop: 10, fontSize: 12 }}>*There are many more catagories and subcatagories of animal diets that are not included here. The included catagories are commonly found and used throughout the zoo.</Text>
                </View>


            </ScrollView>
        </GestureHandlerRootView>
    );
}
