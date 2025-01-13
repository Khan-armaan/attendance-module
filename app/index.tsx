import { View, Image } from "react-native";
import { useEffect } from "react";
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    const timer = setTimeout(() => {
      router.replace('/login');
    }, 500); // 1 second delay

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 bg-[#F47373]">
      <Image 
        source={require('../assets/images/splash.jpeg')}
        style={{ width: '100%', height: '100%', alignSelf: 'center' }}
        resizeMode="cover"
      />
    </View>
  );
}
