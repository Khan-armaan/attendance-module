import FontAwesome from '@expo/vector-icons/FontAwesome';
import { Link, router, Tabs } from 'expo-router';
import { View, Image, TouchableOpacity, Text } from 'react-native';
import {  useState } from 'react';
import { useUser } from '../../contexts/UserContext';



export default function TabLayout() {
  const [showMenu, setShowMenu] = useState(false);
  const { userData, setUserData } = useUser();


  const handleLogout = async () => {
    try {
        await setUserData(null); // This will clear the stored data
        router.replace('/');
      } catch (error) {
        console.error('Error logging out:', error);
      }
};



  return (
    <View className="flex-1">

      {/**Navbar feelaxo icon  */}
      <View className="h-20 flex-row justify-between items-center px-4 bg-white">
        <Link href="/">
          <Image
            source={require('../../assets/images/icon.jpeg')}
            className="w-14 h-14 rounded-full"
            style={{ resizeMode: 'contain' }}
          />
        </Link>

       {/** user icon on the nav bar */} 
        <View>
          <TouchableOpacity onPress={() => setShowMenu(!showMenu)}>
            <View className="w-10 h-10 rounded-full bg-gray-200 justify-center items-center">
            {userData?.profile ? (
                                <Image 
                                    source={{uri: userData.profile}}
                                    className="w-14 h-14 rounded-full"
                                    style={{ resizeMode: 'cover' }}
                                 />
                                  ) : (
                                        <FontAwesome name="user" size={24} color="gray" />
                                            )}
             
            </View>
          </TouchableOpacity>

          {showMenu && (
            <View className="absolute top-12 right-0 bg-white rounded-lg shadow-lg w-40 py-2 z-50">
              <TouchableOpacity 
                className="flex-row items-center px-4 py-2 hover:bg-gray-100"
                onPress={() => {
                  router.replace('/profile')
                  setShowMenu(false);
                }}
              >
                <FontAwesome name="cog" size={16} color="gray" className="mr-2" />
                <Text className="ml-2">Profile</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                className="flex-row items-center px-4 py-2 hover:bg-gray-100"
                onPress={() => {
                  setShowMenu(false);
                }}
              >
                <FontAwesome name="sign-out" size={16} color="red" className="mr-2" />
                <Text className="ml-2 text-red-500" onPress={() => {
                                             handleLogout();
                                             setShowMenu(false);
                 
                }}>Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>





      {/** this is the pages tab at the bottom of the screen  */}
      <Tabs screenOptions={{ tabBarActiveTintColor: 'blue', headerShown: false }}>
        <Tabs.Screen
          name="mark-attendance"
          options={{
            title: 'Check In',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="home" color={color} />,
          }}
        />
        <Tabs.Screen
          name="attendance-calender"
          options={{
            title: 'Attendance',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="calendar" color={color} />,
          }}
        />
          <Tabs.Screen
          name="Dashboard"
          options={{
            title: 'Dashboard',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="th-large" color={color} />,
          }}
        />
           <Tabs.Screen
          name="sales"
          options={{
            title: 'Sales',
            tabBarIcon: ({ color }) => <FontAwesome size={28} name="line-chart" color={color} />,
          }}
        />
      </Tabs>

        
        

    </View>
  );
}
