import { View, Text, Dimensions, ScrollView, TextInput, FlatList, ActivityIndicator } from 'react-native';
import { useEffect, useState } from 'react';
import { Card } from 'react-native-ui-lib';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { Link, router } from 'expo-router';

const Search = () => {
    const [animals, setAnimals] = useState<any[]>([]); // For display
    const [allAnimals, setAllAnimals] = useState<any[]>([]); // Complete dataset
    const [searchTerm, setSearchTerm] = useState('');
    const [loading, setLoading] = useState(false);
    const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot<FirebaseFirestoreTypes.DocumentData> | null>(null);

    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth > 768 ? screenWidth * 1 : 450;
    const pageSize = 10; // Number of documents to fetch per page

    useEffect(() => {
        const fetchAnimals = async () => {
            setLoading(true);
            try {
                const animalsCollection = firestore().collection('animals').limit(pageSize);
                const snapshot = await animalsCollection.get();
                let animalsList = [];
                for (let doc of snapshot.docs) {
                    const animalData: { id: string, personal: any[] } = { id: doc.id, ...doc.data(), personal: [] };
                    const personalSnapshot = await doc.ref.collection('personal').get();
                    animalData.personal = personalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                    animalsList.push(animalData);
                }
                setAnimals(animalsList);
                setAllAnimals(animalsList); // Update the complete dataset
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
                .startAfter(lastVisible)
                .limit(pageSize);

            const snapshot = await animalsCollection.get();
            const newAnimals: { id: string; personal: any[]; }[] = [];
            for (let doc of snapshot.docs) {
                const animalData: { id: string, personal: any[] } = { id: doc.id, ...doc.data(), personal: [] };
                const personalSnapshot = await doc.ref.collection('personal').get();
                animalData.personal = personalSnapshot.docs.map(doc => ({ id: doc.id, ...doc.data() }));
                newAnimals.push(animalData);
            }
            setAnimals(prevAnimals => [...prevAnimals, ...newAnimals]);
            setAllAnimals(prevAnimals => [...prevAnimals, ...newAnimals]); // Update the complete dataset
            setLastVisible(snapshot.docs[snapshot.docs.length - 1]);
        } catch (error) {
            console.error("Error fetching more animals: ", error);
        } finally {
            setLoading(false);
        }
    };

    return (
        <>
            <View style={{ margin: 15, marginTop: 20, marginBottom: 0 }}>
                <Text style={{ fontWeight: 'bold', fontSize: 25 }}>Search by Species</Text>
                <Text style={{ fontStyle: 'italic', color: 'gray', fontSize: 15 }}>or Search by Name</Text>
            </View>
            <TextInput
                style={{
                    height: 50,
                    borderColor: 'black',
                    borderWidth: 2,
                    borderRadius: 10, // Rounded border
                    paddingLeft: 20, // Padding on the sides
                    paddingRight: 10,
                    paddingTop: 5, // More padding on the top
                    paddingBottom: 5,
                    marginTop: 15, // Add some space at the top of the page
                    marginLeft: 15, // Add some space on the left side
                    marginRight: 15, // Add some space on the right side
                    marginBottom: 15
                }}
                onChangeText={text => setSearchTerm(text)}
                value={searchTerm}
                placeholder="Search by species or by animal name"
                autoFocus={true}
            />

            <FlatList
                data={animals.filter(animal =>
                    animal.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
                    animal.personal.some((personal: any) => personal.name.toLowerCase().includes(searchTerm.toLowerCase()))
                )}
                renderItem={({ item: animal }) => (
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
            </>
    );
};

export default Search;