import { Text, View, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import { useUser } from '../../contexts/UserContext';
import { useState} from 'react';
import axios from 'axios';

import * as Location from 'expo-location';

export default function MarkAttendance() {
    // states variables 
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [coordinates, setCoordinates] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null); 
    const [isTracking, setIsTracking] = useState(false);
    const [checkInTime, setCheckInTime] = useState<string | null>(null)
    const [checkedIn, setCheckedIn] = useState(false)
    const [checkedOut, setCheckedOut] = useState(false)
    const [lastApiUpdate, setLastApiUpdate] = useState<Date | null>(null);
    
    const { userData } = useUser();  // to get the user information

        async function getCurrentLocation() {
            try {
           
              let { status } = await Location.requestForegroundPermissionsAsync();
          
              
              if (status !== 'granted') {
                setErrorMsg('Permission to access location was denied');
                return null;
              }
          
           
              let location = await Location.getCurrentPositionAsync({
                accuracy: Location.Accuracy.High, // Changed to High accuracy
                mayShowUserSettingsDialog: true
              });
              
           
              
              if (location.coords.accuracy && location.coords.accuracy > 100) {
                setErrorMsg('Location accuracy is too low. Please check your GPS settings.');
                return null;
              }
              
              setCoordinates(location);
              return location;
            } catch (error) {
              console.error('Detailed location error:', error);
              setErrorMsg('Error getting location: ' + error);
              return null;
            }
          }



    // created a clock 
    useEffect(() => {
        updateDateTime();
        // Update time every second
        const timer = setInterval(() => {
            updateDateTime();
        }, 1000);
        return () => clearInterval(timer);
    }, []);


    const updateDateTime = () => {
        const now = new Date();
        setCurrentDate(now.toLocaleDateString('en-GB', {
            day: '2-digit',
            month: 'short',
            year: 'numeric'
        }));

        setCurrentTime(now.toLocaleTimeString('en-US', {
            hour: '2-digit',
            minute: '2-digit',
            second: '2-digit',
            hour12: false
        }));
    };




    //created a function to check in
   async function checkIn(){
        // Prevent multiple check-ins
        if (checkedIn) {
            Toast.show({
                type: 'info',
                text1: 'Already Checked In',
                text2: 'You have already checked in for today',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }

        // Get initial location before checking in
        const currentLocation = await getCurrentLocation();

        if (!currentLocation) {
            Toast.show({
                type: 'error',
                text1: 'Location Error',
                text2: 'Unable to get your location. Please try again.',
                position: 'top',
            });
            return;
        }

        try {
            const response = await axios.put('https://api.feelaxo.com/api/attendance/status', {
                staff_id: userData?.id,
                lat: currentLocation.coords.latitude,
                long: currentLocation.coords.longitude,
            });

            // Handle time object response
            if (typeof response.data.time === 'object')  {
                // Get the last entry from the time object
                const timeEntries = Object.entries(response.data.time);
                const lastEntry = timeEntries[timeEntries.length - 1];
                const [lastTime, status] = lastEntry;

                if (status === 'out') {
                    Toast.show({
                        type: 'error',
                        text1: 'Location',
                        text2: 'You are not in the office',
                        position: 'top',
                        visibilityTime: 3000,
                    });
                    return;
                }

                setCheckInTime(lastTime);
            } else {
                // Handle single time string response
                setCheckInTime(response.data.time);
            }

            setIsTracking(true);
            setCheckedIn(true);

            Toast.show({
                type: 'success',
                text1: 'Check In',
                text2: response.data.message,
                position: 'top',
                visibilityTime: 3000,
            });
        } catch (error: any) {
            console.error('CheckIn error:', error.response?.data || error.message);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: error.response?.data?.message || 'Error checking in',
                position: 'top',
                visibilityTime: 3000,
            });
        }
   }




   //created a function to check out
   async function checkOut(){
        // Prevent multiple check-outs
        if (checkedOut) {
            Toast.show({
                type: 'info',
                text1: 'Already Checked Out',
                text2: 'You have already checked out for today',
                position: 'top',
                visibilityTime: 3000,
            });
            return;
        }
              // Get initial location before checking in
              const currentLocation = await getCurrentLocation();

              if (!currentLocation) {
                  Toast.show({
                      type: 'error',
                      text1: 'Location Error',
                      text2: 'Unable to get your location. Please try again.',
                      position: 'top',
                  });
                  return;
              }

        try {
            const response = await axios.put('https://api.feelaxo.com/api/attendance/status', {
               staff_id: userData?.id,
               lat: currentLocation.coords.latitude,
               long: currentLocation.coords.longitude,
             
        });
      
            
            setIsTracking(false);
            setCheckedOut(true);

           

            Toast.show({
                type: 'success',
                text1: 'Check Out',
                text2: 'check out successfull',
                position: 'top',
                visibilityTime: 3000,
            });
        } catch (error) {
            console.error('Error checking out:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Error checking out',
                position: 'top',
                visibilityTime: 3000,
            });
        }
   }


   // Add new useEffect for continuous location tracking and API updates
   useEffect(() => {
        let locationInterval: NodeJS.Timeout;
        
        if (checkedIn && !checkedOut) {
            locationInterval = setInterval(async () => {
                const now = new Date();
                // Only update if last update was more than 10 minutes ago
                if (!lastApiUpdate || now.getTime() - lastApiUpdate.getTime() >= 600000) {
                    const currentLocation = await getCurrentLocation();
                    if (currentLocation && userData?.id) {
                        try {
                            await axios.put('https://api.feelaxo.com/api/attendance/status', {
                                staff_id: userData.id,
                                lat: currentLocation.coords.latitude,
                                long: currentLocation.coords.longitude,
                            });
                            setLastApiUpdate(now);
                        } catch (error) {
                            console.error('Location update error:', error);
                        }
                    }
                }
            }, 600000); // Check every 10 minutes instead of 5 seconds
        }

        return () => {
            if (locationInterval) {
                clearInterval(locationInterval);
            }
        };
    }, [checkedIn, checkedOut, userData?.id, lastApiUpdate]);


    return (
        <>
            <View className="flex-1 bg-gray-100 p-4 justify-center">
                <View className="bg-white rounded-3xl p-8 shadow-md my-8 border-2 border-black">
                   
                    <View className="items-center mb-8">
                       
                        <Text className="text-2xl font-bold mt-4">{userData?.name}</Text>
                    </View>

                    
                    <View className="space-y-4">
                        <View className="flex-row items-center mb-3">
                            <Icon name="id-badge" size={20} color="#666" />
                            <Text className="text-gray-600 ml-3">Staff ID: {userData?.id}</Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <Icon name="briefcase" size={20} color="#666" />
                            <Text className="text-gray-600 ml-3">Position: {userData?.job_title}</Text>
                        </View>
                        
                       
                     
                        <View className="flex-row items-center mb-3">
                            <Icon name="calendar-o" size={20} color="#666" />
                            <Text className="text-gray-600 ml-3">Date: {currentDate}</Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <Icon name="clock-o" size={20} color="#666" />
                            <Text className="text-gray-600 ml-3">Time: {currentTime}</Text>
                          
                        </View>
                      
                    </View>

                
                    <View className="mt-8">
                        <Text className="text-center font-bold text-lg mb-6">TODAY'S ATTENDANCE STATUS</Text>

                        {checkedIn ? (
                            <TouchableOpacity 
                                className="bg-gray-700 py-4 rounded-xl mb-4"
                                disabled={true}
                            >
                                <Text className="text-white text-center font-semibold">
                                    Check in time: {typeof checkInTime === 'string' ? checkInTime : JSON.stringify(checkInTime)}
                                </Text>
                            </TouchableOpacity>
                        ) : (
                            <TouchableOpacity 
                                className="bg-[#2C3E50] py-4 rounded-xl mb-4"
                                onPress={checkIn}
                            >
                                <Text className="text-white text-center font-semibold">Check in</Text>
                            </TouchableOpacity>
                        )}

                        {checkedIn && !checkedOut ? (
                            <TouchableOpacity 
                                className="bg-gray-700 py-3 rounded-xl"
                                onPress={checkOut}
                            >
                                <Text className="text-white text-center font-semibold">Check Out</Text>
                            </TouchableOpacity>
                        ) : checkedIn && checkedOut ? (
                            <TouchableOpacity 
                                className="bg-gray-700 py-3 rounded-xl"
                                disabled={true}
                            >
                                <Text className="text-white text-center font-semibold">Checked Out</Text>
                            </TouchableOpacity>
                        ) : null}
                    </View>
                </View>
            </View>
            <Toast />
        </>
    );
}

