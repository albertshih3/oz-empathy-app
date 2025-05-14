import { View, Text, Dimensions, ScrollView, Platform, StyleSheet, TouchableOpacity, useColorScheme } from 'react-native';
import { useEffect, useState } from 'react';
import { useLocalSearchParams, Stack, useNavigation, Link } from 'expo-router';
import firestore from '@react-native-firebase/firestore';
import React from 'react';
import { LoaderScreen, Colors as UIColors } from 'react-native-ui-lib';
import { getAnimalDetail } from '../../src/firebase/animalDetail';
import { useConnection } from '../../src/utils/ConnectionManager';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Incubator, Constants, Spacings, Colors as RNUIColors, Card, Image } from 'react-native-ui-lib';
import Carousel, { ICarouselInstance, Pagination } from 'react-native-reanimated-carousel';
import { useSharedValue } from "react-native-reanimated";
import { router } from 'expo-router';
import { SafeAreaView } from 'react-native-safe-area-context';
import { StatusBar } from 'expo-status-bar';
import { Entypo, Ionicons } from '@expo/vector-icons';
import Dash from 'react-native-ui-lib';
import { BlurView } from '@react-native-community/blur';
import BirthdayModal from './BirthdayModal';
import MaterialCommunityIcons from '@expo/vector-icons/MaterialCommunityIcons';
import FavoriteButton from '../../components/FavoriteButton';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

