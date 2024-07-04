import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Dimensions } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Incubator, Constants, Spacings, Image, Colors, Card } from 'react-native-ui-lib';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue } from "react-native-reanimated";
import { router } from 'expo-router';

const { Toast } = Incubator;

const Home = () => {
    const [toastVisible, setToastVisible] = useState(true);

    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth > 768 ? screenWidth * 1 : 450;

    useEffect(() => {
        const timer = setTimeout(() => {
            setToastVisible(false);
        }, 6500);

        return () => clearTimeout(timer); // This will clear the timer when the component unmounts.
    }, []);

    const cards = [
        { image: require('../../assets/images/home/welcome.png'), title: 'Welcome to the Empathy Guide App!', description: 'Welcome to the Empathy Guide mobile app! Feel free to explore or click here to learn more about this project!', onPress: () => router.push('welcome') },
        { image: require('../../assets/images/home/empathy.png'), title: 'Learn about Empathy!', description: 'Learn about the meaning of empathy, and why it is is an important factor in helping guests empathize with wildlife.' },
        { image: require('../../assets/images/home/resources.png'), title: 'Additional Resources', description: 'View a collection of resources related to empathy and conservation.' }
    ];

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

            {/* Toast Message for Home Screen */}
            <Toast
                visible={toastVisible}
                position={'bottom'}
                preset='general'
                swipeable={true}
                enableHapticFeedback={true}
                messageStyle={{ fontSize: 13, fontWeight: 'bold' }}
                message='Please Note: While all of the information in these guides is acceptable to share with the public, this app should only be shared with Oakland Zoo staff, volunteers, and interns.'
            />

            <View style={{ flex: 1 }}>
                <View style={{ height: 215 }}>
                    <Carousel
                        data={cards}
                        renderItem={({ item }) => (
                            <Card key={item.title} style={{ flex: 1, maxHeight: 200, margin: 10 }} onPress={item.onPress}>
                                <Card.Section imageSource={item.image} imageStyle={{ height: 100, width: imageWidth, alignSelf: "center" }} />
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
                        height={240}
                        autoPlay={true}
                        autoPlayInterval={5000}
                        scrollAnimationDuration={1000}
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


                <View style={{ margin: 15, marginTop: 20, marginBottom: 25 }}>
                    <Text style={{ fontWeight: 'bold', fontSize: 25 }}>Select a Section of the Zoo</Text>
                    <Text style={{ fontStyle: 'italic', color: 'gray', fontSize: 15 }}>or Search for an Animal</Text>
                </View>

                <View style={{ flex: 1, flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-evenly' }}>
                    <Card style={{ width: '45%' }}>
                        <Card.Section imageSource={require('../../assets/images/home/search.png')} imageStyle={{ height: 100, width: screenWidth > 768 ? screenWidth * 0.5 : 300, alignSelf: "center" }} />
                        <Card.Section
                            content={[
                                { text: 'Search', text60BO: true, $textDefault: true },
                                { text: 'Search for an animal by species! (Currently disabled)', text80: true, $textDefault: true }
                            ]}
                            style={{ padding: 15 }}
                        />
                    </Card>
                    <Card style={{ width: '45%' }} onPress={() => router.push('cat')}>
                        <Card.Section imageSource={require('../../assets/images/home/cat.png')} imageStyle={{ height: 100, width: screenWidth > 768 ? screenWidth * 0.5 : 300, alignSelf: "center" }} />
                        <Card.Section
                            content={[
                                { text: 'California Trail', text60BO: true, $textDefault: true },
                                { text: 'Explore and learn all about California native animals!', text80: true, $textDefault: true }
                            ]}
                            style={{ padding: 15 }}
                        />
                    </Card>
                </View>



            </View>


        </GestureHandlerRootView>
    );
}

export default Home;
