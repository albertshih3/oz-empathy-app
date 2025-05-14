import { View, Text, Dimensions, FlatList, ActivityIndicator, useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { Card } from 'react-native-ui-lib';
import firestore, { FirebaseFirestoreTypes } from '@react-native-firebase/firestore';
import { router } from 'expo-router';
import React from 'react';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

interface Animal {
    id: string;
    name: string;
    photo: string;
    class: string;
    order: string;
    family: string;
    genus: string;
    location: string[] | string;
}

const California = () => {
    const [animals, setAnimals] = useState<Animal[]>([]);
    const [loading, setLoading] = useState(true);
    const [lastVisible, setLastVisible] = useState<FirebaseFirestoreTypes.QueryDocumentSnapshot | null>(null);
    const pageSize = 10;
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    const screenWidth = Dimensions.get('window').width;

    useEffect(() => {
        const fetchAnimals = async () => {
            setLoading(true);
            try {
                // Get all animals first, then filter and sort in memory
                // This avoids the need for a composite index
                const animalsRef = firestore().collection('animals');
                const snapshot = await animalsRef.get();

                if (!snapshot.empty) {
                    const allAnimals = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Animal[];

                    // Filter animals in CA Trail location - handle both array and string formats
                    const caTrailAnimals = allAnimals.filter(animal => {
                        if (!animal.location) return false;

                        // Handle array format
                        if (Array.isArray(animal.location)) {
                            return animal.location.some(loc =>
                                loc === 'CA Trail' || loc.toLowerCase() === 'ca trail'
                            );
                        }

                        // Handle string format
                        return animal.location === 'CA Trail' || animal.location === 'ca trail';
                    });

                    // Sort by name
                    const sortedAnimals = caTrailAnimals.sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );

                    // Only take the first page
                    const firstPage = sortedAnimals.slice(0, pageSize);

                    setAnimals(firstPage);

                    // Set the last visible item for pagination
                    if (sortedAnimals.length > pageSize) {
                        // We need to find the document that corresponds to the last item in our page
                        const lastItem = firstPage[firstPage.length - 1];
                        const lastDocSnapshot = snapshot.docs.find(doc => doc.id === lastItem.id);
                        if (lastDocSnapshot) {
                            setLastVisible(lastDocSnapshot);
                        }
                    }
                } else {
                    setAnimals([]);
                }
            } catch (error) {
                console.error("Error fetching animals: ", error);
            } finally {
                setLoading(false);
            }
        };

        fetchAnimals();
    }, []);

    const fetchMoreAnimals = async () => {
        if (!lastVisible || loading || animals.length === 0) return;

        setLoading(true);
        try {
            // Get all animals first (no index required)
            const animalsRef = firestore().collection('animals');
            const snapshot = await animalsRef.get();

            if (!snapshot.empty) {
                const allAnimals = snapshot.docs.map(doc => ({
                    id: doc.id,
                    ...doc.data()
                })) as Animal[];

                // Filter animals in CA Trail location - handle both array and string formats
                const caTrailAnimals = allAnimals.filter(animal => {
                    if (!animal.location) return false;

                    // Handle array format
                    if (Array.isArray(animal.location)) {
                        return animal.location.some(loc =>
                            loc === 'CA Trail' || loc.toLowerCase() === 'ca trail'
                        );
                    }

                    // Handle string format
                    return animal.location === 'CA Trail' || animal.location === 'ca trail';
                });

                // Sort by name
                const sortedAnimals = caTrailAnimals.sort((a, b) =>
                    a.name.localeCompare(b.name)
                );

                // Find index of lastVisible in the sorted array
                const lastVisibleIndex = sortedAnimals.findIndex(animal => animal.id === lastVisible.id);

                if (lastVisibleIndex !== -1 && lastVisibleIndex + 1 < sortedAnimals.length) {
                    // Get next page of animals
                    const nextPage = sortedAnimals.slice(lastVisibleIndex + 1, lastVisibleIndex + 1 + pageSize);

                    // Set new animals
                    setAnimals(prev => [...prev, ...nextPage]);

                    // Set new lastVisible if there are more animals
                    if (lastVisibleIndex + 1 + pageSize < sortedAnimals.length) {
                        const newLastItem = nextPage[nextPage.length - 1];
                        const newLastDocSnapshot = snapshot.docs.find(doc => doc.id === newLastItem.id);
                        if (newLastDocSnapshot) {
                            setLastVisible(newLastDocSnapshot);
                        }
                    } else {
                        // No more items
                        setLastVisible(null);
                    }
                } else {
                    // No more items
                    setLastVisible(null);
                }
            }
        } catch (error) {
            console.error("Error fetching more animals: ", error);
        } finally {
            setLoading(false);
        }
    };

    const renderAnimalCard = ({ item }: { item: Animal }) => (
        <Card
            style={[
                styles.card,
                { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#ffffff' }
            ]}
            onPress={() => router.push({
                pathname: "/(animal)/[animal]",
                params: { id: item.id }
            })}
        >
            <Card.Section
                imageSource={item.photo ? { uri: item.photo } : require('../../assets/images/home/cat.png')}
                imageStyle={styles.cardImage}
            />
            <View style={styles.cardContent}>
                <ThemedText style={styles.cardTitle}>{item.name}</ThemedText>
                <ThemedText style={styles.cardSubtitle}>{item.genus}</ThemedText>
            </View>
        </Card>
    );

    if (loading && animals.length === 0) {
        return (
            <ThemedView style={styles.loaderContainer}>
                <ActivityIndicator size="large" color={Colors[theme].tint} />
                <ThemedText style={styles.loadingText}>Loading animals...</ThemedText>
            </ThemedView>
        );
    }

    return (
        <ThemedView style={styles.container}>
            <FlatList
                data={animals}
                renderItem={renderAnimalCard}
                keyExtractor={item => item.id}
                onEndReached={fetchMoreAnimals}
                onEndReachedThreshold={0.5}
                numColumns={screenWidth > 768 ? 2 : 1}
                contentContainerStyle={styles.listContent}
                ListFooterComponent={
                    loading ?
                    <ActivityIndicator
                        size="large"
                        color={Colors[theme].tint}
                        style={styles.footerLoader}
                    /> : null
                }
                ListEmptyComponent={
                    <ThemedView style={styles.emptyContainer}>
                        <ThemedText style={styles.emptyText}>No animals found in California Trail.</ThemedText>
                    </ThemedView>
                }
            />
        </ThemedView>
    );
};

const styles = {
    container: {
        flex: 1,
    },
    loaderContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    loadingText: {
        marginTop: 10,
        fontSize: 16,
    },
    listContent: {
        padding: 10,
    },
    card: {
        flex: 1,
        margin: 10,
        borderRadius: 12,
        overflow: 'hidden',
    },
    cardImage: {
        height: 170,
        width: '100%',
    },
    cardContent: {
        padding: 16,
    },
    cardTitle: {
        fontSize: 18,
        fontWeight: 'bold',
    },
    cardSubtitle: {
        fontSize: 14,
        marginTop: 4,
        opacity: 0.7,
    },
    footerLoader: {
        marginVertical: 20,
    },
    emptyContainer: {
        flex: 1,
        padding: 20,
        alignItems: 'center',
        justifyContent: 'center',
    },
    emptyText: {
        fontSize: 16,
        textAlign: 'center',
    },
};

export default California;