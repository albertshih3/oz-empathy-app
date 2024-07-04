import { View, Text, Dimensions, ScrollView } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack, useNavigation } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import React from 'react';
import { LoaderScreen } from 'react-native-ui-lib';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Incubator, Constants, Spacings, Image, Colors, Card } from 'react-native-ui-lib';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue } from "react-native-reanimated";
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';

const Animal = () => {

    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth > 768 ? screenWidth * 1 : 450;

    const { id }: { id?: string } = useLocalSearchParams();
    const navigation = useNavigation();
    const [animal, setAnimal] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);

    useEffect(() => {
        const fetchAnimal = async () => {
            setIsLoading(true);
            const animalDocument = firestore().collection('animals').doc(id);
            const doc = await animalDocument.get();
            if (doc.exists) {
                const personalCollection = await animalDocument.collection('personal').get();
                const personalData = personalCollection.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                setAnimal({ id: doc.id, personal: personalData, ...doc.data() });
                setIsLoading(false);
            } else {
                console.log("No such document!");
                setIsLoading(false);
            }
        };

        fetchAnimal();
    }, [id]);

    useEffect(() => {
        if (animal.name) {
            navigation.setOptions({ title: `${animal.name}` });
        }
    }, [animal, navigation]);

    type PersonalItem = {
        photourl: string;
        name: string;
        title: string;
        id: string;
        image: { uri: string }
        description: string;
        onPress: () => void;
    };

    const cards = animal.personal ? animal.personal.map((item: PersonalItem) => ({
        image: { uri: item.photourl },
        title: item.name,
        description: item.id, // Add a description if available
        onPress: () => { }, // Add an onPress function if needed
    })) : [];

    const ref = React.useRef<ICarouselInstance>(null);
    const progress = useSharedValue<number>(0);

    const onPressPagination = (index: number) => {
        ref.current?.scrollTo({
            /**
             * Calculate the difference between the current index and the target index
             * to ensure that the carousel scrolls to the nearest index
             */
            count: index - progress.value,
            animated: true,
        });
    };

    return (
        <GestureHandlerRootView>
            {isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
                    <LoaderScreen message={'Good things are coming your way...'} color="gray" />
                </View>
            ) : (
                <ScrollView>
                    <View style={{ flex: 1, minHeight: 220 }}>

                    <Card style={{ flex: 1, maxHeight: 205, margin: 10, marginBottom: 5 }}>
                        <Card.Section
                            imageSource={require('../../assets/images/home/welcometext.png')} imageStyle={{ height: 100, width: imageWidth, alignSelf: "center" }}
                            content={[
                                { text: animal.name, text40BO: true, $textDefault: true },
                                { text: `${animal.class} • ${animal.family} • ${animal.genus} `, text80R: true },
                            ]}
                            contentStyle={{ padding: 35, marginTop: 0 }}
                        />
                        <Card.Section
                            content={[
                                {
                                    text: `View the details of ${animal.name} below. You can click on individual animals to view animal specific information.`,
                                    text70: true,
                                }
                            ]}
                            style={{ padding: 15, flex: 1 }}
                        />
                    </Card>
                    </View>

                    <View style={{ height: 180 }}>
                        <Carousel
                            data={cards}
                            renderItem={({ item }: { item: PersonalItem }) => (
                                <Card key={item.title} style={{ flex: 1, maxHeight: 165, margin: 10 }} onPress={ () => router.push({pathname: '/(detail)/[detail]', params: { id: item.title }}) }>
                                    <Card.Section
                                        content={[
                                            { text: item.title, text60BO: true, $textDefault: true },
                                            {
                                                text: item.description,
                                                text80: true,
                                                $textDefault: true
                                            }
                                        ]}
                                        style={{ padding: 15, flex: 1 }}
                                    />
                                </Card>
                            )}
                            width={Constants.screenWidth}
                            height={450}
                            autoPlay={false}
                            autoPlayInterval={3000}
                            scrollAnimationDuration={500}
                            onProgressChange={progress}
                        />
                    </View>
                    <View>
                        <Pagination.Basic
                            progress={progress}
                            data={cards}
                            dotStyle={{ backgroundColor: "rgba(0,0,0,0.2)", width: 20, height: 5, borderRadius: 3 }}
                            activeDotStyle={{ backgroundColor: Colors.blue30, width: 20, height: 5, borderRadius: 3 }}
                            containerStyle={{ gap: 5, marginTop: 7 }}
                            onPress={onPressPagination}
                        />
                    </View>
                        <View style={{ margin: 15, marginTop: 20, marginBottom: 15 }}>
                            <Text style={{ fontWeight: 'bold', fontSize: 25 }}>Species Information</Text>
                        </View>

                        <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', alignContent: 'space-evenly' }}>
                            <Card style={{ width: '45%' }}>
                                <Card.Section imageSource={require('../../assets/images/animal/diet.png')} imageStyle={{ height: 100, width: screenWidth > 768 ? screenWidth * 0.5 : 300, alignSelf: "center" }} />
                                <Card.Section
                                    content={[
                                        { text: 'Diet', text60BO: true, $textDefault: true },
                                        { text: animal.diet, text80: true, $textDefault: true }
                                    ]}
                                    style={{ padding: 15 }}
                                />
                            </Card>
                            <Card style={{ width: '45%' }}>
                                <Card.Section imageSource={require('../../assets/images/animal/age.jpg')} imageStyle={{ height: 100, width: screenWidth > 768 ? screenWidth * 0.5 : 300, alignSelf: "center" }} />
                                <Card.Section
                                    content={[
                                        { text: 'Lifespan', text60BO: true, $textDefault: true },
                                        { text: animal.lifespan, text80: true, $textDefault: true }
                                    ]}
                                    style={{ padding: 15 }}
                                />
                            </Card>
                            <Card style={{ width: '93%', marginTop: 15, marginBottom: 30 }}>
                                <Card.Section imageSource={require('../../assets/images/animal/map.jpg')} imageStyle={{ height: 100, width: screenWidth > 768 ? screenWidth * 0.5 : 300, alignSelf: "center" }} />
                                <Card.Section
                                    content={[
                                        { text: 'Range', text60BO: true, $textDefault: true },
                                        { text: animal.range, text80: true, $textDefault: true }
                                    ]}
                                    style={{ padding: 15 }}
                                />
                            </Card>
                        </View>

                </ScrollView>
            )}
        </GestureHandlerRootView>
    )
}

export default Animal
