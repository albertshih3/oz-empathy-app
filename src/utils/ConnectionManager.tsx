import React, { createContext, useContext, useState, useEffect } from 'react';
import NetInfo, { NetInfoState } from '@react-native-community/netinfo';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { syncFavorites } from '../firebase/favorites';
import { downloadAllAnimalsData } from '../firebase/animalCache';

interface ConnectionContextType {
  isConnected: boolean | null;
  syncData: () => Promise<void>;
  isDownloadingAnimals: boolean;
}

const ConnectionContext = createContext<ConnectionContextType>({
  isConnected: null,
  syncData: async () => {},
  isDownloadingAnimals: false,
});

export const useConnection = () => useContext(ConnectionContext);

export const ConnectionProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [isConnected, setIsConnected] = useState<boolean | null>(null);
  const [isDownloadingAnimals, setIsDownloadingAnimals] = useState<boolean>(false);
  const [autoDownload, setAutoDownload] = useState<boolean>(true);

  useEffect(() => {
    // Load auto-download setting
    const loadSettings = async () => {
      try {
        const autoDownloadSetting = await AsyncStorage.getItem('oz_auto_download');
        // Default to true if setting doesn't exist
        setAutoDownload(autoDownloadSetting !== 'false');
      } catch (error) {
        console.error('Error loading auto-download setting:', error);
      }
    };
    
    loadSettings();
    
    // Initial connection check
    NetInfo.fetch().then((state) => {
      setIsConnected(state.isConnected);
      
      // Download animal data on startup if connected and auto-download is enabled
      if (state.isConnected && autoDownload) {
        downloadAnimalData();
      }
    });

    // Subscribe to network changes
    const unsubscribe = NetInfo.addEventListener((state: NetInfoState) => {
      setIsConnected(state.isConnected);

      // When connection is restored, sync data
      if (state.isConnected) {
        // Always sync favorites when connection is restored
        syncFavorites().catch(error => {
          console.error('Error syncing favorites on connection restore:', error);
        });
        
        // Download animals data if connection is restored and auto-download is enabled
        if (autoDownload) {
          downloadAnimalData();
        }
      }
    });

    return () => {
      unsubscribe();
    };
  }, [autoDownload]);

  const downloadAnimalData = async () => {
    if (isDownloadingAnimals) return;
    
    try {
      setIsDownloadingAnimals(true);
      await downloadAllAnimalsData();
    } catch (error) {
      console.error('Error downloading animal data:', error);
    } finally {
      setIsDownloadingAnimals(false);
    }
  };

  const syncData = async () => {
    const networkState = await NetInfo.fetch();
    if (networkState.isConnected) {
      await syncFavorites();
      await downloadAnimalData();
    }
  };

  // Force check connection status
  const checkConnection = async () => {
    try {
      const state = await NetInfo.fetch();
      setIsConnected(state.isConnected);
      return state.isConnected;
    } catch (error) {
      console.error('Error checking connection status:', error);
      return false;
    }
  };

  // Update auto-download setting
  useEffect(() => {
    const updateAutoDownloadSetting = async () => {
      try {
        const setting = await AsyncStorage.getItem('oz_auto_download');
        if (setting !== null) {
          setAutoDownload(setting === 'true');
        }
      } catch (error) {
        console.error('Error updating auto-download setting:', error);
      }
    };
    
    // Add listener for storage changes
    const interval = setInterval(updateAutoDownloadSetting, 5000);
    
    return () => {
      clearInterval(interval);
    };
  }, []);

  return (
    <ConnectionContext.Provider value={{ isConnected, syncData, isDownloadingAnimals }}>
      {children}
    </ConnectionContext.Provider>
  );
};