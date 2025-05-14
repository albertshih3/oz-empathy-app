import firestore from '@react-native-firebase/firestore';
import auth from '@react-native-firebase/auth';
import { isAdminUser } from '../firebase/config';

export interface PushNotification {
  title: string;
  body: string;
  data?: Record<string, string>;
  tokens: string[];
}

export async function sendPushNotification(notification: PushNotification) {
  try {
    const currentUser = auth().currentUser;

    // Only allow admin users to send notifications
    if (!isAdminUser()) {
      throw new Error('Unauthorized: Only specific administrators can send notifications');
    }

    // Add the notification to the queue in Firestore
    await firestore().collection('notifications').add({
      ...notification,
      createdAt: firestore.FieldValue.serverTimestamp(),
      sentBy: currentUser?.uid,
      status: 'pending',
    });

    return { success: true };
  } catch (error) {
    console.error('Error sending push notification:', error);
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Unknown error occurred'
    };
  }
}

// Function to fetch all device tokens from the database
export async function getAllDeviceTokens(): Promise<string[]> {
  try {
    // Only allow admin users to retrieve tokens
    if (!isAdminUser()) {
      throw new Error('Unauthorized: Only specific administrators can access device tokens');
    }

    const tokensSnapshot = await firestore().collection('deviceTokens').get();
    const tokens: string[] = [];

    tokensSnapshot.forEach(doc => {
      const token = doc.data().token;
      if (token) tokens.push(token);
    });

    return tokens;
  } catch (error) {
    console.error('Error fetching device tokens:', error);
    return [];
  }
}

// Store the device token in Firestore
export async function saveDeviceToken(userId: string, token: string) {
  try {
    await firestore().collection('deviceTokens').doc(userId).set({
      token,
      userId,
      updatedAt: firestore.FieldValue.serverTimestamp(),
    });
    return true;
  } catch (error) {
    console.error('Error saving device token:', error);
    return false;
  }
}