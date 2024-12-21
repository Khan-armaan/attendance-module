import "../global.css";
import { Stack } from 'expo-router';
import { UserProvider } from '../contexts/UserContext';
import Toast from 'react-native-toast-message';
import { Slot, Redirect } from 'expo-router';
import { useUser } from '../contexts/UserContext';
import { ActivityIndicator } from 'react-native';

function AuthenticationWrapper() {
  const { userData, isLoading } = useUser();

  if (isLoading) {
    return <ActivityIndicator size="large" color="#0066cc" />;
  }

  if (userData?.id) {
    return <Redirect href="/Dashboard" />;
  }

  return <Slot />;
}

export default function Layout() {
  return (
    <>
      <UserProvider>
        <Stack screenOptions={{ headerShown: false }}>
          <AuthenticationWrapper />
          <Stack.Screen name="index" />
        </Stack>
      </UserProvider>
      <Toast />
    </>
  );
}