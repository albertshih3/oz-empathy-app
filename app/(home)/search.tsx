import { View, Text, Dimensions, ScrollView, TextInput } from 'react-native'
import { useEffect, useState } from 'react'
import { Card, ListItem, Colors, Constants, Incubator } from 'react-native-ui-lib';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import React from 'react'
import firestore from '@react-native-firebase/firestore';
import { Link, router } from 'expo-router';

const Search = () => {
    const [animals, setAnimals] = useState<any[]>([]);
    const [searchTerm, setSearchTerm] = useState(''); // Add this line

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
            <TextInput
                style={{
                    height: 40,
                    borderColor: 'gray',
                    borderWidth: 3,
                    borderRadius: 20, // Rounded border
                    paddingLeft: 10, // Padding on the sides
                    paddingRight: 10,
                    paddingTop: 5, // More padding on the top
                    paddingBottom: 5,
                    marginTop: 20, // Add some space at the top of the page
                    marginLeft: 10, // Add some space on the left side
                    marginRight: 10, // Add some space on the right side
                }}
                onChangeText={text => setSearchTerm(text)}
                value={searchTerm}
                placeholder="Search"
                autoFocus={true}
            />

            <View style={{ flex: 1, flexDirection: screenWidth < 768 ? 'column' : 'row', flexWrap: 'wrap', justifyContent: 'space-evenly', margin: 5, marginTop: 20, marginBottom: 20 }}>
                {animals.filter(animal => animal.name.toLowerCase().includes(searchTerm.toLowerCase())).map((animal) => ( // Modify this line
                    <Card key={animal.name} style={{ width: screenWidth > 768 ? '47%' : '95%', margin: 10 }} onPress={() => router.push({ pathname: '/(animal)/[animal]', params: { id: animal.id } })}>
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

export default Search
