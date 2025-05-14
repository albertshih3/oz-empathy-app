import firestore from '@react-native-firebase/firestore';
import NetInfo from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { getCurrentUserId, getUserFavoritesRef, getAnimalsRef } from './config';

// Local storage keys
const FAVORITES_STORAGE_KEY = 'oz_favorites';
const FAVORITE_ANIMALS_DATA_KEY = 'oz_favorite_animals_data';
const PENDING_OPERATIONS_KEY = 'oz_pending_favorites_operations';

// Types
export interface FavoriteItem {
  id: string;
  animalId: string;
  animalName: string;
  animalType: 'species' | 'individual';
  individualId?: string;
  timestamp: firestore.Timestamp | Date;
}

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

interface PendingOperation {
  type: 'add' | 'remove';
  favorite: Omit<FavoriteItem, 'id'>;
  localId?: string;
}

// Load favorites from local storage
export const loadLocalFavorites = async (): Promise<FavoriteItem[]> => {
  try {
    const favoritesJson = await AsyncStorage.getItem(FAVORITES_STORAGE_KEY);
    return favoritesJson ? JSON.parse(favoritesJson) : [];
  } catch (error) {
    console.error('Error loading local favorites:', error);
    return [];
  }
};

// Save favorites to local storage
export const saveLocalFavorites = async (favorites: FavoriteItem[]): Promise<void> => {
  try {
    await AsyncStorage.setItem(FAVORITES_STORAGE_KEY, JSON.stringify(favorites));
  } catch (error) {
    console.error('Error saving local favorites:', error);
  }
};

// Load favorite animals data from local storage
export const loadLocalFavoriteAnimalsData = async (): Promise<Record<string, AnimalData>> => {
  try {
    const dataJson = await AsyncStorage.getItem(FAVORITE_ANIMALS_DATA_KEY);
    return dataJson ? JSON.parse(dataJson) : {};
  } catch (error) {
    console.error('Error loading local favorite animals data:', error);
    return {};
  }
};

// Save favorite animals data to local storage
export const saveFavoriteAnimalsData = async (data: Record<string, AnimalData>): Promise<void> => {
  try {
    await AsyncStorage.setItem(FAVORITE_ANIMALS_DATA_KEY, JSON.stringify(data));
  } catch (error) {
    console.error('Error saving favorite animals data:', error);
  }
};

// Add a pending operation
export const addPendingOperation = async (operation: PendingOperation): Promise<void> => {
  try {
    const pendingOpsJson = await AsyncStorage.getItem(PENDING_OPERATIONS_KEY);
    const pendingOps: PendingOperation[] = pendingOpsJson ? JSON.parse(pendingOpsJson) : [];
    pendingOps.push(operation);
    await AsyncStorage.setItem(PENDING_OPERATIONS_KEY, JSON.stringify(pendingOps));
  } catch (error) {
    console.error('Error adding pending operation:', error);
  }
};

// Process pending operations
export const processPendingOperations = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) return;

    const pendingOpsJson = await AsyncStorage.getItem(PENDING_OPERATIONS_KEY);
    if (!pendingOpsJson) return;

    const pendingOps: PendingOperation[] = JSON.parse(pendingOpsJson);
    if (pendingOps.length === 0) return;

    const favoritesRef = getUserFavoritesRef(userId);
    const batch = firestore().batch();
    
    for (const op of pendingOps) {
      if (op.type === 'add') {
        const newRef = favoritesRef.doc();
        batch.set(newRef, {
          ...op.favorite,
          timestamp: firestore.FieldValue.serverTimestamp()
        });
      } else if (op.type === 'remove' && op.localId) {
        const snapshot = await favoritesRef
          .where('animalId', '==', op.favorite.animalId)
          .where('animalType', '==', op.favorite.animalType)
          .get();
        
        if (!snapshot.empty) {
          snapshot.docs.forEach(doc => {
            batch.delete(doc.ref);
          });
        }
      }
    }

    await batch.commit();
    await AsyncStorage.removeItem(PENDING_OPERATIONS_KEY);
  } catch (error) {
    console.error('Error processing pending operations:', error);
  }
};

