import React, { useState, useEffect } from 'react';
import {
  View,
  Platform,
  Image,
  Text,
  ScrollView,
  StyleSheet,
  TouchableOpacity,
  Switch,
  Alert,
  TextInput,
  useColorScheme
} from 'react-native';
import { Dimensions } from 'react-native';
import { Link, router } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import {
  Entypo,
  MaterialIcons,
  Ionicons,
  FontAwesome5,
  MaterialCommunityIcons
} from '@expo/vector-icons';
import auth from '@react-native-firebase/auth';
import AsyncStorage from '@react-native-async-storage/async-storage';
import firestore from '@react-native-firebase/firestore';
import { LoaderScreen, Colors as UIColors, Button as UIButton, Incubator } from 'react-native-ui-lib';
import Button from '@/components/Button';
import { useConnection } from '@/src/utils/ConnectionManager';
import { useColorScheme as expoUseColorScheme } from '@/hooks/useColorScheme';
import { sendPushNotification, getAllDeviceTokens, sendLocalNotification } from '@/src/notifications';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

const { Toast } = Incubator;

export default function Info() {
  // If the page was reloaded or navigated to directly, then the modal should be presented as
  // a full screen page. You may need to change the UI to account for this.
  const isPresented = router.canGoBack();
  const windowWidth = Dimensions.get('window').width;
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';
  const { isConnected, syncData, isDownloadingAnimals } = useConnection();
  
  // State management
  const [initializing, setInitializing] = useState(true);
  const [user, setUser] = useState<any>();
  const [cacheSize, setCacheSize] = useState<string>('Calculating...');
  const [autoDownload, setAutoDownload] = useState<boolean>(true);
  const [darkModeEnabled, setDarkModeEnabled] = useState<boolean>(colorScheme === 'dark');
  const [notificationsEnabled, setNotificationsEnabled] = useState<boolean>(false);
  const [expandedSection, setExpandedSection] = useState<string | null>('profile');
  const [appVersion, setAppVersion] = useState<string>('1.4.0');
  
  // Notification sending state
  const [isAdmin, setIsAdmin] = useState<boolean>(false);
  const [notificationTitle, setNotificationTitle] = useState<string>('');
  const [notificationMessage, setNotificationMessage] = useState<string>('');
  const [isLoading, setIsLoading] = useState<boolean>(false);
  const [toastVisible, setToastVisible] = useState<boolean>(false);
  const [toastMessage, setToastMessage] = useState<string>('');
  const [toastPreset, setToastPreset] = useState<'failure' | 'success'>('failure');
  
  function onAuthStateChanged(user: any): void {
    setUser(user);
    if (initializing) setInitializing(false);
  }

  function handleSignOut(): void {
    Alert.alert(
      "Sign Out",
      "Are you sure you want to sign out?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Yes", 
          onPress: () => {
            auth().signOut();
            router.replace("/");
          }
        }
      ]
    );
  }
  
  useEffect(() => {
    const subscriber = auth().onAuthStateChanged(onAuthStateChanged);
    
    // Load settings from AsyncStorage
    const loadSettings = async () => {
      try {
        const autoDownloadSetting = await AsyncStorage.getItem('oz_auto_download');
        if (autoDownloadSetting !== null) {
          setAutoDownload(autoDownloadSetting === 'true');
        }
        
        const notificationsSetting = await AsyncStorage.getItem('oz_notifications_enabled');
        if (notificationsSetting !== null) {
          setNotificationsEnabled(notificationsSetting === 'true');
        }
        
        // Calculate storage usage
        calculateCacheSize();
        
        // Check if user is admin
        const currentUser = auth().currentUser;
        if (currentUser?.email === 'ashih@oaklandzoo.org') {
          setIsAdmin(true);
        }
      } catch (error) {
        console.error('Error loading settings:', error);
      }
    };
    
    loadSettings();
    
    return subscriber; // unsubscribe on unmount
  }, []);
  
  // Calculate storage usage
  const calculateCacheSize = async () => {
    try {
      const keys = await AsyncStorage.getAllKeys();
      let totalSize = 0;
      
      for (const key of keys) {
        if (key.startsWith('oz_')) {
          const value = await AsyncStorage.getItem(key);
          if (value) {
            totalSize += value.length;
          }
        }
      }
      
      // Convert bytes to MB
      const sizeMB = (totalSize / (1024 * 1024)).toFixed(2);
      setCacheSize(`${sizeMB} MB`);
    } catch (error) {
      console.error('Error calculating cache size:', error);
      setCacheSize('Unknown');
    }
  };
  
  // Toggle section expansion
  const toggleSection = (section: string) => {
    setExpandedSection(expandedSection === section ? null : section);
  };
  
  // Handle settings changes
  const handleAutoDownloadChange = async (value: boolean) => {
    setAutoDownload(value);
    await AsyncStorage.setItem('oz_auto_download', value.toString());
  };
  
  const handleNotificationsChange = async (value: boolean) => {
    setNotificationsEnabled(value);
    await AsyncStorage.setItem('oz_notifications_enabled', value.toString());
  };
  
  // Handle sending notification
  const handleSendNotification = async () => {
    if (!notificationTitle || !notificationMessage) {
      setToastMessage('Title and message are required');
      setToastPreset('failure');
      setToastVisible(true);
      return;
    }

    setIsLoading(true);
    try {
      // Get all device tokens
      const tokens = await getAllDeviceTokens();
      
      if (!tokens || tokens.length === 0) {
        setToastMessage('No registered devices found to send notifications to');
        setToastPreset('failure');
        setToastVisible(true);
        setIsLoading(false);
        return;
      }

      // Send push notification
      const result = await sendPushNotification({
        title: notificationTitle,
        body: notificationMessage,
        tokens,
      });

      if (result.success) {
        // Send a local notification for immediate feedback
        await sendLocalNotification(notificationTitle, notificationMessage);
        
        setToastMessage('Notification successfully sent');
        setToastPreset('success');
        setNotificationTitle('');
        setNotificationMessage('');
      } else {
        setToastMessage(`Failed to send notification: ${result.error}`);
        setToastPreset('failure');
      }
    } catch (error) {
      console.error('Error sending notification:', error);
      setToastMessage('Error sending notification. Please try again.');
      setToastPreset('failure');
    } finally {
      setToastVisible(true);
      setIsLoading(false);
    }
  };
  
  // Handle clearing all notifications
  const handleClearAllNotifications = () => {
    Alert.alert(
      "Clear All Notifications",
      "Are you sure you want to delete all notifications? This action cannot be undone.",
      [
        {
          text: "Cancel",
          style: "cancel"
        },
        {
          text: "Clear All",
          style: "destructive",
          onPress: clearAllNotifications
        }
      ]
    );
  };
  
  // Function to clear all notifications from Firestore
  const clearAllNotifications = async () => {
    setIsLoading(true);
    try {
      const notificationsRef = firestore().collection('notifications');
      const snapshot = await notificationsRef.get();
      
      // Use a batch to delete all notifications
      const batch = firestore().batch();
      
      if (snapshot.empty) {
        setToastMessage('No notifications to clear');
        setToastPreset('failure');
        setIsLoading(false);
        setToastVisible(true);
        return;
      }
      
      snapshot.forEach(doc => {
        batch.delete(doc.ref);
      });
      
      await batch.commit();
      
      setToastMessage('All notifications have been cleared');
      setToastPreset('success');
    } catch (error) {
      console.error('Error clearing notifications:', error);
      setToastMessage('Error clearing notifications. Please try again.');
      setToastPreset('failure');
    } finally {
      setToastVisible(true);
      setIsLoading(false);
    }
  };
  
  // Clear cache
  const handleClearCache = async () => {
    Alert.alert(
      "Clear Cache",
      "This will delete all downloaded animal data. You'll need to re-download data to use the app offline. Continue?",
      [
        { text: "Cancel", style: "cancel" },
        { 
          text: "Clear", 
          style: "destructive",
          onPress: async () => {
            try {
              const keys = await AsyncStorage.getAllKeys();
              const cacheKeys = keys.filter(key => 
                key.startsWith('oz_') && 
                !key.includes('favorites') && 
                !key.includes('settings')
              );
              await AsyncStorage.multiRemove(cacheKeys);
              setCacheSize('0.00 MB');
              Alert.alert("Success", "Cache cleared successfully");
            } catch (error) {
              console.error('Error clearing cache:', error);
              Alert.alert("Error", "Failed to clear cache");
            }
          }
        }
      ]
    );
  };
  
  // Download all data
  const handleDownloadAllData = async () => {
    if (!isConnected) {
      Alert.alert("Error", "You need to be connected to the internet to download data");
      return;
    }
    
    try {
      Alert.alert("Download Started", "Downloading all animal data for offline use");
      await syncData();
      calculateCacheSize();
      Alert.alert("Success", "Animal data downloaded successfully");
    } catch (error) {
      console.error('Error downloading data:', error);
      Alert.alert("Error", "Failed to download animal data");
    }
  };

  if (initializing) return (<LoaderScreen message={'Loading settings...'} color={Colors[theme].tint} />);

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
              color: Platform.OS === 'android' ? (colorScheme === 'dark' ? 'white' : 'black') : 'gray',
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
          <Text style={[
            styles.headerTitle,
            { color: colorScheme === 'dark' ? 'white' : 'black' }
          ]}>Settings</Text>
        </View>

        <ScrollView style={styles.content}>
          {/* Profile Section */}
          <TouchableOpacity 
            style={[
              styles.sectionHeader,
              { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#ffffff' }
            ]} 
            onPress={() => toggleSection('profile')}
          >
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="account-circle" size={24} color="#0a7ea4" />
              <ThemedText style={styles.sectionTitle}>Profile & Account</ThemedText>
            </View>
            <Entypo 
              name={expandedSection === 'profile' ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={colorScheme === 'dark' ? '#999' : '#666'} 
            />
          </TouchableOpacity>
          
          {expandedSection === 'profile' && (
            <ThemedView style={styles.sectionContent}>
              <View style={styles.profileInfo}>
                <ThemedText style={styles.infoLabel}>Email:</ThemedText>
                <ThemedText style={styles.infoValue}>{user?.email ?? 'Unknown'}</ThemedText>
              </View>
              
              {user?.displayName && (
                <View style={styles.profileInfo}>
                  <ThemedText style={styles.infoLabel}>Name:</ThemedText>
                  <ThemedText style={styles.infoValue}>{user.displayName}</ThemedText>
                </View>
              )}
              
              <Button 
                label="Sign Out" 
                onPress={handleSignOut}
                style={{
                  backgroundColor: 'transparent',
                  height: 48,
                  marginTop: 16
                }}
              />
            </ThemedView>
          )}

          {/* Data Management Section */}
          <TouchableOpacity 
            style={[
              styles.sectionHeader,
              { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#ffffff' }
            ]} 
            onPress={() => toggleSection('data')}
          >
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="storage" size={24} color="#0a7ea4" />
              <ThemedText style={styles.sectionTitle}>Offline Data Management</ThemedText>
            </View>
            <Entypo 
              name={expandedSection === 'data' ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={colorScheme === 'dark' ? '#999' : '#666'} 
            />
          </TouchableOpacity>
          
          {expandedSection === 'data' && (
            <ThemedView style={styles.sectionContent}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingName}>Cache Size</ThemedText>
                  <ThemedText style={styles.settingDescription}>{cacheSize} of storage used</ThemedText>
                </View>
                <TouchableOpacity 
                  style={styles.actionButton} 
                  onPress={handleClearCache}
                >
                  <Text style={styles.actionButtonText}>Clear</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingName}>Download All Data</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    {isDownloadingAnimals 
                      ? 'Downloading...' 
                      : 'Download all animal data for offline use'}
                  </ThemedText>
                </View>
                <TouchableOpacity 
                  style={[
                    styles.actionButton, 
                    (!isConnected || isDownloadingAnimals) && styles.disabledButton
                  ]} 
                  onPress={handleDownloadAllData}
                  disabled={!isConnected || isDownloadingAnimals}
                >
                  <Text style={styles.actionButtonText}>
                    {isDownloadingAnimals ? 'Loading...' : 'Download'}
                  </Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingName}>Auto-Download</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Automatically download animal data when online
                  </ThemedText>
                </View>
                <Switch
                  value={autoDownload}
                  onValueChange={handleAutoDownloadChange}
                  trackColor={{ false: '#d3d3d3', true: '#a0d8ef' }}
                  thumbColor={autoDownload ? '#0a7ea4' : '#f4f3f4'}
                />
              </View>
              
              <View style={[
                styles.connectionStatusContainer,
                { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#f9f9f9' }
              ]}>
                {isConnected ? (
                  <View style={styles.connectionStatus}>
                    <Ionicons name="wifi" size={20} color="green" />
                    <ThemedText style={[styles.connectionText, { color: 'green' }]}>
                      Connected to internet
                    </ThemedText>
                  </View>
                ) : (
                  <View style={styles.connectionStatus}>
                    <MaterialIcons name="wifi-off" size={20} color="orange" />
                    <ThemedText style={[styles.connectionText, { color: 'orange' }]}>
                      Offline mode - limited functionality
                    </ThemedText>
                  </View>
                )}
              </View>
            </ThemedView>
          )}
          
          {/* Appearance Section */}
          <TouchableOpacity 
            style={[
              styles.sectionHeader,
              { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#ffffff' }
            ]} 
            onPress={() => toggleSection('appearance')}
          >
            <View style={styles.sectionTitleContainer}>
              <Ionicons name="color-palette" size={24} color="#0a7ea4" />
              <ThemedText style={styles.sectionTitle}>Appearance</ThemedText>
            </View>
            <Entypo 
              name={expandedSection === 'appearance' ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={colorScheme === 'dark' ? '#999' : '#666'} 
            />
          </TouchableOpacity>
          
          {expandedSection === 'appearance' && (
            <ThemedView style={styles.sectionContent}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingName}>Dark Mode</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Use system setting (currently {colorScheme})
                  </ThemedText>
                </View>
                <ThemedText style={styles.systemControlled}>System</ThemedText>
              </View>
              
              <ThemedText style={styles.themeNote}>
                Note: Theme follows your device settings. To change it, update your device's display settings.
              </ThemedText>
            </ThemedView>
          )}
          
          {/* Notifications Section */}
          <TouchableOpacity 
            style={[
              styles.sectionHeader,
              { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#ffffff' }
            ]} 
            onPress={() => toggleSection('notifications')}
          >
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="notifications" size={24} color="#0a7ea4" />
              <ThemedText style={styles.sectionTitle}>Notifications</ThemedText>
            </View>
            <Entypo 
              name={expandedSection === 'notifications' ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={colorScheme === 'dark' ? '#999' : '#666'} 
            />
          </TouchableOpacity>
          
          {expandedSection === 'notifications' && (
            <ThemedView style={styles.sectionContent}>
              <View style={styles.settingRow}>
                <View style={styles.settingInfo}>
                  <ThemedText style={styles.settingName}>Push Notifications</ThemedText>
                  <ThemedText style={styles.settingDescription}>
                    Receive updates about zoo animals and events
                  </ThemedText>
                </View>
                <Switch
                  value={notificationsEnabled}
                  onValueChange={handleNotificationsChange}
                  trackColor={{ false: '#d3d3d3', true: '#a0d8ef' }}
                  thumbColor={notificationsEnabled ? '#0a7ea4' : '#f4f3f4'}
                />
              </View>
              
              {isAdmin && (
                <View style={[
                  styles.adminSection,
                  { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#f9f9f9' }
                ]}>
                  <ThemedText style={styles.adminSectionTitle}>Send Notification to All Staff</ThemedText>
                  <TextInput
                    placeholder="Notification Title"
                    value={notificationTitle}
                    onChangeText={setNotificationTitle}
                    style={[
                      styles.notificationInput,
                      { 
                        backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : 'white',
                        color: colorScheme === 'dark' ? '#fff' : '#000',
                      }
                    ]}
                    placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
                  />
                  <TextInput
                    placeholder="Notification Message"
                    value={notificationMessage}
                    onChangeText={setNotificationMessage}
                    multiline
                    numberOfLines={4}
                    style={[
                      styles.notificationInput, 
                      styles.notificationMessageInput,
                      { 
                        backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : 'white',
                        color: colorScheme === 'dark' ? '#fff' : '#000',
                      }
                    ]}
                    placeholderTextColor={colorScheme === 'dark' ? '#aaa' : '#999'}
                  />
                  <UIButton 
                    label={isLoading ? "Sending..." : "Send Notification"}
                    onPress={handleSendNotification} 
                    style={styles.sendButton}
                    backgroundColor="#0a7ea4"
                    disabled={isLoading}
                  />
                  <UIButton 
                    label="Clear All Notifications"
                    onPress={handleClearAllNotifications} 
                    style={[styles.sendButton, styles.clearButton]}
                    backgroundColor="#d9534f"
                    disabled={isLoading}
                  />
                  <ThemedText style={styles.adminNote}>
                    This will send a notification to all staff with the app installed
                  </ThemedText>
                </View>
              )}
            </ThemedView>
          )}
          
          {/* About Section */}
          <TouchableOpacity 
            style={[
              styles.sectionHeader,
              { backgroundColor: colorScheme === 'dark' ? '#2C2C2E' : '#ffffff' }
            ]} 
            onPress={() => toggleSection('about')}
          >
            <View style={styles.sectionTitleContainer}>
              <MaterialIcons name="info-outline" size={24} color="#0a7ea4" />
              <ThemedText style={styles.sectionTitle}>About</ThemedText>
            </View>
            <Entypo 
              name={expandedSection === 'about' ? 'chevron-up' : 'chevron-down'} 
              size={24} 
              color={colorScheme === 'dark' ? '#999' : '#666'} 
            />
          </TouchableOpacity>
          
          {expandedSection === 'about' && (
            <ThemedView style={styles.sectionContent}>
              <View style={styles.aboutRow}>
                <ThemedText style={styles.aboutLabel}>Version</ThemedText>
                <ThemedText style={styles.aboutValue}>{appVersion}</ThemedText>
              </View>
              
              <View style={styles.aboutRow}>
                <ThemedText style={styles.aboutLabel}>Built By</ThemedText>
                <ThemedText style={styles.aboutValue}>Albert Shih</ThemedText>
              </View>
              
              <View style={styles.aboutRow}>
                <ThemedText style={styles.aboutLabel}>For</ThemedText>
                <ThemedText style={styles.aboutValue}>Oakland Zoo Learning & Engagement</ThemedText>
              </View>
              
              <View style={styles.aboutDescription}>
                <ThemedText style={styles.aboutDescriptionText}>
                  This app was created for the Oakland Zoo for internal use by the Learning & Engagement 
                  Department. It provides information about zoo animals to assist staff with educational 
                  programs and guest interactions.
                </ThemedText>
              </View>
              
              <View style={[
                styles.legalInfo,
                { backgroundColor: colorScheme === 'dark' ? '#1C1C1E' : '#f9f9f9' }
              ]}>
                <ThemedText style={styles.legalInfoText}>
                  © {new Date().getFullYear()} Oakland Zoo. All rights reserved.
                </ThemedText>
                <ThemedText style={styles.legalInfoText}>
                  Information and images are property of Oakland Zoo and are for internal use only.
                </ThemedText>
              </View>
            </ThemedView>
          )}
          
          <View style={styles.footer}>
            <ThemedText style={styles.footerText}>
              Please note that this app is still in development and is not meant to fully replace the Empathy Guide website.
            </ThemedText>
          </View>
        </ScrollView>
        
        <Toast
          visible={toastVisible}
          position={'bottom'}
          autoDismiss={5000}
          enableHapticFeedback={true}
          message={toastMessage}
          preset={toastPreset}
          onDismiss={() => setToastVisible(false)}
        />
      </ThemedView>
    </GestureHandlerRootView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
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
  },
  content: {
    flex: 1,
  },
  sectionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: '#e0e0e0',
  },
  sectionTitleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    marginLeft: 10,
  },
  sectionContent: {
    padding: 16,
    marginBottom: 16,
  },
  profileInfo: {
    flexDirection: 'row',
    marginBottom: 12,
  },
  infoLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
  },
  infoValue: {
    fontSize: 16,
    flex: 1,
  },
  settingRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  settingInfo: {
    flex: 1,
    paddingRight: 8,
  },
  settingName: {
    fontSize: 16,
    fontWeight: '500',
    marginBottom: 2,
  },
  settingDescription: {
    fontSize: 14,
  },
  actionButton: {
    backgroundColor: '#0a7ea4',
    paddingVertical: 8,
    paddingHorizontal: 16,
    borderRadius: 6,
  },
  disabledButton: {
    backgroundColor: '#cccccc',
  },
  actionButtonText: {
    color: 'white',
    fontWeight: '600',
    fontSize: 14,
  },
  connectionStatusContainer: {
    marginTop: 16,
    borderRadius: 8,
    padding: 12,
  },
  connectionStatus: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  connectionText: {
    marginLeft: 8,
    fontSize: 15,
    fontWeight: '500',
  },
  themeNote: {
    fontSize: 14,
    fontStyle: 'italic',
    marginTop: 12,
  },
  systemControlled: {
    fontSize: 14,
    backgroundColor: '#f1f1f1',
    paddingVertical: 4,
    paddingHorizontal: 8,
    borderRadius: 4,
  },
  aboutRow: {
    flexDirection: 'row',
    paddingVertical: 10,
    borderBottomWidth: 1,
    borderBottomColor: '#eaeaea',
  },
  aboutLabel: {
    fontSize: 16,
    fontWeight: '600',
    width: 80,
  },
  aboutValue: {
    fontSize: 16,
    flex: 1,
  },
  aboutDescription: {
    marginTop: 16,
    marginBottom: 16,
  },
  aboutDescriptionText: {
    fontSize: 15,
    lineHeight: 22,
  },
  legalInfo: {
    padding: 12,
    borderRadius: 8,
  },
  legalInfoText: {
    fontSize: 13,
    marginBottom: 4,
  },
  footer: {
    padding: 16,
    marginBottom: 20,
  },
  footerText: {
    fontSize: 12,
    textAlign: 'center',
    fontStyle: 'italic',
  },
  adminSection: {
    marginTop: 20,
    padding: 15,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#e0e0e0',
  },
  adminSectionTitle: {
    fontSize: 18,
    fontWeight: '600',
    color: '#0a7ea4',
    marginBottom: 15,
  },
  notificationInput: {
    padding: 12,
    borderRadius: 6,
    borderWidth: 1,
    borderColor: '#ddd',
    marginBottom: 10,
    fontSize: 16,
  },
  notificationMessageInput: {
    height: 100,
    textAlignVertical: 'top',
  },
  sendButton: {
    height: 45,
    borderRadius: 8,
    marginTop: 10,
    marginBottom: 10,
  },
  clearButton: {
    marginTop: 10,
  },
  adminNote: {
    fontSize: 12,
    fontStyle: 'italic',
    textAlign: 'center',
    marginTop: 5,
  },
});