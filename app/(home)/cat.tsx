import { View, Text, Dimensions, ScrollView } from 'react-native'
import { useEffect, useState } from 'react'
import { Card, ListItem, Colors, Constants, Incubator } from 'react-native-ui-lib';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import React from 'react'
import firestore from '@react-native-firebase/firestore';
import { Link, router } from 'expo-router';

const California = () => {
    const [animals, setAnimals] = useState<any[]>([]);

    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth > 768 ? screenWidth * 1 : 450;

    useEffect(() => {
        const fetchAnimals = async () => {
            const animalsCollection = firestore().collection('animals');
            const snapshot = await animalsCollection.get();
            const animalsList = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnimals(animalsList);
        };

        fetchAnimals();
    }, []);

    return (
        <ScrollView>
            <View style={{ flex: 1, flexDirection: screenWidth < 768 ? 'column' : 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', margin: 5, marginTop: 20, marginBottom: 20 }}>
                {animals.map((animal) => (
                    <Card key={animal.name} style={{ width: screenWidth > 768 ? '47%' : '95%', margin: 10 }} onPress={ () => router.push({pathname: '/(animal)/[animal]', params: { id: animal.id }}) }>
                        <Card.Section
                            imageSource={{ uri: animal.photo }}
                            imageStyle={{ height: 200, width: screenWidth < 768 ? 425 : 565, alignSelf: "center" }}
                        />
                        <Card.Section
                            content={[
                                { text: animal.name, text60: true, $textDefault: true },
                                { text: `${animal.class} • ${animal.order} • ${animal.family} • ${animal.genus} `, text100R: true },
                            ]}
                            style={{ padding: 15 }}
                        />
                    </Card>
                ))}
            </View>
        </ScrollView>
    )
}

export default California
