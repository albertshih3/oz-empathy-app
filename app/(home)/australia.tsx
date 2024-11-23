import { View, Text, Dimensions, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Card } from 'react-native-ui-lib';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { router } from 'expo-router';

const Australia = () => {
    const [animals, setAnimals] = useState<any[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
    const pageSize = 10;

    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const fetchAnimals = async () => {
            setLoading(true);
            try {
                const animalsCollection = firestore().collection('animals').where('location', '==', 'Australia').limit(pageSize);
                const snapshot = await animalsCollection.get();
                const animalsList = [];
                for (let doc of snapshot.docs) {
                    animalsList.push({ id: doc.id, ...doc.data() });
                }
                setAnimals(animalsList);
                setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
            } catch (error) {
                console.error("Error fetching animals: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnimals();
    }, []);

    const fetchMoreAnimals = async () => {
        if (loading || !lastVisible) return;

        setLoading(true);
        try {
            const animalsCollection = firestore().collection('animals')
                .where('location', '==', 'Australia')
                .startAfter(lastVisible)
                .limit(pageSize);

            const snapshot = await animalsCollection.get();
            const newAnimals = snapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
            setAnimals(prevAnimals => [...prevAnimals, ...newAnimals]);
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        } catch (error) {
            console.error("Error fetching more animals: ", error);
        } finally {
            setLoading(false);
        }
    };
    

    return (
        <View style={{ flex: 1 }}>
            <FlatList
                data={animals}
                renderItem={({ item: animal }) => (
                    <Card key={animal.name} style={{ width: screenWidth > 768 ? '47%' : '95%', margin: 10 }} onPress={() => router.push({ pathname: '/(animal)/[animal]', params: { id: animal.id } })}>
                        <Card.Section
                            imageSource={{ uri: animal.photo }}
                            imageStyle={{ height: 200, width: screenWidth < 768 ? 425 : 565, alignSelf: "center" }}
                        />
                        <Card.Section
                            content={[
                                { text: animal.name, text60: true, $textDefault: true },
                                { text: `${animal.class} • ${animal.order} • ${animal.family} • ${animal.genus}`, text100R: true },
                            ]}
                            style={{ padding: 15 }}
                        />
                    </Card>
                )}
                keyExtractor={animal => animal.name}
                numColumns={screenWidth > 768 ? 2 : 1}
                onEndReached={fetchMoreAnimals}
                onEndReachedThreshold={0.5}
                ListFooterComponent={loading ? (
                    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center', padding: 10 }}>
                        <ActivityIndicator size="large" />
                    </View>
                ) : null}
            />
        </View>
    )
}

export default Australia
