import React, { useState, useEffect } from 'react';
import { StyleSheet, ScrollView, Text, View, TouchableOpacity, Dimensions, TextInput, ActivityIndicator, useColorScheme } from 'react-native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Incubator, Constants, Colors as UIColors, Card, Image, Button } from 'react-native-ui-lib';
import Carousel from 'react-native-reanimated-carousel';
import { useSharedValue } from "react-native-reanimated";
import { router } from 'expo-router';
import { FontAwesome, MaterialCommunityIcons } from '@expo/vector-icons';
import { LinearGradient } from 'expo-linear-gradient';
import { useConnection } from '../../src/utils/ConnectionManager';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

const { Toast } = Incubator;

const Home = () => {
    const [searchQuery, setSearchQuery] = useState('');
    const screenWidth = Dimensions.get('window').width;
    const progress = useSharedValue<number>(0);
    const { isDownloadingAnimals, isConnected } = useConnection();
    const colorScheme = useColorScheme();
    const theme = colorScheme === 'dark' ? 'dark' : 'light';

    // Handle search submission
    const handleSearch = () => {
        if (searchQuery.trim()) {
            // Navigate to search screen and pass the query
            router.push({
                pathname: 'search',
                params: { query: searchQuery }
            });
        }
    };

    // Info cards for the carousel
    const featuredCards = [
        { 
            image: require('../../assets/images/home/welcome.png'), 
            title: 'Welcome to the Empathy Guide', 
            description: 'Explore the Oakland Zoo and learn about our animals', 
            onPress: () => router.push('welcome'),
            color: ['#0a7ea4', '#0a9ea4']
        },
        { 
            image: require('../../assets/images/home/empathy.png'), 
            title: 'Learn About Empathy', 
            description: 'Discover why empathy matters for wildlife conservation', 
            onPress: () => router.push('learn'),
            color: ['#4a8f29', '#6aaf49']
        },
        { 
            image: require('../../assets/images/home/resources.png'), 
            title: 'Resources', 
            description: 'Access guides and educational materials', 
            onPress: () => router.push('resources'),
            color: ['#8c4bab', '#ac6bcb']
        }
    ];

    // Zoo sections
    const zooSections = [
        {
            name: 'California Trail',
            image: require('../../assets/images/home/cat.png'),
            route: 'cat',
            color: '#0a7ea4'
        },
        {
            name: 'African Savanna',
            image: require('../../assets/images/home/africa.png'),
            route: 'africa',
            color: '#e67e22'
        },
        {
            name: 'Children\'s Zoo',
            image: require('../../assets/images/home/children.png'),
            route: 'cz',
            color: '#16a085'
        },
        {
            name: 'Tropical Rainforest',
            image: require('../../assets/images/home/rainforest.png'),
            route: 'rainforest',
            color: '#27ae60'
        },
        {
            name: 'Wild Australia',
            image: require('../../assets/images/home/train.png'),
            route: 'australia',
            color: '#d35400'
        }
    ];

    return (
        <GestureHandlerRootView style={styles.container}>
            <ThemedView style={styles.container}>
                <ScrollView 
                    style={styles.scrollView}
                    contentContainerStyle={styles.scrollContent}
                    showsVerticalScrollIndicator={false}
                >
                    {/* Header Section with Search */}
                    <View style={styles.header}>
                        <ThemedText style={styles.headerTitle}>Oakland Zoo</ThemedText>
                        <ThemedText style={styles.headerSubtitle}>Empathy Guide</ThemedText>
                        
                        <View style={styles.searchContainer}>
                            <TextInput
                                style={[
                                    styles.searchInput, 
                                    { 
                                        backgroundColor: colorScheme === 'dark' ? '#333' : '#fff',
                                        color: colorScheme === 'dark' ? '#fff' : '#000',
                                    }
                                ]}
                                placeholder="Search for an animal..."
                                placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
                                value={searchQuery}
                                onChangeText={setSearchQuery}
                                onSubmitEditing={handleSearch}
                            />
                            <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
                                <FontAwesome name="search" size={18} color="#fff" />
                            </TouchableOpacity>
                        </View>
                    </View>

                    {/* Featured Content Carousel */}
                    <View style={styles.carouselContainer}>
                        <Carousel
                            data={featuredCards}
                            renderItem={({ item, index }) => (
                                <TouchableOpacity 
                                    key={index} 
                                    style={styles.carouselItem} 
                                    onPress={item.onPress}
                                    activeOpacity={0.9}
                                >
                                    <LinearGradient
                                        colors={item.color}
                                        style={styles.carouselGradient}
                                    >
                                        <Image
                                            source={item.image}
                                            style={styles.carouselImage}
                                            resizeMode="cover"
                                        />
                                        <View style={styles.carouselContent}>
                                            <Text style={styles.carouselTitle}>{item.title}</Text>
                                            <Text style={styles.carouselDescription}>{item.description}</Text>
                                        </View>
                                    </LinearGradient>
                                </TouchableOpacity>
                            )}
                            width={screenWidth}
                            height={200}
                            autoPlay={true}
                            autoPlayInterval={6000}
                            scrollAnimationDuration={1000}
                            onProgressChange={progress}
                            loop
                            pagingEnabled
                        />
                    </View>

                    {/* Section Title */}
                    <View style={styles.sectionTitleContainer}>
                        <ThemedText style={styles.sectionTitle}>Explore the Zoo</ThemedText>
                        <View style={styles.sectionTitleLine} />
                    </View>

                    {/* Quick Search Button */}
                    <TouchableOpacity
                        style={styles.quickSearchButton}
                        onPress={() => router.push('search')}
                        activeOpacity={0.8}
                    >
                        <FontAwesome name="search" size={20} color="#fff" style={styles.quickSearchIcon} />
                        <Text style={styles.quickSearchText}>Search All Animals</Text>
                    </TouchableOpacity>

                    {/* Favorites Button */}
                    <TouchableOpacity
                        style={[styles.quickSearchButton, styles.favoritesButton]}
                        onPress={() => router.push('favorites')}
                        activeOpacity={0.8}
                    >
                        <FontAwesome name="heart" size={20} color="#fff" style={styles.quickSearchIcon} />
                        <Text style={styles.quickSearchText}>View Favorites</Text>
                    </TouchableOpacity>
                    
                    {/* Offline Data Status */}
                    {isDownloadingAnimals && (
                        <View style={styles.offlineStatusContainer}>
                            <ActivityIndicator size="small" color={Colors[theme].tint} style={styles.offlineStatusIcon} />
                            <ThemedText style={styles.offlineStatusText}>Downloading animal data for offline use...</ThemedText>
                        </View>
                    )}
                    
                    {!isConnected && (
                        <View style={styles.offlineStatusContainer}>
                            <MaterialCommunityIcons name="wifi-off" size={20} color={UIColors.orange30} style={styles.offlineStatusIcon} />
                            <ThemedText style={styles.offlineStatusText}>You're offline. Some features may be limited.</ThemedText>
                        </View>
                    )}

                    {/* Zoo Sections */}
                    <View style={styles.zooSectionsContainer}>
                        {zooSections.map((section, index) => (
                            <TouchableOpacity
                                key={index}
                                style={[
                                    styles.zooSectionCard,
                                    { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#fff' }
                                ]}
                                onPress={() => router.push(section.route)}
                                activeOpacity={0.7}
                            >
                                <View style={[styles.zooSectionImageContainer, { backgroundColor: section.color }]}>
                                    <Image
                                        source={section.image}
                                        style={styles.zooSectionImage}
                                        resizeMode="cover"
                                    />
                                </View>
                                <ThemedText style={styles.zooSectionName}>{section.name}</ThemedText>
                            </TouchableOpacity>
                        ))}
                    </View>
                </ScrollView>
            </ThemedView>
        </GestureHandlerRootView>
    );
};

const styles = StyleSheet.create({
    container: {
        flex: 1,
    },
    scrollView: {
        flex: 1,
    },
    scrollContent: {
        paddingBottom: 30,
    },
    header: {
        paddingTop: 16,
        paddingHorizontal: 16,
        paddingBottom: 20,
        backgroundColor: '#0a7ea4',
    },
    headerTitle: {
        fontSize: 26,
        fontWeight: 'bold',
        color: '#fff',
        textAlign: 'center',
        marginTop: 50,
    },
    headerSubtitle: {
        fontSize: 16,
        color: 'rgba(255, 255, 255, 0.9)',
        textAlign: 'center',
        marginBottom: 16,
    },
    searchContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        marginTop: 8,
        marginBottom: 8,
    },
    searchInput: {
        flex: 1,
        height: 44,
        paddingHorizontal: 16,
        borderRadius: 8,
        fontSize: 16,
    },
    searchButton: {
        width: 44,
        height: 44,
        backgroundColor: '#127fa2',
        borderRadius: 8,
        marginLeft: 8,
        justifyContent: 'center',
        alignItems: 'center',
    },
    carouselContainer: {
        width: '100%',
    },
    carouselItem: {
        borderRadius: 0,
        overflow: 'hidden',
        elevation: 4,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 2 },
        shadowOpacity: 0.1,
        shadowRadius: 4,
        height: 200,
    },
    carouselGradient: {
        flex: 1,
        flexDirection: 'row',
        alignItems: 'center',
        padding: 24,
        height: '100%',
    },
    carouselImage: {
        width: 100,
        height: 100,
        borderRadius: 8,
    },
    carouselContent: {
        flex: 1,
        marginLeft: 16,
    },
    carouselTitle: {
        fontSize: 18,
        fontWeight: 'bold',
        color: '#fff',
        marginBottom: 4,
    },
    carouselDescription: {
        fontSize: 14,
        color: 'rgba(255, 255, 255, 0.9)',
    },
    sectionTitleContainer: {
        marginTop: 24,
        marginBottom: 16,
        paddingHorizontal: 16,
    },
    sectionTitle: {
        fontSize: 20,
        fontWeight: 'bold',
    },
    sectionTitleLine: {
        height: 3,
        width: 40,
        backgroundColor: '#0a7ea4',
        marginTop: 6,
    },
    zooSectionsContainer: {
        paddingHorizontal: 16,
        flexDirection: 'row',
        flexWrap: 'wrap',
        justifyContent: 'space-between',
    },
    zooSectionCard: {
        width: '48%',
        marginBottom: 16,
        borderRadius: 12,
        overflow: 'hidden',
        elevation: 2,
        shadowColor: '#000',
        shadowOffset: { width: 0, height: 1 },
        shadowOpacity: 0.1,
        shadowRadius: 2,
    },
    zooSectionImageContainer: {
        height: 100,
        justifyContent: 'center',
        alignItems: 'center',
    },
    zooSectionImage: {
        width: '100%',
        height: '100%',
    },
    zooSectionName: {
        fontSize: 15,
        fontWeight: '600',
        textAlign: 'center',
        paddingVertical: 12,
    },
    quickSearchButton: {
        marginHorizontal: 16,
        marginTop: 8,
        marginBottom: 2,
        padding: 16,
        backgroundColor: '#0a7ea4',
        borderRadius: 12,
        flexDirection: 'row',
        justifyContent: 'center',
        alignItems: 'center',
    },
    quickSearchIcon: {
        marginRight: 8,
    },
    quickSearchText: {
        color: '#fff',
        fontSize: 16,
        fontWeight: '600',
        marginLeft: 10,
    },
    favoritesButton: {
        backgroundColor: '#e25950',
        marginTop: 12,
        marginBottom: 12,
    },
    offlineStatusContainer: {
        flexDirection: 'row',
        alignItems: 'center',
        borderRadius: 8,
        paddingVertical: 10,
        paddingHorizontal: 16,
        marginHorizontal: 16,
        marginTop: 12,
        marginBottom: 12,
        borderWidth: 1,
        borderColor: '#e0e0e0',
    },
    offlineStatusIcon: {
        marginRight: 8,
    },
    offlineStatusText: {
        fontSize: 14,
        flex: 1,
    },
});

export default Home;