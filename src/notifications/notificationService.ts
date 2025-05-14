import * as Notifications from 'expo-notifications';
import * as Device from 'expo-device';
import Constants from 'expo-constants';
import { Platform } from 'react-native';

// Configure how notifications appear when the app is in the foreground
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: true,
  }),
});

// Function to register for push notifications
export async function registerForPushNotificationsAsync() {
  let token;
  
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }

  if (Device.isDevice) {
    const { status: existingStatus } = await Notifications.getPermissionsAsync();
    let finalStatus = existingStatus;
    
    if (existingStatus !== 'granted') {
      const { status } = await Notifications.requestPermissionsAsync();
      finalStatus = status;
    }
    
    if (finalStatus !== 'granted') {
      console.log('Failed to get push token for push notification!');
      return;
    }
    
    // Get the token that uniquely identifies this device
    token = await Notifications.getExpoPushTokenAsync({
      projectId: Constants.expoConfig?.extra?.eas?.projectId,
    });
  } else {
    console.log('Must use physical device for Push Notifications');
  }

  return token?.data;
}

// Function to send a local notification (for testing)
export async function sendLocalNotification(title: string, body: string) {
  await Notifications.scheduleNotificationAsync({
    content: {
      title: title,
      body: body,
      sound: true,
      data: { data: 'goes here' },
    },
    trigger: { seconds: 2 },
  });
}

// Set up notification listeners
export function setNotificationListeners(
  handleNotification: (notification: Notifications.Notification) => void
) {
  const notificationListener = Notifications.addNotificationReceivedListener(
    (notification) => {
      handleNotification(notification);
    }
  );

  const responseListener = Notifications.addNotificationResponseReceivedListener(
    (response) => {
      console.log('Notification response:', response);
      // Handle notification response (e.g., navigation)
    }
  );

  return () => {
    Notifications.removeNotificationSubscription(notificationListener);
    Notifications.removeNotificationSubscription(responseListener);
  };
}