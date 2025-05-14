import React, { useEffect, useState, useCallback } from 'react';
import { View, FlatList, Dimensions, ActivityIndicator, StyleSheet, RefreshControl, Text, useColorScheme } from 'react-native';
import { Card, Colors as UIColors, LoaderScreen, TouchableOpacity } from 'react-native-ui-lib';
import auth from '@react-native-firebase/auth';
import { router } from 'expo-router';
import { Ionicons } from '@expo/vector-icons';
import { getFavorites, downloadFavoriteAnimalsData, loadLocalFavoriteAnimalsData } from '../../src/firebase/favorites';
import { useConnection } from '../../src/utils/ConnectionManager';
import { Colors } from '../../constants/Colors';
import { ThemedText } from '../../components/ThemedText';
import { ThemedView } from '../../components/ThemedView';

interface FavoriteItem {
  id: string;
  animalId: string;
  animalName: string;
  animalType: 'species' | 'individual';
  individualId?: string;
  timestamp: Date;
  photoUrl?: string;
  individualName?: string;
}

const Favorites = () => {
  const [favorites, setFavorites] = useState<FavoriteItem[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [viewMode, setViewMode] = useState<'all' | 'species' | 'individuals'>('all');
  const { isConnected, syncData } = useConnection();
  const colorScheme = useColorScheme();
  const theme = colorScheme === 'dark' ? 'dark' : 'light';

  const screenWidth = Dimensions.get('window').width;

  const loadFavorites = useCallback(async () => {
    try {
      const user = auth().currentUser;
      if (!user) {
        setError('You must be logged in to view favorites');
        return;
      }

      // Get favorites from our offline-capable system
      const favoritesData = await getFavorites();
      
      if (favoritesData.length === 0) {
        setFavorites([]);
        return;
      }

      // Load animal data from local storage
      const animalDataMap = await loadLocalFavoriteAnimalsData();
      
      // Enrich favorites with animal data
      const enrichedFavorites = favoritesData.map(favorite => {
        const animalData = animalDataMap[favorite.animalId];
        
        // For individual animals, get the individual's name and photo from personal data
        let individualName = '';
        let photoUrl = animalData?.photo || '';
        
        if (favorite.animalType === 'individual' && favorite.individualId && animalData?.personal) {
          const individualData = animalData.personal.find(p => p.docid === favorite.individualId);
          if (individualData) {
            individualName = individualData.name || '';
            photoUrl = individualData.photo || animalData?.photo || '';
          }
        }
        
        return {
          ...favorite,
          photoUrl,
          individualName
        };
      });

      setFavorites(enrichedFavorites);
      
      // If online, download latest data for offline use
      if (isConnected) {
        await downloadFavoriteAnimalsData();
      }
    } catch (err) {
      console.error('Error fetching favorites:', err);
      setError('Error loading favorites. Please try again.');
    }
  }, [isConnected]);

  // Initial load
  useEffect(() => {
    const fetchData = async () => {
      setLoading(true);
      await loadFavorites();
      setLoading(false);
    };

    fetchData();
  }, [loadFavorites]);

  const onRefresh = useCallback(async () => {
    setRefreshing(true);
    if (isConnected) {
      await syncData();
    }
    await loadFavorites();
    setRefreshing(false);
  }, [loadFavorites, syncData, isConnected]);

  const navigateToAnimal = (item: FavoriteItem) => {
    if (item.animalType === 'individual' && item.individualId) {
      router.push({
        pathname: '/(detail)/[detail]',
        params: { id: item.individualId, other: item.animalId }
      });
    } else {
      router.push({
        pathname: '/(animal)/[animal]',
        params: { id: item.animalId }
      });
    }
  };
  
  const toggleViewMode = (mode: 'all' | 'species' | 'individuals') => {
    setViewMode(mode);
  };
  
  // Filter favorites based on the selected view mode
  const filteredFavorites = favorites.filter(item => {
    if (viewMode === 'all') return true;
    if (viewMode === 'species') return item.animalType === 'species';
    if (viewMode === 'individuals') return item.animalType === 'individual';
    return true;
  });

  if (loading) {
    return (
      <ThemedView style={styles.loadingContainer}>
        <LoaderScreen message="Loading your favorites..." color={Colors[theme].tint} />
      </ThemedView>
    );
  }

  if (error) {
    return (
      <ThemedView style={styles.errorContainer}>
        <Ionicons name="alert-circle-outline" size={48} color={UIColors.red30} />
        <ThemedText style={styles.errorText}>{error}</ThemedText>
      </ThemedView>
    );
  }

  if (favorites.length === 0) {
    return (
      <ThemedView style={styles.emptyContainer}>
        <Ionicons 
          name="heart-outline" 
          size={64} 
          color={theme === 'dark' ? UIColors.grey40 : UIColors.dark40} 
        />
        <ThemedText type="subtitle" style={styles.emptyTitle}>No favorites yet</ThemedText>
        <ThemedText style={styles.emptyText}>
          Animals you favorite will appear here. Tap the heart icon on any animal page to add it to your favorites.
        </ThemedText>
        <TouchableOpacity
          style={styles.refreshButton}
          onPress={onRefresh}
        >
          <Ionicons name="refresh" size={16} color="white" style={styles.refreshIcon} />
          <ThemedText style={styles.refreshButtonText}>Refresh</ThemedText>
        </TouchableOpacity>
      </ThemedView>
    );
  }

  return (
    <ThemedView style={styles.container}>
      <View style={styles.header}>
        <View style={styles.headerRow}>
          <ThemedText type="title" style={styles.headerTitle}>
            Your Favorites
          </ThemedText>
          {!isConnected && (
            <View style={styles.offlineIndicator}>
              <Ionicons name="cloud-offline-outline" size={16} color={UIColors.yellow30} />
              <ThemedText style={styles.offlineText}>Offline</ThemedText>
            </View>
          )}
        </View>
        <ThemedText style={styles.headerSubtitle}>
          {isConnected 
            ? "View and manage your favorite animals" 
            : "Offline mode - your favorites are available even without internet"}
        </ThemedText>
      </View>
      
      {/* View Mode Toggle */}
      <View style={[styles.viewModeContainer, { backgroundColor: theme === 'dark' ? '#2C2C2E' : '#F5F5F7' }]}>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'all' && styles.viewModeButtonActive]}
          onPress={() => toggleViewMode('all')}
        >
          <ThemedText style={[
            styles.viewModeText, 
            viewMode === 'all' && styles.viewModeTextActive,
            viewMode === 'all' && { color: 'white' } // Force white text on active button regardless of theme
          ]}>
            All
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'species' && styles.viewModeButtonActive]}
          onPress={() => toggleViewMode('species')}
        >
          <ThemedText style={[
            styles.viewModeText, 
            viewMode === 'species' && styles.viewModeTextActive,
            viewMode === 'species' && { color: 'white' } // Force white text on active button regardless of theme
          ]}>
            Species
          </ThemedText>
        </TouchableOpacity>
        <TouchableOpacity
          style={[styles.viewModeButton, viewMode === 'individuals' && styles.viewModeButtonActive]}
          onPress={() => toggleViewMode('individuals')}
        >
          <ThemedText style={[
            styles.viewModeText, 
            viewMode === 'individuals' && styles.viewModeTextActive,
            viewMode === 'individuals' && { color: 'white' } // Force white text on active button regardless of theme
          ]}>
            Individuals
          </ThemedText>
        </TouchableOpacity>
      </View>
      
      <FlatList
        data={filteredFavorites}
        keyExtractor={(item) => item.id}
        renderItem={({ item }) => (
          <Card 
            style={[styles.card, { backgroundColor: theme === 'dark' ? '#2C2C2E' : 'white' }]} 
            onPress={() => navigateToAnimal(item)}
          >
            <Card.Section
              imageSource={item.photoUrl ? { uri: item.photoUrl } : require('../../assets/images/home/welcome.png')}
              imageStyle={styles.cardImage}
            />
            <View style={styles.cardContent}>
              <ThemedText style={styles.cardTitle}>
                {item.animalType === 'individual' && item.individualName 
                  ? item.individualName 
                  : item.animalName}
              </ThemedText>
              <ThemedText style={styles.cardSubtitle}>
                {item.animalType === 'individual' 
                  ? (item.individualName ? item.animalName : 'Individual Animal')
                  : 'Species'}
              </ThemedText>
            </View>
          </Card>
        )}
        numColumns={screenWidth > 768 ? 2 : 1}
        contentContainerStyle={styles.listContent}
        refreshControl={
          <RefreshControl 
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={[Colors[theme].tint]}
            tintColor={Colors[theme].tint}
          />
        }
      />
    </ThemedView>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    padding: 20,
    paddingBottom: 10,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    marginBottom: 8,
  },
  headerTitle: {
    flex: 1,
  },
  headerSubtitle: {
    opacity: 0.7,
    marginBottom: 10,
    fontSize: 16,
  },
  offlineIndicator: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 204, 0, 0.1)',
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  offlineText: {
    marginLeft: 4,
    fontSize: 12,
    color: UIColors.yellow30,
  },
  viewModeContainer: {
    flexDirection: 'row',
    marginHorizontal: 20,
    marginBottom: 15,
    borderRadius: 8,
    overflow: 'hidden',
  },
  viewModeButton: {
    flex: 1,
    paddingVertical: 10,
    alignItems: 'center',
    justifyContent: 'center',
  },
  viewModeButtonActive: {
    backgroundColor: '#0a7ea4',
  },
  viewModeText: {
    fontWeight: '600',
  },
  viewModeTextActive: {
    color: 'white',
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
    textAlign: 'center',
    marginTop: 16,
    color: UIColors.red30,
    fontSize: 16,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  emptyTitle: {
    marginTop: 16,
    marginBottom: 8,
  },
  emptyText: {
    textAlign: 'center',
    opacity: 0.6,
    maxWidth: 300,
    marginBottom: 20,
    fontSize: 16,
  },
  refreshButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#0a7ea4',
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginTop: 12,
  },
  refreshIcon: {
    marginRight: 8,
  },
  refreshButtonText: {
    color: 'white',
    fontWeight: '600',
  },
  listContent: {
    padding: 10,
  },
  card: {
    flex: 1,
    margin: 10,
    borderRadius: 12,
    overflow: 'hidden',
  },
  cardImage: {
    height: 160,
    width: '100%',
  },
  cardContent: {
    padding: 16,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 4,
  },
  cardSubtitle: {
    fontSize: 14,
    opacity: 0.7,
  },
});

export default Favorites;