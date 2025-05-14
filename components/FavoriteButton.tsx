import React, { useState, useEffect } from 'react';
import { TouchableOpacity, StyleSheet, Animated, ActivityIndicator } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { Colors } from 'react-native-ui-lib';
import auth from '@react-native-firebase/auth';
import { checkFavoriteStatus, toggleFavorite } from '../src/firebase/favorites';
import { useConnection } from '../src/utils/ConnectionManager';

interface FavoriteButtonProps {
  animalId: string;
  animalName: string;
  animalType?: 'species' | 'individual';
  individualId?: string;
  size?: number;
  style?: object;
}

const FavoriteButton: React.FC<FavoriteButtonProps> = ({
  animalId,
  animalName,
  animalType = 'species',
  individualId,
  size = 24,
  style
}) => {
  const [isFavorite, setIsFavorite] = useState(false);
  const [isLoading, setIsLoading] = useState(true);
  const [isProcessing, setIsProcessing] = useState(false);
  const { isConnected } = useConnection();
  const scaleAnim = new Animated.Value(1);

  useEffect(() => {
    const user = auth().currentUser;
    if (!user) {
      setIsLoading(false);
      return;
    }

    const checkStatus = async () => {
      try {
        const status = await checkFavoriteStatus(animalId, animalType, individualId);
        setIsFavorite(status);
      } catch (error) {
        console.error('Error checking favorite status:', error);
      } finally {
        setIsLoading(false);
      }
    };

    checkStatus();
  }, [animalId, animalType, individualId]);

  const handleToggleFavorite = async () => {
    const user = auth().currentUser;
    if (!user) return;

    setIsProcessing(true);

    try {
      // Animate the button
      Animated.sequence([
        Animated.timing(scaleAnim, {
          toValue: 1.3,
          duration: 150,
          useNativeDriver: true,
        }),
        Animated.timing(scaleAnim, {
          toValue: 1,
          duration: 150,
          useNativeDriver: true,
        }),
      ]).start();

      // Toggle favorite status
      const newStatus = await toggleFavorite(animalId, animalName, animalType, individualId);
      
      // Update local state
      setIsFavorite(newStatus);
    } catch (error) {
      console.error('Error toggling favorite:', error);
    } finally {
      setIsProcessing(false);
    }
  };

  if (isLoading) {
    return (
      <TouchableOpacity
        style={[styles.container, style]}
        disabled={true}
      >
        <ActivityIndicator size="small" color={Colors.blue30} />
      </TouchableOpacity>
    );
  }

  return (
    <TouchableOpacity
      style={[styles.container, style]}
      onPress={handleToggleFavorite}
      activeOpacity={0.7}
      disabled={isProcessing}
    >
      <Animated.View style={{ transform: [{ scale: scaleAnim }] }}>
        {isProcessing ? (
          <ActivityIndicator size="small" color={Colors.blue30} />
        ) : (
          <Ionicons
            name={isFavorite ? 'heart' : 'heart-outline'}
            size={size}
            color={isFavorite ? Colors.red30 : Colors.dark40}
          />
        )}
      </Animated.View>
      {!isConnected && (
        <Ionicons
          name="cloud-offline-outline"
          size={12}
          color={Colors.yellow30}
          style={styles.offlineIndicator}
        />
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  container: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(255,255,255,0.9)',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    elevation: 2,
    position: 'relative',
  },
  offlineIndicator: {
    position: 'absolute',
    bottom: 0,
    right: 0,
  }
});

export default FavoriteButton;