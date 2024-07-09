import { View, Platform, Image, Text } from 'react-native';
import { Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Entypo } from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import React, { useState, useEffect } from 'react';
import { LoaderScreen } from 'react-native-ui-lib';
import Button from '@/components/Button';

export default function Info() {
  // If the page was reloaded or navigated to directly, then the modal should be presented as
  // a full screen page. You may need to change the UI to account for this.
  const isPresented = router.canGoBack();
  const windowWidth = Dimensions.get('window').width;

  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>();

  function onAuthStateChanged(user: any): void {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  function handleSignOut(): void {
    auth().signOut();
    setTimeout(() => {
        <LoaderScreen message={'Signing Out...)'} color="gray" />
        router.replace("/");;
    }, 1000);
  }

  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    return subscriber; // unsubscribe on unmount
  }, []);

  if (initializing) return (<LoaderScreen message={'Give me a second :)'} color="gray" />);

  return (
    <View style={{ flex: 1 }}>
      {/* Use `../` as a simple way to navigate to the root. This is not analogous to "goBack". */}
      {!isPresented && <Link href="../">Dismiss</Link>}
      {/* Native modals have dark backgrounds on iOS. Set the status bar to light content and add a fallback for other platforms with auto. */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />


      <View style={{ position: 'relative' }}>
        <Image source={require('../../assets/images/home/settings.png')} style={{ width: 450, height: 275, opacity: 0.3 }} />
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
        <Text style={{ position: 'absolute', bottom: 0, fontWeight: 'bold', fontSize: 35, marginLeft: 20, marginBottom: 15, marginRight: 10, color: 'black' }}>Application Settings</Text>
      </View>

      <View style={{ padding: 20 }}>
        <Text style={{ fontSize: 25, fontWeight: 'bold', marginBottom: 3 }}>Account Information</Text>
        <Text style={{ marginBottom: 10, fontSize: 18 }}>You are currently logged in as: <Text style={{ fontWeight: 'bold' }}>{user?.email ?? 'Unknown'}</Text></Text>

        <Button label="Sign Out" onPress={handleSignOut} />

        <Text style={{ marginTop: 10, fontSize: 12 }}>Please note that this app is still in development and is not meant to fully replace the Empathy Guide website.</Text>
      </View>


    </View>
  );
}