const Details = () => {
  const [isLoading, setIsLoading] = useState(true);
  const [isBirthdayModalVisible, setIsBirthdayModalVisible] = useState(false);
  const [animal, setAnimal] = useState<any>({});
  const [error, setError] = useState<string | null>(null);
  const { id }: { id?: string } = useLocalSearchParams();
  const { other }: { other?: string } = useLocalSearchParams();
  const navigation = useNavigation();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  // Set up carousel
  const [currentIndex, setCurrentIndex] = useState(0);
  const carouselProgress = useSharedValue<number>(0);
  const screenWidth = Dimensions.get('window').width;

  // Format the birthday date
  const formatBirthday = (birthday: string) => {
    if (!birthday) return "";
    // Assuming birthday is in format YYYY-MM-DD
    const [year, month, day] = birthday.split('-');
    if (!year || !month || !day) return birthday; // Return as-is if not in expected format
    
    const date = new Date(parseInt(year), parseInt(month) - 1, parseInt(day));
    const options: Intl.DateTimeFormatOptions = { year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };
  
  // Calculate animal age from timestamp
  const calculateAnimalAge = (birthdayTimestamp: { seconds: number; nanoseconds: number }) => {
    try {
      const birthDate = new Date(birthdayTimestamp.seconds * 1000);
      const today = new Date();
      
      let age = today.getFullYear() - birthDate.getFullYear();
      const m = today.getMonth() - birthDate.getMonth();
      
      if (m < 0 || (m === 0 && today.getDate() < birthDate.getDate())) {
        age--;
      }
      
      return age;
    } catch (err) {
      console.error("Error calculating age:", err);
      return "?";
    }
  };

  useEffect(() => {
    const fetchAnimalDetail = async () => {
      setIsLoading(true);
      try {
        if (!id || !other) {
          setError("Animal ID not provided");
          setIsLoading(false);
          return;
        }

        const animalData = await getAnimalDetail(other, id);
        if (animalData) {
          console.log("Animal data:", JSON.stringify(animalData));
          
          // Check if the structure is as expected
          if (animalData.error) {
            setError(animalData.error);
            // Still set the animal data so we can display what we have
            setAnimal(animalData);
          } else {
            setAnimal(animalData);
          }
        } else {
          setError("Animal not found");
        }
      } catch (err) {
        console.error("Error fetching animal detail:", err);
        setError("Failed to load animal details");
      } finally {
        setIsLoading(false);
      }
    };

    fetchAnimalDetail();
  }, [id, other]);

  if (isLoading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoaderScreen message="Loading animal details..." color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  if (error || !animal) {
    return (
      <ThemedView style={styles.errorContainer}>
        <ThemedText style={styles.errorText}>{error || "An error occurred"}</ThemedText>
        <ThemedText style={styles.debugText}>
          ID: {id}, Other: {other}, 
          Animal Data: {JSON.stringify(animal).substring(0, 200)}...
        </ThemedText>
        <TouchableOpacity 
          onPress={() => navigation.goBack()}
          style={styles.backButton}
        >
          <ThemedText style={styles.backButtonText}>Go Back</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  // Debug content of animal object
  console.log("Animal object:", JSON.stringify(animal));

  // Check for the correct data structure and extract variables
  const animalData = animal.animal || animal;
  const personalData = animal.personalData || animalData.personalData;
  const animalSpecies = animal.name || animalData.name || '';
  const animalPhoto = personalData?.photourl || personalData?.photo || animal.photo || animalData.photo;

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemedView style={styles.container}>
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />
        
        <ScrollView 
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Header with Image and Back Button */}
          <View style={styles.header}>
            <View>
              <Image
                source={{ uri: animalPhoto || 'https://via.placeholder.com/500' }}
                style={styles.headerImage}
              />
              {personalData?.photocredit && (
                <ThemedText style={styles.photoCredit}>
                  Photo: {personalData.photocredit}
                </ThemedText>
              )}
            </View>
            
            <View style={styles.backButtonContainer}>
              <TouchableOpacity 
                onPress={() => navigation.goBack()}
                style={[
                  styles.iconButton, 
                  { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.9)' }
                ]}
              >
                <Ionicons 
                  name="arrow-back" 
                  size={30} 
                  color={colorScheme === 'dark' ? 'white' : 'black'} 
                />
              </TouchableOpacity>
            </View>
            
            <View style={styles.favoriteButtonContainer}>
              <FavoriteButton
                animalId={other || ''}
                animalName={animalSpecies || ''}
                animalType="individual"
                individualId={id}
              />
            </View>
            
            <View style={[
              styles.titleContainer, 
              { backgroundColor: colorScheme === 'dark' ? 'rgba(0,0,0,0.7)' : 'rgba(255,255,255,0.8)' }
            ]}>
              <ThemedText numberOfLines={2} style={styles.name}>{personalData?.name || 'Unknown'}</ThemedText>
              <ThemedText style={styles.species}>{animalSpecies || ''}</ThemedText>
            </View>
          </View>
          
          {/* Details Section */}
          <View style={styles.detailsContainer}>
            {/* Personal Info Section */}
            <ThemedView style={styles.section}>
              <ThemedText style={styles.sectionTitle}>Personal Information</ThemedText>
              
              <View style={styles.infoRow}>
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons
                    name="cake-variant"
                    size={30}
                    color={Colors[theme].tint}
                    style={styles.infoIcon}
                  />
                  <ThemedText style={styles.infoLabel}>Birthday</ThemedText>
                  <TouchableOpacity 
                    onPress={() => setIsBirthdayModalVisible(true)}
                    style={styles.birthdayButton}
                  >
                    <ThemedText style={styles.infoValue}>
                      {personalData?.born ? new Date(personalData.born.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' }) : 'Unknown'}
                    </ThemedText>
                    {personalData?.born && (
                      <ThemedText style={styles.ageText}>
                        {calculateAnimalAge(personalData.born)} years old
                      </ThemedText>
                    )}
                  </TouchableOpacity>
                </View>
                
                <View style={styles.infoItem}>
                  <MaterialCommunityIcons
                    name="gender-male-female"
                    size={30}
                    color={Colors[theme].tint}
                    style={styles.infoIcon}
                  />
                  <ThemedText style={styles.infoLabel}>Sex</ThemedText>
                  <ThemedText style={styles.infoValue}>{personalData?.sex || 'Unknown'}</ThemedText>
                </View>
              </View>
              
              <View style={styles.infoRow}>
                {personalData?.from && (
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                      name="map-marker"
                      size={30}
                      color={Colors[theme].tint}
                      style={styles.infoIcon}
                    />
                    <ThemedText style={styles.infoLabel}>From</ThemedText>
                    <ThemedText style={styles.infoValue}>{personalData.from}</ThemedText>
                  </View>
                )}
                
                {personalData?.arrived && (
                  <View style={styles.infoItem}>
                    <MaterialCommunityIcons
                      name="calendar-import"
                      size={30}
                      color={Colors[theme].tint}
                      style={styles.infoIcon}
                    />
                    <ThemedText style={styles.infoLabel}>Arrived</ThemedText>
                    <ThemedText style={styles.infoValue}>
                      {new Date(personalData.arrived.seconds * 1000).toLocaleDateString('en-US', { year: 'numeric', month: 'long', day: 'numeric' })}
                    </ThemedText>
                  </View>
                )}
              </View>
              
              {personalData?.id && (
                <View style={styles.notesContainer}>
                  <ThemedText style={styles.notesLabel}>Identification</ThemedText>
                  <ThemedText style={styles.notesText}>{personalData.id}</ThemedText>
                </View>
              )}
              
              {personalData?.keepernotes && (
                <View style={styles.notesContainer}>
                  <ThemedText style={styles.notesLabel}>Keeper Notes</ThemedText>
                  <ThemedText style={styles.notesText}>{personalData.keepernotes}</ThemedText>
                </View>
              )}
            </ThemedView>
            
            {/* ID RFID Section */}
            {personalData?.rfid && (
              <ThemedView style={styles.section}>
                <ThemedText style={styles.sectionTitle}>Identification</ThemedText>
                <View style={styles.idContainer}>
                  <ThemedText style={styles.idLabel}>RFID</ThemedText>
                  <ThemedText style={styles.idValue}>{personalData.rfid}</ThemedText>
                </View>
              </ThemedView>
            )}
            
            {/* Species link removed */}
          </View>
        </ScrollView>
        
        {/* Birthday Popup Modal with Age */}
        <BirthdayModal
          isVisible={isBirthdayModalVisible}
          onClose={() => setIsBirthdayModalVisible(false)}
          birthday={personalData?.born}
          animalName={personalData?.name || 'Animal'}
        />
      </ThemedView>
    </GestureHandlerRootView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingBottom: 30,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  errorContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  errorText: {
    fontSize: 18,
    marginBottom: 20,
    textAlign: 'center',
  },
  debugText: {
    fontSize: 12,
    marginBottom: 20,
    textAlign: 'center',
    color: '#666',
  },
  backButton: {
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 10,
    backgroundColor: '#0a7ea4',
  },
  backButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  header: {
    position: 'relative',
    height: 400, // Increased from 350 to 400
    overflow: 'hidden',
    borderBottomLeftRadius: 20,
    borderBottomRightRadius: 20,
    marginBottom: 15,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    resizeMode: 'cover',
  },
  backButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 60, // Further lowered position
    left: 20,
    zIndex: 10,
  },
  favoriteButtonContainer: {
    position: 'absolute',
    top: Platform.OS === 'ios' ? 90 : 60, // Further lowered position 
    right: 20,
    zIndex: 10,
  },
  iconButton: {
    width: 50, // Increased from 46 to 50
    height: 50, // Increased from 46 to 50
    borderRadius: 25, // Half of width/height
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 2,
    elevation: 3,
  },
  titleContainer: {
    position: 'absolute',
    bottom: 0,
    left: 0,
    right: 0,
    padding: 20, // General horizontal padding
    paddingTop: 30, // Increased top padding to move name down and prevent cutoff
    paddingBottom: 30, // Increased bottom padding for more space
    borderTopLeftRadius: 20,
    borderTopRightRadius: 20,
  },
  name: {
    fontSize: 29,
    fontWeight: 'bold',
    flexWrap: 'wrap', // Allow text to wrap to next line if needed
  },
  species: {
    fontSize: 18,
  },
  detailsContainer: {
    padding: 20,
    paddingTop: 24,
  },
  section: {
    marginBottom: 24,
    borderRadius: 16,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 2,
  },
  sectionTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 18,
  },
  infoRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    marginHorizontal: -8,
  },
  infoItem: {
    width: '50%',
    paddingHorizontal: 8,
    marginBottom: 16,
  },
  infoIcon: {
    marginBottom: 6,
  },
  infoLabel: {
    fontSize: 16,
    marginBottom: 4,
  },
  infoValue: {
    fontSize: 18,
    fontWeight: '600',
  },
  notesContainer: {
    marginTop: 8,
  },
  notesLabel: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 6,
  },
  notesText: {
    fontSize: 16,
    lineHeight: 24,
  },
  idContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  idLabel: {
    fontSize: 16,
    fontWeight: 'bold',
    marginRight: 8,
  },
  idValue: {
    fontSize: 16,
  },
  viewSpeciesButton: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: 14,
    paddingHorizontal: 20,
    borderRadius: 10,
    marginTop: 8,
  },
  viewSpeciesButtonText: {
    color: 'white',
    fontSize: 16,
    fontWeight: '600',
  },
  buttonIcon: {
    marginLeft: 8,
  },
  photoCredit: {
    position: 'absolute',
    bottom: 5,
    right: 10,
    backgroundColor: 'rgba(0,0,0,0.5)',
    padding: 5,
    borderRadius: 5,
    fontSize: 10,
    color: 'white',
  },
  ageText: {
    fontSize: 16,
    color: '#666',
    marginTop: 3,
  },
  birthdayButton: {
    paddingVertical: 5,
  },
});

export default Details;