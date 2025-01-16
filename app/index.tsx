import { View } from "react-native";
import { Video } from 'expo-av';
import { useEffect } from "react";
import { router } from 'expo-router';

export default function SplashScreen() {
  useEffect(() => {
    // Remove the timer-based navigation
  }, []);

  return (
    <View className="flex-1 bg-[#F47373]">
      <Video
        source={require('../assets/images/splash.mp4')}
        style={{ width: '100%', height: '100%' }}
        resizeMode="cover"
        shouldPlay={true}
        isLooping={false}
        isMuted={true}
        onPlaybackStatusUpdate={(status) => {
          if (status.isLoaded && status.didJustFinish) {
            router.replace('/login');
          }
        }}
      />
    </View>
  );
}
