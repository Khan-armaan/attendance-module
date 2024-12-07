import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, Tabs } from 'expo-router';
import { View, Image } from 'react-native';
//if using the Tabs from the ex

export default function TabLayout() {
  return (
    <View className="flex-1">
      <View className="h-20 justify-center items-start px-4 bg-white">
    <Link href="/"><Image
           source={require('../../assets/images/icon.jpeg')}
          className="w-10 h-10"
          style={{ resizeMode: 'contain' }}
        /></Link>   
      </View>
      <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', headerShown: false }}>
        <Tabs.Screen
          name="mark-attendance"
          options={{
            title: 'Home',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="attendance-calender"
          options={{
            title: 'Calender',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar" color={color} />,
          }}
        />
      </Tabs>
    </View>
  );
}
