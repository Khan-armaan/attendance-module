import React from 'react';
import { Text } from "react-native";
import { View, TouchableOpacity, Image, ScrollView,  } from "react-native";
import { Link, router, Stack } from 'expo-router';
import { useUser } from '../contexts/UserContext';  // Adjust the import path as needed
import { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { useFocusEffect } from '@react-navigation/native';
import { BackHandler } from 'react-native';

export default function Profile() {
    const { userData } = useUser();
    const [showMenu, setShowMenu] = useState(false);

    useFocusEffect(
        React.useCallback(() => {
            const onBackPress = () => {
                router.replace('/mark-attendance');
                return true; // Prevent default back action
            };

            // Add event listener for back action
            const backHandler = BackHandler.addEventListener(
                'hardwareBackPress',
                onBackPress
            );

            // Clean up the event listener on unmount
            return () => backHandler.remove();
        }, [])
    );

    return (
        <View className="flex-1 bg-gray-50">
            {/**Navbar feelaxo icon  */}
            <View className="h-20 flex-row justify-between items-center px-4 bg-white">
                <Link href="/">
                    <Image
                        source={require('../assets/images/icon.jpeg')}
                        className="w-10 h-10"
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
                                    className="w-6 h-6"
                                    style={{ resizeMode: 'contain' }}
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
                        </View>
                    )}
                </View>
            </View>

            <ScrollView className="flex-1">
                {/* Profile Header Section */}
                <View className="bg-white p-6 mb-4">
                    <View className="items-center">
                        <Image 
                            source={{ uri: userData?.profile }} 
                            className="w-24 h-24 rounded-full"
                        />
                        <Text className="text-xl font-bold mt-4">{userData?.name}</Text>
                        <Text className="text-gray-600">{userData?.job_title}</Text>
                    </View>
                </View>

                {/* Contact Information */}
                <View className="bg-white p-6 mb-4">
                    <Text className="text-lg font-semibold mb-4">Contact Information</Text>
                    <View className="space-y-3">
                        <View className="flex-row items-center">
                            <FontAwesome name="envelope" size={16} color="gray" />
                            <Text className="ml-3 text-gray-600">{userData?.email}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <FontAwesome name="phone" size={16} color="gray" />
                            <Text className="ml-3 text-gray-600">{userData?.phone}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <FontAwesome name="map-marker" size={16} color="gray" />
                            <Text className="ml-3 text-gray-600">{userData?.address || 'Not specified'}</Text>
                        </View>
                    </View>
                </View>

                {/* Work Details */}
                <View className="bg-white p-6 mb-4">
                    <Text className="text-lg font-semibold mb-4">Work Information</Text>
                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Role</Text>
                            <Text className="font-medium">{userData?.role}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Working Hours</Text>
                            <Text className="font-medium">{userData?.work_time_from} - {userData?.work_time_to}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Day Off</Text>
                            <Text className="font-medium">{userData?.day_off}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Joined</Text>
                            <Text className="font-medium">
                                {userData?.joining_date ? new Date(userData.joining_date).toLocaleDateString() : 'Not set'}
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-600">Commission</Text>
                            <Text className="font-medium">{userData?.commission}%</Text>
                        </View>
                    </View>
                </View>
            </ScrollView>
        </View>
    );
}