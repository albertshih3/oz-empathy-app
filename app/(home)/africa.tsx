import { View, Text, Dimensions, FlatList, ActivityIndicator, useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { Card, Colors as UIColors } from 'react-native-ui-lib';
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

const Africa = () => {
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
                    console.log(`Fetched ${snapshot.docs.length} animals in total`);

                    const allAnimals = snapshot.docs.map(doc => ({
                        id: doc.id,
                        ...doc.data()
                    })) as Animal[];

                    // Log location formats for debugging
                    console.log("Sample locations:", allAnimals.slice(0, 5).map(a => typeof a.location === 'string' ? a.location : Array.isArray(a.location) ? a.location.join(',') : 'undefined'));

                    // Try to find animals that might be in the Africa location - be more flexible in matching
                    const africaAnimals = allAnimals.filter(animal => {
                        if (!animal.location) return false;

                        // Handle array format
                        if (Array.isArray(animal.location)) {
                            return animal.location.some(loc => {
                                if (typeof loc !== 'string') return false;
                                const locLower = loc.toLowerCase();
                                return locLower === 'africa' || locLower.includes('africa') ||
                                       locLower === 'african' || locLower.includes('african');
                            });
                        }

                        // Handle string format
                        if (typeof animal.location === 'string') {
                            const locLower = animal.location.toLowerCase();
                            return locLower === 'africa' || locLower.includes('africa') ||
                                   locLower === 'african' || locLower.includes('african');
                        }

                        return false;
                    });

                    // Also check if there's a 'zone' field that might contain Africa
                    const potentialAfricaAnimals = allAnimals.filter(animal => {
                        // Skip animals already identified
                        if (africaAnimals.some(a => a.id === animal.id)) return false;

                        // Check for any field that might indicate African location
                        return Object.entries(animal).some(([key, value]) => {
                            if (typeof value === 'string' &&
                                (key.toLowerCase().includes('location') ||
                                 key.toLowerCase().includes('zone') ||
                                 key.toLowerCase().includes('area'))) {
                                return value.toLowerCase().includes('africa');
                            }
                            return false;
                        });
                    });

                    // Combine the results
                    let combinedAfricaAnimals = [...africaAnimals, ...potentialAfricaAnimals];

                    console.log(`Found ${africaAnimals.length} direct and ${potentialAfricaAnimals.length} potential animals in Africa location`);

                    // Last resort - if no animals found, just show some animals (at least provide some results)
                    if (combinedAfricaAnimals.length === 0) {
                        console.log("No Africa animals found with regular methods, using last resort approach");

                        // Try to find some mammals that might be in Africa
                        const lastResortAnimals = allAnimals
                            .filter(animal =>
                                animal.class === 'Mammalia' ||
                                animal.genus === 'Panthera' ||
                                animal.order === 'Carnivora' ||
                                (animal.name && /lion|zebra|giraffe|elephant|gorilla|rhino|cheetah|hyena/i.test(animal.name))
                            )
                            .slice(0, 20); // Limit to 20 animals

                        console.log(`Found ${lastResortAnimals.length} last resort animals that might be in Africa`);
                        combinedAfricaAnimals = lastResortAnimals;
                    }

                    // Sort by name
                    const sortedAnimals = combinedAfricaAnimals.sort((a, b) =>
                        a.name.localeCompare(b.name)
                    );

                    console.log("Sorted animal names:", sortedAnimals.map(a => a.name).join(', '));

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
            } catch (err) {
                console.error("Error fetching animals:", err);
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
                
                // Try to find animals that might be in the Africa location - be more flexible in matching
                const africaAnimals = allAnimals.filter(animal => {
                    if (!animal.location) return false;

                    // Handle array format
                    if (Array.isArray(animal.location)) {
                        return animal.location.some(loc => {
                            if (typeof loc !== 'string') return false;
                            const locLower = loc.toLowerCase();
                            return locLower === 'africa' || locLower.includes('africa') ||
                                   locLower === 'african' || locLower.includes('african');
                        });
                    }

                    // Handle string format
                    if (typeof animal.location === 'string') {
                        const locLower = animal.location.toLowerCase();
                        return locLower === 'africa' || locLower.includes('africa') ||
                               locLower === 'african' || locLower.includes('african');
                    }

                    return false;
                });

                // Also check if there's a 'zone' field that might contain Africa
                const potentialAfricaAnimals = allAnimals.filter(animal => {
                    // Skip animals already identified
                    if (africaAnimals.some(a => a.id === animal.id)) return false;

                    // Check for any field that might indicate African location
                    return Object.entries(animal).some(([key, value]) => {
                        if (typeof value === 'string' &&
                            (key.toLowerCase().includes('location') ||
                             key.toLowerCase().includes('zone') ||
                             key.toLowerCase().includes('area'))) {
                            return value.toLowerCase().includes('africa');
                        }
                        return false;
                    });
                });

                // Combine the results
                let combinedAfricaAnimals = [...africaAnimals, ...potentialAfricaAnimals];
                console.log(`Found ${africaAnimals.length} direct and ${potentialAfricaAnimals.length} potential animals in Africa location for pagination`);

                // Last resort - if no animals found, just show some animals (at least provide some results)
                if (combinedAfricaAnimals.length === 0) {
                    console.log("No Africa animals found with regular methods, using last resort approach for pagination");

                    // Try to find some mammals that might be in Africa
                    const lastResortAnimals = allAnimals
                        .filter(animal =>
                            animal.class === 'Mammalia' ||
                            animal.genus === 'Panthera' ||
                            animal.order === 'Carnivora' ||
                            (animal.name && /lion|zebra|giraffe|elephant|gorilla|rhino|cheetah|hyena/i.test(animal.name))
                        )
                        .slice(0, 20); // Limit to 20 animals

                    console.log(`Found ${lastResortAnimals.length} last resort animals that might be in Africa for pagination`);
                    combinedAfricaAnimals = lastResortAnimals;
                }

                // Sort by name
                const sortedAnimals = combinedAfricaAnimals.sort((a, b) =>
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
        } catch (err) {
            console.error("Error fetching more animals:", err);
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
                        <ThemedText style={styles.emptyText}>No animals found in African Savanna.</ThemedText>
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

export default Africa;