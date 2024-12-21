import { createContext, useContext, useEffect, useState } from 'react';
import UserData from '../types';
import AsyncStorage from '@react-native-async-storage/async-storage';

interface UserContextType {
  userData: UserData | null;
  setUserData: (data: UserData | null) => void;
  isLoading: boolean;
}

export const UserContext = createContext<UserContextType | undefined>(undefined);

export function UserProvider({ children }: { children: React.ReactNode }) {
  const [userData, setUserData] = useState<UserData | null>(null);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadUserData();
  }, []);

  const loadUserData = async () => {
    try {
      const storedUser = await AsyncStorage.getItem('userData');
      if (storedUser) {
        setUserData(JSON.parse(storedUser));
      }
    } catch (error) {
      console.error('Error loading user data:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const setUserDataAndStore = async (data: UserData | null) => {
    try {
      if (data) {
        await AsyncStorage.setItem('userData', JSON.stringify(data));
      } else {
        await AsyncStorage.removeItem('userData');
      }
      setUserData(data);
    } catch (error) {
      console.error('Error storing user data:', error);
    }
  };

  return (
    <UserContext.Provider value={{ 
      userData, 
      setUserData: setUserDataAndStore,
      isLoading 
    }}>
      {children}
    </UserContext.Provider>
  );
}

export function useUser() {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
} 