import React, { useState, useEffect } from 'react';
import { 
  View, 
  Platform, 
  Image, 
  Text, 
  ScrollView, 
  StyleSheet, 
  TouchableOpacity, 
  FlatList,
  useColorScheme
} from 'react-native';
import { Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { Entypo, MaterialIcons } from '@expo/vector-icons';
import firestore from '@react-native-firebase/firestore';
import { LoaderScreen, Colors as UIColors } from 'react-native-ui-lib';
import { Colors } from '../../constants/Colors';
import { useColorScheme as expouseColorScheme } from '../../hooks/useColorScheme';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

// Define notification interface
interface Notification {
  id: string;
  title: string;
  body: string;
  createdAt: Date;
  sentBy: string;
}

export default function NotificationsHistory() {
  // If the page was reloaded or navigated to directly, then the modal should be presented as
  // a full screen page. You may need to change the UI to account for this.
  const isPresented = router.canGoBack();
  const windowWidth = Dimensions.get('window').width;
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  
  // State management
  const [loading, setLoading] = useState(true);
  const [notifications, setNotifications] = useState<Notification[]>([]);

  useEffect(() => {
    // Fetch notifications from Firestore
    const fetchNotifications = async () => {
      try {
        setLoading(true);
        const notificationsRef = firestore()
          .collection('notifications')
          .orderBy('createdAt', 'desc')
          .limit(50); // Limit to most recent 50 notifications
        
        const snapshot = await notificationsRef.get();
        
        const notificationsList: Notification[] = [];
        snapshot.forEach(doc => {
          const data = doc.data();
          notificationsList.push({
            id: doc.id,
            title: data.title || '',
            body: data.body || '',
            createdAt: data.createdAt ? new Date(data.createdAt.toDate()) : new Date(),
            sentBy: data.sentBy || '',
          });
        });
        
        setNotifications(notificationsList);
      } catch (error) {
        console.error('Error fetching notifications:', error);
      } finally {
        setLoading(false);
      }
    };

    fetchNotifications();
  }, []);

  const formatDate = (date: Date) => {
    return date.toLocaleString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const renderNotificationItem = ({ item }: { item: Notification }) => (
    <View style={[
      styles.notificationItem, 
      { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#f9f9f9' }
    ]}>
      <View style={styles.notificationHeader}>
        <ThemedText style={styles.notificationTitle}>{item.title}</ThemedText>
        <ThemedText style={styles.notificationDate}>{formatDate(item.createdAt)}</ThemedText>
      </View>
      <ThemedText style={styles.notificationBody}>{item.body}</ThemedText>
    </View>
  );

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoaderScreen message={'Loading notifications...'} color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  return (
    <GestureHandlerRootView style={{flex: 1}}>
      <ThemedView style={styles.container}>
        {!isPresented && <Link href="../">Dismiss</Link>}
        <StatusBar style={colorScheme === 'dark' ? 'light' : 'dark'} />

        <View style={styles.headerContainer}>
          <Image 
            source={require('../../assets/images/home/settings.png')} 
            style={styles.headerImage} 
          />
          <Text style={[
            styles.closeHint,
            {
              top: Platform.OS === 'android' ? 50 : 0,
              left: Platform.OS === 'android' ? 20 : 'auto',
              color: Platform.OS === 'android' ? 'black': 'gray',
            }     
          ]}>
            {Platform.OS === 'android' ? '<  Swipe Left to Close' : 'Swipe Down to Close'}
          </Text>
          {Platform.OS === 'ios' && 
            <Entypo 
              name="chevron-down" 
              size={24} 
              color="gray" 
              style={styles.closeIcon} 
            />
          }
          <Text style={styles.headerTitle}>Notification History</Text>
        </View>

        {notifications.length === 0 ? (
          <ThemedView style={styles.emptyContainer}>
            <MaterialIcons 
              name="notifications-none" 
              size={64} 
              color={colorScheme === 'dark' ? '#666666' : '#cccccc'} 
            />
            <ThemedText style={styles.emptyText}>No notifications yet</ThemedText>
          </ThemedView>
        ) : (
          <FlatList
            data={notifications}
            renderItem={renderNotificationItem}
            keyExtractor={item => item.id}
            contentContainerStyle={styles.listContainer}
          />
        )}
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerContainer: {
    position: 'relative',
    height: 220,
  },
  headerImage: {
    width: '100%',
    height: '100%',
    opacity: 0.3,
  },
  closeHint: {
    position: 'absolute',
    alignSelf: 'center',
    marginTop: 10,
    fontWeight: 'bold',
  },
  closeIcon: {
    position: 'absolute',
    alignSelf: 'center',
    top: 25,
  },
  headerTitle: {
    position: 'absolute',
    bottom: 0,
    fontWeight: 'bold',
    fontSize: 32,
    marginLeft: 20,
    marginBottom: 15,
    marginRight: 10,
    color: 'black',
  },
  listContainer: {
    padding: 16,
    paddingBottom: 30,
  },
  notificationItem: {
    borderRadius: 10,
    padding: 16,
    marginBottom: 12,
    borderLeftWidth: 4,
    borderLeftColor: '#0a7ea4',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
    elevation: 2,
  },
  notificationHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  notificationTitle: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#0a7ea4',
    flex: 1,
  },
  notificationDate: {
    fontSize: 12,
    color: '#777',
    marginLeft: 8,
  },
  notificationBody: {
    fontSize: 14,
    lineHeight: 20,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyText: {
    marginTop: 12,
    fontSize: 16,
    textAlign: 'center',
  },
});