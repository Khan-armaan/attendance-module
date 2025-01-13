import React, { useEffect } from 'react';
import { Text } from "react-native";
import { View, TouchableOpacity, Image, ScrollView,  } from "react-native";
import { Link, router } from 'expo-router';
import { useUser } from '../../contexts/UserContext';  // Adjust the import path as needed
import { useState } from 'react';
import { FontAwesome } from '@expo/vector-icons';
import { BackHandler } from 'react-native';
import axios from 'axios';

interface BusinessData {
    name: string;
    business_type: string;
    state_name: string;
    city_name: string;
    area: string;
    address: string;
}



export default function Profile() {
    const { userData, setUserData } = useUser();
    const [showMenu, setShowMenu] = useState(false);
    const [businessData, setBusinessData] = useState<BusinessData | null>(null);

    const handleLogout = async () => {
        try {
            await setUserData(null); // This will clear the stored data
            router.replace('/');
          } catch (error) {
            console.error('Error logging out:', error);
          }
    };

    React.useEffect(() => {
        const onBackPress = () => {
            router.replace('/mark-attendance');
            return true;
        };

        const backHandler = BackHandler.addEventListener(
            'hardwareBackPress',
            onBackPress
        );

        return () => backHandler.remove();
    }, []);
    useEffect(() =>{
        fetchBusinessData();
    },[])
   async function fetchBusinessData(){
   const response =await axios.get(`https://api.feelaxo.com/api/staff/business-details?staff_id=${userData?.id}`)
    setBusinessData(response.data)
    console.log(businessData)
}

    return (
        <View className="flex-1 mb-5">

   




            <ScrollView className="flex-1 px-4">
                {/* Profile Header Section */}
                <View className="bg-white p-8 mb-6 rounded-lg">
                    <View className="items-center">
                        <Image 
                            source={{ uri: userData?.profile }} 
                            className="w-24 h-24 rounded-full"
                        />
                        <Text className="text-xl font-bold mt-4">{userData?.name}</Text>
                        <Text className="text-gray-600">{userData?.job_title}</Text>
                    </View>
                </View>


                <View className="bg-purple-50 p-8 mb-6 rounded-lg border border-purple-100 shadow-sm">
                    <Text className="text-lg font-semibold mb-4 text-purple-900">Business Details</Text>
                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Business Name</Text>
                            <Text className="font-medium text-purple-800">{businessData?.name }</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Business Type</Text>
                            <Text className="font-medium text-purple-800">{businessData?.business_type}</Text>
                        </View>
                        <View className="space-y-1">
                            <Text className="text-gray-700">Address</Text>
                            <Text className="font-medium text-purple-800">
                                {`${businessData?.address || '123, Lotus Avenue, Near Marine Drive,'}\n${businessData?.area || 'Asvini'},\n${businessData?.city_name || 'Mumbai'}, ${businessData?.state_name || 'Maharashtra'}`}
                            </Text>
                        </View>
                    </View>
                </View>

         

                {/* Work Details */}
                <View className="bg-green-50 p-8 mb-6 rounded-lg border border-green-100 shadow-sm">
                    <Text className="text-lg font-semibold mb-4 text-green-900">Work Information</Text>
                    <View className="space-y-3">
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Role</Text>
                            <Text className="font-medium text-green-800">{userData?.role}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Working Hours</Text>
                            <Text className="font-medium text-green-800">{userData?.work_time_from} - {userData?.work_time_to}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Day Off</Text>
                            <Text className="font-medium text-green-800">{userData?.day_off}</Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Joined</Text>
                            <Text className="font-medium text-green-800">
                                {userData?.joining_date ? new Date(userData.joining_date).toLocaleDateString() : 'Not set'}
                            </Text>
                        </View>
                        <View className="flex-row justify-between">
                            <Text className="text-gray-700">Commission</Text>
                            <Text className="font-medium text-green-800">{userData?.commission}%</Text>
                        </View>
                    </View>
                </View>

                           {/* Contact Information */}
                <View className="bg-blue-50 p-8 mb-6 rounded-lg border border-blue-100 shadow-sm">
                    <Text className="text-lg font-semibold mb-4 text-blue-900">Contact Information</Text>
                    <View className="space-y-3">
                        <View className="flex-row items-center">
                            <FontAwesome name="envelope" size={16} color="#3B82F6" />
                            <Text className="ml-3 text-gray-700">{userData?.email}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <FontAwesome name="phone" size={16} color="#3B82F6" />
                            <Text className="ml-3 text-gray-700">{userData?.phone}</Text>
                        </View>
                        <View className="flex-row items-center">
                            <FontAwesome name="map-marker" size={16} color="#3B82F6" />
                            <Text className="ml-3 text-gray-700">{userData?.address || 'Not specified'}</Text>
                        </View>
                    </View>
                </View>
             

                <View className="flex-row justify-center mb-20">
                    <TouchableOpacity 
                        className="flex-row items-center px-4"
                        onPress={() => {
                            handleLogout();
                            setShowMenu(false);
                        }}
                    >
                        <FontAwesome name="sign-out" size={16} color="red" className="mr-2" />
                        <Text className="ml-2 text-red-500">Logout</Text>
                    </TouchableOpacity>
                </View>
            </ScrollView>
        </View> 
    );
}
