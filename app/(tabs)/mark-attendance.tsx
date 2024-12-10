import { Text, View, TouchableOpacity } from "react-native";
import { useState, useEffect } from "react";
import Icon from 'react-native-vector-icons/FontAwesome';
import staffData from '../../data/staffData.json';
import axios from "axios"
import * as Location from 'expo-location';
import Toast from 'react-native-toast-message';
import { useUser } from '../../contexts/UserContext';

export default function MarkAttendance() {
    // states variables 
    const [currentTime, setCurrentTime] = useState('');
    const [currentDate, setCurrentDate] = useState('');
    const [location, setLocation] = useState<Location.LocationObject | null>(null);
    const [errorMsg, setErrorMsg] = useState<string | null>(null); 
    const [isTracking, setIsTracking] = useState(false);
    const [checkInTime, setCheckInTime] = useState<string | null>(null)
    const [checkedIn, setCheckedIn] = useState(false)
    const [checkedOut, setCheckedOut] = useState(false)
    
    const { userData } = useUser();
    
    let numberOfRequest = 0          // global variable for the number of request sent 
    


    useEffect(() => {
        let locationInterval: NodeJS.Timeout | null = null;
          
        async function getCurrentLocation() {
            console.log('Getting current location...');
            
            let { status } = await Location.requestForegroundPermissionsAsync();
            if (status !== 'granted') {
                console.log('Location permission denied');
                setErrorMsg('Permission to access location was denied');
                return;
            }
            
            let location = await Location.getCurrentPositionAsync({});
            console.log('New location:', {
                latitude: location.coords.latitude,
                longitude: location.coords.longitude
            });
            setLocation(location);
        }

        // Initial location fetch
        getCurrentLocation();

        if (isTracking) {
            // Start location tracking
            locationInterval = setInterval(() => {
                getCurrentLocation();
            }, 1000 * 60 * 10);
             // Every 10 minutes
        }

        return () => {
            if (locationInterval) clearInterval(locationInterval);
        };
    }, [isTracking]); // Add isTracking to dependency array
      let text = 'Waiting...';  // this all code is there since the location can be empty  
      let long = 0;
      let lat = 0;
      if (errorMsg) {
        text = errorMsg;
      } else if (location) {
        text = JSON.stringify(location.coords);
        long = location.coords.longitude;
        lat = location.coords.latitude;
       
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

        try {
            const response = await axios.put('https://api-stage.feelaxo.com/api/attendance/status', {
                staff_id: userData?.id,
                lat: lat,
                long: long,
                status: "in"
            });

            setIsTracking(true);
            const now = new Date().toLocaleTimeString('en-US', {
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
                hour12: false
            });
            setCheckInTime(now);
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

        try {
            const response = await axios.put('https://api-stage.feelaxo.com/api/attendance/status', {
                staff_id: userData?.id,
                lat: lat,
                long: long,
                status: "out"
            });
            
            setIsTracking(false);
            setCheckedOut(true);

           

            Toast.show({
                type: 'success',
                text1: 'Check Out',
                text2: response.data.message,
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

    return (
        <>
            <View className="flex-1 bg-gray-100 p-4 justify-center">
                <View className="bg-white rounded-3xl p-8 shadow-md my-8">
                   
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
                            <Icon name="calendar" size={20} color="#666" />
                            <Text className="text-gray-600 ml-3">Joining Date: {userData?.joining_date}</Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <Icon name="phone" size={20} color="#666" />
                            <Text className="text-gray-600 ml-3">Phone: {userData?.phone}</Text>
                        </View>
                        <View className="flex-row items-center mb-3">
                            <Icon name="map-marker" size={20} color="#666" />
                            <Text className="text-gray-600 ml-3">Address: {userData?.address}</Text>
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
                                <Text className="text-white text-center font-semibold">Check in time {checkInTime}</Text>
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

