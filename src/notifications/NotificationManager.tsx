import React, { useState, useEffect, useRef } from 'react';
import { Platform } from 'react-native';
import * as Notifications from 'expo-notifications';
import auth from '@react-native-firebase/auth';
import { registerForPushNotificationsAsync, setNotificationListeners } from './notificationService';
import { saveDeviceToken } from './notificationSender';

interface NotificationManagerProps {
  children: React.ReactNode;
}

export const NotificationManager: React.FC<NotificationManagerProps> = ({ children }) => {
  const [notification, setNotification] = useState<Notifications.Notification | null>(null);
  const notificationListener = useRef<any>();
  const responseListener = useRef<any>();

  useEffect(() => {
    // Register for push notifications and save the token
    const registerDevice = async () => {
      try {
        const token = await registerForPushNotificationsAsync();
        
        if (token) {
          const user = auth().currentUser;
          if (user) {
            await saveDeviceToken(user.uid, token);
            console.log('Device registered for push notifications');
          }
        }
      } catch (error) {
        console.error('Failed to register for push notifications:', error);
      }
    };

    // Listen for auth state changes
    const unsubscribeAuth = auth().onAuthStateChanged(user => {
      if (user) {
        registerDevice();
      }
    });

    // Set up notification listeners
    const unsubscribeNotifications = setNotificationListeners((notification) => {
      setNotification(notification);
    });

    return () => {
      // Clean up listeners
      if (unsubscribeAuth) unsubscribeAuth();
      if (unsubscribeNotifications) unsubscribeNotifications();
    };
  }, []);

  return <>{children}</>;
};

export default NotificationManager;