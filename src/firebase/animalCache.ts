import firestore from '@react-native-firebase/firestore';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getAnimalsRef } from './config';

// Local storage keys
const ALL_ANIMALS_DATA_KEY = 'oz_all_animals_data';
const ANIMALS_LAST_UPDATED_KEY = 'oz_animals_last_updated';

// Default cache expiration in milliseconds (1 day)
const CACHE_EXPIRATION = 24 * 60 * 60 * 1000;

// Types
export interface AnimalData {
  id: string;
  name: string;
  photo?: string;
  class?: string;
  order?: string;
  family?: string;
  genus?: string;
  diet?: string;
  lifespan?: string;
  lifespan_cap?: string;
  range?: string;
  personal?: any[];
}

// Load all animals data from local storage
export const loadLocalAnimalsData = async (): Promise<Record<string, AnimalData> | null> => {
  try {
    const dataJson = await AsyncStorage.getItem(ALL_ANIMALS_DATA_KEY);
    if (!dataJson) return null;
    
    // Check if the cache is expired
    const lastUpdatedJson = await AsyncStorage.getItem(ANIMALS_LAST_UPDATED_KEY);
    if (lastUpdatedJson) {
      const lastUpdated = parseInt(lastUpdatedJson, 10);
      const now = Date.now();
      if (now - lastUpdated > CACHE_EXPIRATION) {
        console.log('Animal data cache expired, will refresh');
        return null;
      }
    }
    
    return JSON.parse(dataJson);
  } catch (error) {
    console.error('Error loading local animals data:', error);
    return null;
  }
};

// Save all animals data to local storage
export const saveAnimalsData = async (data: Record<string, AnimalData>): Promise<void> => {
  try {
    await AsyncStorage.setItem(ALL_ANIMALS_DATA_KEY, JSON.stringify(data));
    await AsyncStorage.setItem(ANIMALS_LAST_UPDATED_KEY, Date.now().toString());
  } catch (error) {
    console.error('Error saving animals data:', error);
  }
};

// Clear animal cache data
export const clearAnimalCache = async (): Promise<void> => {
  try {
    await AsyncStorage.removeItem(ALL_ANIMALS_DATA_KEY);
    await AsyncStorage.removeItem(ANIMALS_LAST_UPDATED_KEY);
    console.log('Animal cache cleared successfully');
  } catch (error) {
    console.error('Error clearing animal cache:', error);
    throw error;
  }
};

// Download all animal data for offline use
export const downloadAllAnimalsData = async (): Promise<Record<string, AnimalData>> => {
  try {
    console.log('Starting download of all animals data');
    
    // Check if we have recent data in cache
    const cachedData = await loadLocalAnimalsData();
    if (cachedData) {
      console.log('Using cached animal data');
      return cachedData;
    }
    
    // Get existing cached animal data or start with empty object
    const animalsData: Record<string, AnimalData> = {};
    
    // Get all animals
    const animalsSnapshot = await getAnimalsRef().get();
    
    // Process each animal
    for (const animalDoc of animalsSnapshot.docs) {
      const animalData = animalDoc.data() as AnimalData;
      animalData.id = animalDoc.id;
      
      // Get personal data for each animal
      const personalSnapshot = await animalDoc.ref.collection('personal').get();
      animalData.personal = personalSnapshot.docs.map(doc => ({ 
        docid: doc.id, 
        ...doc.data() 
      }));
      
      // Add to data object
      animalsData[animalDoc.id] = animalData;
    }
    
    // Save to local storage
    await saveAnimalsData(animalsData);
    console.log(`Downloaded data for ${Object.keys(animalsData).length} animals`);
    
    return animalsData;
  } catch (error) {
    console.error('Error downloading animals data:', error);
    return {};
  }
};

// Get a specific animal from the cache or Firestore
export const getAnimal = async (animalId: string): Promise<AnimalData | null> => {
  try {
    // First try to get from cache
    const cachedData = await loadLocalAnimalsData();
    
    if (cachedData && cachedData[animalId]) {
      console.log('Found animal in cache');
      return cachedData[animalId];
    }
    
    // If not in cache or failed, try to get from Firestore
    console.log('Animal not in cache, trying Firestore');
    const animalDoc = await getAnimalsRef().doc(animalId).get();
    
    if (!animalDoc.exists) {
      console.log('Animal not found in Firestore');
      return null;
    }
    
    const animalData = animalDoc.data() as AnimalData;
    animalData.id = animalDoc.id;
    
    // Get personal data
    const personalSnapshot = await animalDoc.ref.collection('personal').get();
    animalData.personal = personalSnapshot.docs.map(doc => ({ 
      docid: doc.id, 
      ...doc.data() 
    }));
    
    // Update the cached data with this animal
    if (cachedData) {
      const updatedCache = { ...cachedData, [animalId]: animalData };
      await saveAnimalsData(updatedCache);
    }
    
    return animalData;
  } catch (error) {
    console.error(`Error getting animal ${animalId}:`, error);
    return null;
  }
};
