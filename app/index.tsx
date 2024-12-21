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
    <View className=" bg-[#F47373]">
      <Image 
        source={require('../assets/images/splash.png')}
        style={{ width: '95%', height: '95%',  }}
        
      />
    </View>
  );
}
