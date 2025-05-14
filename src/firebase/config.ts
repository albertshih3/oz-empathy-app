import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';

// Enable Firestore offline persistence with unlimited cache size
export const initializeFirestore = () => {
  firestore().settings({
    persistence: true,
    cacheSizeBytes: firestore.CACHE_SIZE_UNLIMITED
  });
};

// Get current user ID
export const getCurrentUserId = (): string | null => {
  const user = auth().currentUser;
  return user ? user.uid : null;
};

// Check if user has admin privileges (only ashih@oaklandzoo.org)
export const isAdminUser = (): boolean => {
  const user = auth().currentUser;
  return user?.email === 'ashih@oaklandzoo.org';
};

// Reference to user's favorites collection
export const getUserFavoritesRef = (userId: string) => {
  return firestore()
    .collection('users')
    .doc(userId)
    .collection('favorites');
};

// Reference to animals collection
export const getAnimalsRef = () => {
  return firestore().collection('animals');
};

// Check if a document exists in a collection
export const documentExists = async (docRef: any): Promise<boolean> => {
  const doc = await docRef.get();
  return doc.exists;
};