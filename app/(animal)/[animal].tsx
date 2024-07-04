import { View, Text, Dimensions } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack, useNavigation } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import React from 'react';
import { LoaderScreen } from 'react-native-ui-lib';

const Animal = () => {

    const screenWidth = Dimensions.get('window').width;

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
                setAnimal({ id: doc.id, ...doc.data() });
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

    return (
        <View>
            {!isLoading ? (
                <View style={{ flex: 1, justifyContent: 'center', alignContent: 'center' }}>
                    <LoaderScreen message={'Gathering information now...'} color="gray" />
                </View>
            ) : (
                <View>
                    <Text>Bananna</Text>
                </View>
            )}
        </View>
    )
}

export default Animal