// Toggle favorite status (works online and offline)
export const toggleFavorite = async (
  animalId: string,
  animalName: string,
  animalType: 'species' | 'individual' = 'species',
  individualId?: string
): Promise<boolean> => {
  const userId = getCurrentUserId();
  if (!userId) return false;

  // Check network state
  const netInfo = await NetInfo.fetch();
  const isConnected = netInfo.isConnected;

  // Load local favorites
  const localFavorites = await loadLocalFavorites();
  
  // Check if already favorited
  const favoriteIndex = localFavorites.findIndex(f => 
    f.animalId === animalId && 
    f.animalType === animalType && 
    (animalType !== 'individual' || f.individualId === individualId)
  );

  const isFavorite = favoriteIndex !== -1;
  
  if (isFavorite) {
    // Remove from local favorites
    const removedFavorite = localFavorites[favoriteIndex];
    localFavorites.splice(favoriteIndex, 1);
    await saveLocalFavorites(localFavorites);
    
    if (isConnected) {
      // Remove from Firestore
      const favoritesRef = getUserFavoritesRef(userId);
      const snapshot = await favoritesRef
        .where('animalId', '==', animalId)
        .where('animalType', '==', animalType)
        .get();
      
      if (!snapshot.empty) {
        snapshot.docs.forEach(async (doc) => {
          await doc.ref.delete();
        });
      }
    } else {
      // Add to pending operations
      await addPendingOperation({
        type: 'remove',
        favorite: {
          animalId,
          animalName,
          animalType,
          individualId,
          timestamp: new Date()
        },
        localId: removedFavorite.id
      });
    }
    
    return false;
  } else {
    // Create new favorite object
    const newFavorite: FavoriteItem = {
      id: `local_${Date.now()}`,
      animalId,
      animalName,
      animalType,
      individualId,
      timestamp: new Date()
    };
    
    // Add to local favorites
    localFavorites.push(newFavorite);
    await saveLocalFavorites(localFavorites);
    
    if (isConnected) {
      // Add to Firestore
      const favoritesRef = getUserFavoritesRef(userId);
      await favoritesRef.add({
        animalId,
        animalName,
        animalType,
        individualId: animalType === 'individual' ? individualId : null,
        timestamp: firestore.FieldValue.serverTimestamp()
      });
    } else {
      // Add to pending operations
      await addPendingOperation({
        type: 'add',
        favorite: {
          animalId,
          animalName,
          animalType,
          individualId,
          timestamp: new Date()
        }
      });
    }
    
    return true;
  }
};

// Check if an animal is favorited
export const checkFavoriteStatus = async (
  animalId: string,
  animalType: 'species' | 'individual' = 'species',
  individualId?: string
): Promise<boolean> => {
  // Load local favorites
  const localFavorites = await loadLocalFavorites();
  
  // Check if already favorited
  return localFavorites.some(f => 
    f.animalId === animalId && 
    f.animalType === animalType && 
    (animalType !== 'individual' || f.individualId === individualId)
  );
};

// Get all favorites
export const getFavorites = async (): Promise<FavoriteItem[]> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) return [];

    // Check network state
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;

    if (isConnected) {
      // Get from Firestore and update local cache
      const favoritesRef = getUserFavoritesRef(userId);
      const snapshot = await favoritesRef.orderBy('timestamp', 'desc').get();
      
      const favorites: FavoriteItem[] = snapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data(),
        timestamp: doc.data().timestamp?.toDate() || new Date()
      })) as FavoriteItem[];
      
      await saveLocalFavorites(favorites);
      return favorites;
    } else {
      // Return from local storage
      return await loadLocalFavorites();
    }
  } catch (error) {
    console.error('Error getting favorites:', error);
    // Fallback to local storage
    return await loadLocalFavorites();
  }
};

// Download animal data for offline use
export const downloadFavoriteAnimalsData = async (): Promise<void> => {
  try {
    const userId = getCurrentUserId();
    if (!userId) return;

    // Get list of favorites
    const favorites = await getFavorites();
    if (favorites.length === 0) return;

    // Get existing cached animal data
    const existingData = await loadLocalFavoriteAnimalsData();
    const updatedData = { ...existingData };

    // Download data for each favorite
    for (const favorite of favorites) {
      // Skip if we already have this animal's data
      if (updatedData[favorite.animalId]) continue;

      // Get animal data
      const animalDoc = await getAnimalsRef().doc(favorite.animalId).get();
      if (animalDoc.exists) {
        const animalData = animalDoc.data() as AnimalData;
        animalData.id = animalDoc.id;

        // If this is a species, get personal data
        if (favorite.animalType === 'species') {
          const personalSnapshot = await animalDoc.ref.collection('personal').get();
          animalData.personal = personalSnapshot.docs.map(doc => ({ 
            docid: doc.id, 
            ...doc.data() 
          }));
        }

        // Add to updated data
        updatedData[favorite.animalId] = animalData;
      }
    }

    // Save to local storage
    await saveFavoriteAnimalsData(updatedData);
  } catch (error) {
    console.error('Error downloading favorite animals data:', error);
  }
};

// Sync favorites with server
export const syncFavorites = async (): Promise<void> => {
  try {
    const netInfo = await NetInfo.fetch();
    const isConnected = netInfo.isConnected;
    
    if (!isConnected) return;
    
    // Process pending operations
    await processPendingOperations();
    
    // Refresh favorites from server
    await getFavorites();
    
    // Download animal data
    await downloadFavoriteAnimalsData();
  } catch (error) {
    console.error('Error syncing favorites:', error);
  }
};