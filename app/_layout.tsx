import "../global.css";
import { Stack } from 'expo-router';
import { UserProvider } from '../contexts/UserContext';
import Toast from 'react-native-toast-message';

export default function Layout() {
  return (<>
    <UserProvider>
      <Stack screenOptions={{ headerShown: false }}>
        
        <Stack.Screen name="index" />
      </Stack>
    </UserProvider>
     <Toast />
     </>
  );
}