import { View, Platform, Image, Text } from 'react-native';
import { Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Entypo } from '@expo/vector-icons';
import { Button, Dash } from 'react-native-ui-lib';
import * as WebBrowser from 'expo-web-browser';

export default function Learn() {
  // If the page was reloaded or navigated to directly, then the modal should be presented as
  // a full screen page. You may need to change the UI to account for this.
  const isPresented = router.canGoBack();
  const windowWidth = Dimensions.get('window').width;
  return (
    <View style={{ flex: 1 }}>
      {/* Use `../` as a simple way to navigate to the root. This is not analogous to "goBack". */}
      {!isPresented && <Link href="../">Dismiss</Link>}
      {/* Native modals have dark backgrounds on iOS. Set the status bar to light content and add a fallback for other platforms with auto. */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />


      <View style={{ position: 'relative' }}>
        <Image source={require('../../assets/images/home/empathy.png')} style={{ width: 450, height: 275, opacity: 0.3 }} />
        <Text style={{
          position: 'absolute',
          top: Platform.OS === 'android' ? 50 : 0,
          left: Platform.OS === 'android' ? 20 : 'auto',
          alignSelf: 'center',
          marginTop: 10,
          color: Platform.OS === 'android' ? 'black': 'gray',
          fontWeight: 'bold'
        }}>
          {Platform.OS === 'android' ? '<  Swipe Left to Close' : 'Swipe Down to Close'}
        </Text>
        {Platform.OS === 'ios' && <Entypo name="chevron-down" size={24} color="gray" style={{ position: 'absolute', alignSelf: 'center', top: 25 }} />}
        <Text style={{ position: 'absolute', bottom: 0, fontWeight: 'bold', fontSize: 35, marginLeft: 20, marginBottom: 15, marginRight: 10, color: 'black' }}>Why Empathy?</Text>
      </View>

      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 19, fontWeight: 'bold', marginBottom: 10 }}>Why is empathy important for guests?</Text>
        <Text style={{ marginBottom: 10, fontSize: 18 }}>Empathy is a stimulated emotional state that relies on the ability to perceive, understand, and care about the experiences or perspectives of another person or animal. At the Oakland Zoo, our mission is to inspire respect for and stewardship of the natural world. Every day, educators, docents, and animal care staff have opportunities to connect guests with the animals who live here. Helping guests cultivate empathy for the animals who live at the zoo can be a powerful internal motivator of conservation action as guests then extend this empathy to animals in the wild.</Text>
        <Text style={{ marginBottom: 20, fontSize: 18 }}>Through framing, storytelling, and informed perspective taking, we have the opportunity to present the animals in our care as individual beings with unique perspectives, needs, and preferences, which can help guests to strengthen their ability to empathize with wildlife.</Text>

        <Button label="Learn More" onPress={() => WebBrowser.openBrowserAsync('https://sites.google.com/view/ozempathy/about-empathy?authuser=0')} style={{marginBottom: 30}} />
      </View>


    </View>
  );
}
