import { View, Text, Dimensions, Platform, StyleSheet, StatusBar, ScrollView, useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, useNavigation } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import React from 'react';
import { LoaderScreen, TouchableOpacity, Chip } from 'react-native-ui-lib';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Constants, Spacings, Image, Colors as UIColors, Card } from 'react-native-ui-lib';
import { Colors } from '../../constants/Colors';
import Carousel, { ICarouselInstance } from 'react-native-reanimated-carousel';
import { Pagination } from 'react-native-reanimated-carousel';
import Animated, { useSharedValue, FadeIn, FadeInDown } from "react-native-reanimated";
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { Ionicons, MaterialCommunityIcons, Feather, FontAwesome5 } from '@expo/vector-icons';
import LifespanDialog from './LifespanModal';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';
import FavoriteButton from '../../components/FavoriteButton';
import { getAnimal } from '../../src/firebase/animalCache';
import { useConnection } from '../../src/utils/ConnectionManager';

const Animal = () => {
    const screenWidth = Dimensions.get('window').width;
    const imageWidth = screenWidth > 768 ? screenWidth * 1 : 450;
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';
    const isDark = colorScheme === 'dark';

    const { id }: { id?: string } = useLocalSearchParams();
    const navigation = useNavigation();
    const [animal, setAnimal] = useState<any>({});
    const [isLoading, setIsLoading] = useState(true);
    const [isLifespanDialogVisible, setIsLifespanDialogVisible] = useState(false);
    const [expandedInfoCard, setExpandedInfoCard] = useState<string | null>(null);
    const [error, setError] = useState<string | null>(null);
    const { isConnected } = useConnection();

    useEffect(() => {
        const fetchAnimal = async () => {
            setIsLoading(true);
            setError(null);
            
            try {
                // Use the new getAnimal function which works offline
                const animalData = await getAnimal(id || '');
                
                if (animalData) {
                    setAnimal(animalData);
                } else {
                    // If we couldn't get the animal data from cache or Firestore
                    setError('Could not find animal information');
                    console.log("No such animal data found");
                }
            } catch (err) {
                console.error("Error fetching animal:", err);
                setError('Failed to load animal information');
            } finally {
                setIsLoading(false);
            }
        };

        if (id) {
            fetchAnimal();
        } else {
            setError('Missing animal ID');
            setIsLoading(false);
        }
    }, [id]);

    useEffect(() => {
        if (animal.name) {
            const headerLeft = Platform.OS === 'ios' ? () => (
                <TouchableOpacity onPress={() => navigation.goBack()}>
                    <Text style={{ marginLeft: 15, fontSize: 16 }}>Back</Text>
                </TouchableOpacity>
            ) : undefined;

            navigation.setOptions({ 
                title: `${animal.name}`, 
                headerLeft: headerLeft,
                headerShown: false // Hide header for the parallax effect
            });
        } else {
            navigation.setOptions({ title: "Loading...", headerBackVisible: true });
        }
    }, [animal, navigation]);

    type PersonalItem = {
        photourl: string;
        name: string;
        title: string;
        id: string;
        docid: string;
        image: { uri: string }
        description: string;
        onPress: () => void;
    };

    const cards = animal.personal ? animal.personal.map((item: any) => ({
        image: { uri: item.photourl || '' },
        title: item.name || '',
        description: item.id || '',
        docid: item.docid || '',
        photourl: item.photourl || '',
    })) : [];

    const ref = React.useRef<ICarouselInstance>(null);
    const progress = useSharedValue<number>(0);

    const onPressPagination = (index: number) => {
        ref.current?.scrollTo({
            count: index - progress.value,
            animated: true,
        });
    };

    const toggleInfoCard = (cardName: string) => {
        setExpandedInfoCard(expandedInfoCard === cardName ? null : cardName);
    };

    const renderAnimalHeaderImage = () => (
        <View style={styles.headerContainer}>
            <Image 
                source={require('../../assets/images/home/welcome.png')}
                style={styles.headerImage}
                resizeMode="cover"
            />
            <View style={styles.headerOverlay}>
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <Ionicons name="chevron-back" size={24} color="white" />
                </TouchableOpacity>
                <View style={styles.headerTitleRow}>
                    <ThemedText type="title" style={styles.headerTitle}>
                        {animal.name}
                    </ThemedText>
                    <FavoriteButton 
                        animalId={id || ''}
                        animalName={animal.name || ''}
                        style={styles.favoriteButton}
                    />
                </View>
                <View style={styles.taxonomyContainer}>
                    {animal.class && (
                        <Chip 
                            label={animal.class} 
                            containerStyle={styles.taxonomyChip}
                            labelStyle={styles.taxonomyLabel}
                        />
                    )}
                    {animal.order && (
                        <Chip 
                            label={animal.order} 
                            containerStyle={styles.taxonomyChip}
                            labelStyle={styles.taxonomyLabel}
                        />
                    )}
                    {animal.family && (
                        <Chip 
                            label={animal.family} 
                            containerStyle={styles.taxonomyChip}
                            labelStyle={styles.taxonomyLabel}
                        />
                    )}
                </View>
            </View>
        </View>
    );

    const renderCarouselItem = ({ item }: { item: any }) => (
        <View style={styles.carouselItemContainer}>
            <Card
                enableShadow
                elevation={4}
                style={[styles.individualCard, { backgroundColor: isDark ? '#2C2C2E' : 'white' }]}
                onPress={() => router.navigate({
                    pathname: '/(detail)/[detail]',
                    params: { id: item.docid, other: `${id}` }
                })}
            >
                <Card.Section
                    content={[
                        {
                            text: item.title,
                            text50BO: true,
                            style: {
                                marginBottom: 6,
                                color: isDark ? Colors[theme].text : undefined
                            }
                        },
                        {
                            text: item.description,
                            text70: true,
                            style: {
                                color: isDark ? Colors[theme].text : undefined
                            }
                        }
                    ]}
                    style={styles.individualCardContent}
                />
                <View style={[styles.cardOverlay, {
                    backgroundColor: isDark ? 'rgba(60, 60, 67, 0.9)' : 'rgba(255,255,255,0.9)'
                }]}>
                    <Feather name="chevron-right" size={24} color={Colors[theme].tint} />
                </View>
            </Card>
        </View>
    );

    if (isLoading) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <StatusBar translucent backgroundColor="transparent" />
                <LoaderScreen message={'Loading animal information...'} color={Colors.blue30} />
            </ThemedView>
        );
    }
    
    if (error) {
        return (
            <ThemedView style={styles.loadingContainer}>
                <StatusBar translucent backgroundColor="transparent" />
                <ThemedText style={styles.errorMessage}>{error}</ThemedText>
                {!isConnected && (
                    <ThemedText style={[
                        styles.offlineMessage,
                        { color: isDark ? '#A9A9A9' : UIColors.dark40 }
                    ]}>
                        You are currently offline. If this is your first time viewing this animal,
                        you'll need to connect to the internet at least once to download its information.
                    </ThemedText>
                )}
                <TouchableOpacity
                    style={[
                        styles.retryButton,
                        { backgroundColor: Colors[theme].tint }
                    ]}
                    onPress={() => navigation.goBack()}
                >
                    <ThemedText style={styles.retryButtonText}>Go Back</ThemedText>
                </TouchableOpacity>
            </ThemedView>
        );
    }

    return (
        <GestureHandlerRootView style={styles.container}>
            <StatusBar translucent backgroundColor="transparent" />
            <ScrollView
                style={styles.container}
                contentContainerStyle={styles.scrollContent}
                showsVerticalScrollIndicator={false}
                bounces={true}
            >
                {renderAnimalHeaderImage()}
                <ThemedView style={styles.mainContent}>
                    {/* Individual Animals Carousel */}
                    <View>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            Individual Animals
                        </ThemedText>
                        <ThemedText style={[
                            styles.sectionDescription,
                            { color: isDark ? '#A9A9A9' : UIColors.dark40 }
                        ]}>
                            Select an animal below to view their personal profile
                        </ThemedText>
                    </View>

                    <View style={styles.carouselContainer}>
                        <Carousel
                            ref={ref}
                            data={cards}
                            renderItem={renderCarouselItem}
                            width={screenWidth * 0.9}
                            height={200}
                            autoPlay={false}
                            mode="parallax"
                            modeConfig={{
                                parallaxScrollingScale: 0.95,
                                parallaxScrollingOffset: 40,
                            }}
                            scrollAnimationDuration={500}
                            onProgressChange={progress}
                            loop={false}
                            enabled={cards.length > 1}
                            style={styles.carousel}
                        />
                    </View>

                    {/* Species Information Section */}
                    <View>
                        <ThemedText type="subtitle" style={styles.sectionTitle}>
                            Species Information
                        </ThemedText>
                    </View>

                    <View style={styles.speciesInfoCards}>
                        <TouchableOpacity
                            style={[
                                styles.infoCard,
                                expandedInfoCard === 'diet' && styles.expandedInfoCard,
                                { backgroundColor: isDark ? '#2C2C2E' : 'white' }
                            ]}
                            onPress={() => toggleInfoCard('diet')}
                            activeOpacity={0.9}
                        >
                            <View style={styles.infoCardHeader}>
                                <FontAwesome5 name="utensils" size={20} color={Colors[theme].tint} />
                                <ThemedText type="defaultSemiBold" style={styles.infoCardTitle}>Diet</ThemedText>
                                <Ionicons
                                    name={expandedInfoCard === 'diet' ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={isDark ? '#A9A9A9' : UIColors.dark40}
                                    style={styles.expandIcon}
                                />
                            </View>
                            {expandedInfoCard === 'diet' ? (
                                <View style={styles.expandedContent}>
                                    <ThemedText>{animal.diet || 'Information not available'}</ThemedText>
                                    <TouchableOpacity
                                        style={styles.learnMoreButton}
                                        onPress={() => router.navigate('/(animal)/diet')}
                                    >
                                        <ThemedText type="link">Learn more about animal diets</ThemedText>
                                    </TouchableOpacity>
                                </View>
                            ) : (
                                <ThemedText
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style={[
                                        styles.infoCardSummary,
                                        { color: isDark ? '#A9A9A9' : UIColors.dark30 }
                                    ]}
                                >
                                    {animal.diet || 'Not available'}
                                </ThemedText>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.infoCard,
                                expandedInfoCard === 'lifespan' && styles.expandedInfoCard,
                                { backgroundColor: isDark ? '#2C2C2E' : 'white' }
                            ]}
                            onPress={() => toggleInfoCard('lifespan')}
                            activeOpacity={0.9}
                        >
                            <View style={styles.infoCardHeader}>
                                <MaterialCommunityIcons name="timer-outline" size={22} color={Colors[theme].tint} />
                                <ThemedText type="defaultSemiBold" style={styles.infoCardTitle}>Lifespan</ThemedText>
                                <TouchableOpacity
                                    style={styles.infoButton}
                                    onPress={() => setIsLifespanDialogVisible(true)}
                                >
                                    <MaterialCommunityIcons name="information-outline" size={20} color={Colors[theme].tint} />
                                </TouchableOpacity>
                                <Ionicons
                                    name={expandedInfoCard === 'lifespan' ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={isDark ? '#A9A9A9' : UIColors.dark40}
                                    style={styles.expandIcon}
                                />
                            </View>
                            {expandedInfoCard === 'lifespan' ? (
                                <View style={styles.expandedContent}>
                                    <ThemedText>In the wild: {animal.lifespan || 'Not available'}</ThemedText>
                                    <ThemedText>In captivity: {animal.lifespan_cap || 'Not available'}</ThemedText>
                                </View>
                            ) : (
                                <ThemedText
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style={[
                                        styles.infoCardSummary,
                                        { color: isDark ? '#A9A9A9' : UIColors.dark30 }
                                    ]}
                                >
                                    {animal.lifespan || 'Not available'}
                                </ThemedText>
                            )}
                        </TouchableOpacity>

                        <TouchableOpacity
                            style={[
                                styles.infoCard,
                                expandedInfoCard === 'range' && styles.expandedInfoCard,
                                { backgroundColor: isDark ? '#2C2C2E' : 'white' }
                            ]}
                            onPress={() => toggleInfoCard('range')}
                            activeOpacity={0.9}
                        >
                            <View style={styles.infoCardHeader}>
                                <Ionicons name="map-outline" size={20} color={Colors[theme].tint} />
                                <ThemedText type="defaultSemiBold" style={styles.infoCardTitle}>Range</ThemedText>
                                <Ionicons
                                    name={expandedInfoCard === 'range' ? "chevron-up" : "chevron-down"}
                                    size={20}
                                    color={isDark ? '#A9A9A9' : UIColors.dark40}
                                    style={styles.expandIcon}
                                />
                            </View>
                            {expandedInfoCard === 'range' ? (
                                <View style={styles.expandedContent}>
                                    <ThemedText>{animal.range || 'Not available'}</ThemedText>
                                </View>
                            ) : (
                                <ThemedText
                                    numberOfLines={1}
                                    ellipsizeMode="tail"
                                    style={[
                                        styles.infoCardSummary,
                                        { color: isDark ? '#A9A9A9' : UIColors.dark30 }
                                    ]}
                                >
                                    {animal.range || 'Not available'}
                                </ThemedText>
                            )}
                        </TouchableOpacity>
                    </View>
                </ThemedView>
            </ScrollView>

            <LifespanDialog
                isVisible={isLifespanDialogVisible}
                onClose={() => setIsLifespanDialogVisible(false)}
                lifespan={animal.lifespan}
                lifespanCap={animal.lifespan_cap}
                animalName={animal.name}
            />
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollContent: {
        flexGrow: 1,
    },
    loadingContainer: {
        flex: 1,
        justifyContent: 'center',
        alignItems: 'center',
    },
    headerContainer: {
        width: '100%',
        height: 250,
        position: 'relative',
    },
    headerImage: {
        width: '100%',
        height: 250,
    },
    headerOverlay: {
        position: 'absolute',
        bottom: 0,
        left: 0,
        right: 0,
        backgroundColor: 'rgba(0,0,0,0.6)', // Darker for better contrast
        paddingHorizontal: 16,
        paddingBottom: 16,
        paddingTop: 16,
    },
    backButton: {
        position: 'absolute',
        top: -120,
        left: 16,
        zIndex: 10,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        backgroundColor: 'rgba(0,0,0,0.6)', // Darker for better contrast
    },
    headerTitleRow: {
        flexDirection: 'row',
        alignItems: 'center',
        justifyContent: 'space-between',
        marginBottom: 8,
    },
    headerTitle: {
        color: 'white',
        flex: 1,
    },
    favoriteButton: {
        marginLeft: 10,
        backgroundColor: 'rgba(255,255,255,0.3)', // Improved contrast
    },
    taxonomyContainer: {
        flexDirection: 'row',
        flexWrap: 'wrap',
        gap: 8,
    },
    taxonomyChip: {
        backgroundColor: 'rgba(255,255,255,0.3)', // Improved contrast
        borderWidth: 0,
    },
    taxonomyLabel: {
        color: 'white',
        fontSize: 12,
        fontWeight: '500', // Slightly bolder for better readability
    },
    mainContent: {
        padding: 20,
    },
    sectionTitle: {
        marginBottom: 8,
    },
    sectionDescription: {
        marginBottom: 16,
    },
    carouselContainer: {
        alignItems: 'center',
        marginVertical: 16,
    },
    carousel: {
        overflow: 'visible',
    },
    carouselItemContainer: {
        flex: 1,
        padding: 8,
    },
    individualCard: {
        flex: 1,
        borderRadius: 12,
        overflow: 'hidden',
    },
    individualCardContent: {
        padding: 20,
        justifyContent: 'center',
        minHeight: 130,
    },
    cardOverlay: {
        position: 'absolute',
        right: 15,
        bottom: 15,
        width: 40,
        height: 40,
        borderRadius: 20,
        justifyContent: 'center',
        alignItems: 'center',
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    speciesInfoCards: {
        gap: 16,
        marginBottom: 30,
    },
    infoCard: {
        borderRadius: 12,
        padding: 16,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 3,
        elevation: 2,
    },
    expandedInfoCard: {
        minHeight: 120,
    },
    infoCardHeader: {
        flexDirection: 'row',
        alignItems: 'center',
        marginBottom: 10,
    },
    infoCardTitle: {
        marginLeft: 10,
        flex: 1,
    },
    infoButton: {
        marginRight: 8,
    },
    expandIcon: {
        marginLeft: 'auto',
    },
    infoCardSummary: {
        // Color is now dynamically set based on theme
    },
    expandedContent: {
        marginTop: 8,
        gap: 8,
    },
    learnMoreButton: {
        marginTop: 8,
    },
    errorMessage: {
        fontSize: 18,
        marginBottom: 20,
        textAlign: 'center',
        padding: 20,
    },
    offlineMessage: {
        fontSize: 14,
        marginBottom: 30,
        textAlign: 'center',
    },
    retryButton: {
        backgroundColor: UIColors.blue30, // Using UI Colors for consistency
        paddingVertical: 12,
        paddingHorizontal: 24,
        borderRadius: 8,
        alignSelf: 'center',
    },
    retryButtonText: {
        color: 'white',
        fontWeight: 'bold',
    },
});

export default Animal;
