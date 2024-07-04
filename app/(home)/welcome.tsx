import { View, Platform, Image, Text } from 'react-native';
import { Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Entypo } from '@expo/vector-icons';
import { Dash } from 'react-native-ui-lib';

export default function Welcome() {
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
        <Image source={require('../../assets/images/home/welcome.png')} style={{ width: 450, height: 275 }} />
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
        <Text style={{ position: 'absolute', bottom: 0, fontWeight: 'bold', fontSize: 35, marginLeft: 20, marginBottom: 15, marginRight: 10, color: 'darkslategrey' }}>Welcome to the Empathy Guide App!</Text>
      </View>

      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 19, fontWeight: 'bold', marginBottom: 10 }}>Welcome to the Empathy Guide mobile app!</Text>
        <Text style={{ marginBottom: 10, fontSize: 18 }}>The empathy guide mobile application is designed to give you quick access to information about the animals at the zoo, <Text style={{ fontWeight: 'bold' }}>online or offline!</Text></Text>

        <Dash color='lightgray' length={windowWidth - 40} />

        <Text style={{ marginTop: 10, fontSize: 18 }}>You can get started by searching for an animal by section of the zoo, or by name. Clicking on a species of animal will provide you with access to important information such as the name of the animal or their ages.</Text>
        <Text style={{ marginTop: 10, fontSize: 18 }}>You can also learn about the meaning of empathy, and why it is an important to help guests empathize with wildlife.</Text>
        <Text style={{ marginTop: 10, marginBottom: 10, fontSize: 18, fontStyle: 'italic' }}>Please remember that while you are free to share the contents of the app to the public, the app is for zoo family only, and should only be installed on your own devices.</Text>

        <Dash color='lightgray' length={windowWidth - 40} />

        <Text style={{ marginTop: 10, fontSize: 12 }}>Please note that this app is still in development and is not meant to fully replace the Empathy Guide website.</Text>
      </View>


    </View>
  );
}
