import { View, Text, Dimensions, ScrollView, Platform } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack, useNavigation, Link } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import React from 'react';
import { LoaderScreen } from 'react-native-ui-lib';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Incubator, Constants, Spacings, Colors, Card, Image } from 'react-native-ui-lib';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue } from "react-native-reanimated";
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Entypo } from '@expo/vector-icons';
import Dash from 'react-native-ui-lib';
import { BlurView } from '@react-native-community/blur';

const Details = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [animal, setAnimal] = useState<any>({});
  const { id }: { id?: string } = useLocalSearchParams();
  const { other }: { other?: string } = useLocalSearchParams();
  const navigation = useNavigation();
  const isPresented = router.canGoBack();
  const windowWidth = Dimensions.get('window').width;

  useEffect(() => {
    const fetchAnimal = async () => {
      setIsLoading(true);
      const animalDocument = firestore().collection('animals').doc(other);
      const doc = await animalDocument.get();
      if (doc.exists) {
        const personalDataDocument = animalDocument.collection('personal').doc(id);
        const personalDataDoc = await personalDataDocument.get();
        let personalData: any = {};
        if (personalDataDoc.exists) {
          personalData = personalDataDoc.data();
        } else {
          personalData = {}; // Provide a default value for personalData
        }
        setAnimal({ id: doc.id, ...doc.data(), personalData });
      } else {
        console.log("No such document!");
      }
      setIsLoading(false);
    };

    fetchAnimal();
  }, [id]);

  useEffect(() => {
    if (animal.name) {
      navigation.setOptions({ title: `${animal.personalData.name}` });
    }
  }, [animal, navigation]);

  useEffect(() => {
    if (id) {
      navigation.setOptions({ presentation: 'modal', headerShown: false });
    }
  }, [id, navigation]);

  if (isLoading) {
    return <LoaderScreen />;
  }

  const birthDate = new Date(animal.personalData.born.seconds * 1000 + animal.personalData.born.nanoseconds / 1000);
  const now = new Date();
  let ageInYears = now.getFullYear() - birthDate.getFullYear();
  const m = now.getMonth() - birthDate.getMonth();

  if (m < 0 || (m === 0 && now.getDate() < birthDate.getDate())) {
    ageInYears--;
  }

  return (
    <ScrollView style={{ flex: 1 }}>
      {/* Use `../` as a simple way to navigate to the root. This is not analogous to "goBack". */}
      {!isPresented && <Link href="../">Dismiss</Link>}
      {/* Native modals have dark backgrounds on iOS. Set the status bar to light content and add a fallback for other platforms with auto. */}
      <StatusBar style={Platform.OS === 'ios' ? 'light' : 'auto'} />

      <View style={{ position: 'relative', overflow: Platform.OS === 'android' ? 'hidden' : 'visible' }}>
        <Image source={{ uri: animal.personalData.photourl }} style={{ width: windowWidth, height: 500 }} />
        <Text style={{
          position: 'absolute',
          top: Platform.OS === 'android' ? 50 : 0,
          left: Platform.OS === 'android' ? 20 : 'auto',
          alignSelf: 'center',
          marginTop: 10,
          color: Platform.OS === 'android' ? 'white' : 'white',
          fontWeight: 'bold'
        }}>
          {Platform.OS === 'android' ? '<  Swipe Left to Close' : 'Swipe Down to Close'}
        </Text>
        {Platform.OS === 'ios' && <Entypo name="chevron-down" size={24} color="white" style={{ position: 'absolute', alignSelf: 'center', top: 25 }} />}
        <BlurView
          style={{ position: 'absolute', left: 0, right: 0, bottom: 0, height: 60, justifyContent: 'center' }}
          overlayColor="transparent"
          blurType="regular"
          blurAmount={30}
          reducedTransparencyFallbackColor="gray"
        >
          <Text style={{ fontWeight: 'bold', fontSize: 35, marginLeft: 20, marginRight: 10, color: 'white', paddingLeft: Platform.OS === "android" ? 20 : 0, paddingTop: Platform.OS === "android" ? 5 : 0 }}>{animal.personalData.name}</Text>
        </BlurView>
      </View>

      {console.log(animal.personalData.born)}

      <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', alignContent: 'space-evenly', marginTop: 20, marginBottom: 30 }}>
        <Card style={{ width: '93%', marginBottom: 15 }}>
          <Card.Section imageSource={require('../../assets/images/detail/id.jpg')} imageStyle={{ height: 100, width: windowWidth > 768 ? windowWidth * 0.5 : 70, alignSelf: "center" }} />
          <Card.Section
            content={[
              { text: 'How to Identify', text60BO: true, $textDefault: true },
              { text: animal.personalData.id, text70: true, $textDefault: true }
            ]}
            style={{ padding: 15 }}
          />
        </Card>
        <Card style={{ width: '45%' }}>
          <Card.Section imageSource={require('../../assets/images/detail/sex.png')} imageStyle={{ height: 100, width: windowWidth > 768 ? windowWidth * 0.5 : 100, alignSelf: "center" }} />
          <Card.Section
            content={[
              { text: 'Sex', text60BO: true, $textDefault: true },
              { text: animal.personalData.sex, text70: true, $textDefault: true }
            ]}
            style={{ padding: 15 }}
          />
        </Card>
        <Card style={{ width: '45%' }}>
          <Card.Section imageSource={require('../../assets/images/detail/age.png')} imageStyle={{ height: 100, width: windowWidth > 768 ? windowWidth * 0.5 : 300, alignSelf: "center" }} />
          <Card.Section
            content={[
              { text: 'Age', text60BO: true, $textDefault: true },
              { text: `${ageInYears.toFixed(1)} years`, text70: true, $textDefault: true }
            ]}
            style={{ padding: 15 }}
          />
        </Card>
        <Card style={{ width: '93%', marginTop: 15 }}>
          <Card.Section imageSource={require('../../assets/images/detail/notes.png')} imageStyle={{ height: 100, width: windowWidth > 768 ? windowWidth * 0.5 : 400, alignSelf: "center" }} />
          <Card.Section
            content={[
              { text: 'Keeper Notes', text60BO: true, $textDefault: true },
              { text: animal.personalData.keepernotes, text70: true, $textDefault: true }
            ]}
            style={{ padding: 15 }}
          />
        </Card>
        <Card style={{ width: '93%', marginTop: 15 }}>
          <Card.Section imageSource={require('../../assets/images/animal/map.jpg')} imageStyle={{ height: 100, width: windowWidth > 768 ? windowWidth * 0.5 : 400, alignSelf: "center" }} />
          <Card.Section
            content={[
              { text: 'Animal From', text60BO: true, $textDefault: true },
              { text: animal.personalData.from, text70: true, $textDefault: true }
            ]}
            style={{ padding: 15 }}
          />
        </Card>
      </View>


    </ScrollView>
  )
}

export default Details
