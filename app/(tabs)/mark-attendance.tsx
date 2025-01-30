import { Text, View, TouchableOpacity } from "react-native";
import { useEffect } from "react";
import Icon from 'react-native-vector-icons/FontAwesome';
import Toast from 'react-native-toast-message';
import { useUser } from '../../contexts/UserContext';
import { useState} from 'react';
import axios from 'axios';

import { Link, router } from 'expo-router';
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
    const [attendanceData, setAttendanceData] = useState<any>(null);
    const [upcomingAppointments, setUpcomingAppointments] = useState(0);
    const [completedAppointments, setCompletedAppointments] = useState(0);
    const [walkInAppointments, setWalkInAppointments] = useState(0);
    const [todaySales, setTodaySales] = useState(0);
    const [todayCommission, setTodayCommission] = useState(0);
    
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
   

    // Add this new function to fetch attendance data
    const fetchAttendanceData = async () => {
        try {
            const currentDate = new Date().toLocaleDateString('en-GB', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric'
            });
            const response = await axios.get(`https://api.feelaxo.com/api/attendance/staff/${userData?.id}?date=${currentDate}`);
            setAttendanceData(response.data);
            
            // Update check-in/out times if attendance data exists
            if (response.data.attendance && response.data.attendance.length > 0) {
                const timeEntries = Object.entries(response.data.attendance[0].time);
                if (timeEntries.length > 0) {
                    // First check-in
                    const firstEntry = timeEntries[0];
                    if (firstEntry[1] === 'in') {
                        setCheckInTime(firstEntry[0]);
                        setCheckedIn(true);
                    }
                    
                    // Last check-out
                    const lastEntry = timeEntries[timeEntries.length - 1];
                    if (lastEntry[1] === 'out') {
                        setCheckedOut(true);
                    }
                }
            }
        } catch (error) {
            console.error('Error fetching attendance:', error);
        }
    };

    // Add this useEffect to fetch attendance data when component mounts
    useEffect(() => {
        if (userData?.id) {
            fetchAttendanceData();
        }
    }, [userData?.id]);

    // Add this new function to fetch appointments
    const fetchAppointments = async () => {
        try {
            const response = await axios.get(`https://api.feelaxo.com/api/staff/appointments?staff_id=${userData?.id}`);
            // Count appointments that are not cancelled and have future dates
            const count = response.data.data.filter(appointment => {
                const appointmentDate = new Date(`${appointment.appointmentDate.split('T')[0]} ${appointment.appointmentTime}`);
                return appointment.status !== 'cancelled' && appointmentDate > new Date();
            }).length;
            setUpcomingAppointments(count);
        } catch (error) {
            console.error('Error fetching appointments:', error);
        }
    };

    // Add this useEffect to fetch appointments when component mounts
    useEffect(() => {
        if (userData?.id) {
            fetchAppointments();
        }
    }, [userData?.id]);

    // Add this new function to fetch completed orders
    const fetchCompletedOrders = async () => {
        try {
            const response = await axios.get(`https://api.feelaxo.com/api/staff/completed-orders?staff_id=${userData?.id}&page=1&limit=10`);
            const today = new Date().toISOString().split('T')[0];
            
            let dailySales = 0;
            let dailyCommission = 0;
            
            // Filter and calculate totals for completed POS appointments
            const todayCompletedOrders = response.data.data.filter(appointment => {
                const appointmentDate = appointment.appointmentDate.split('T')[0];
                return appointmentDate === today && appointment.status === 'completed';
            });

            todayCompletedOrders.forEach(order => {
                dailySales += parseFloat(order.grandTotal);
                dailyCommission += parseFloat(order.commission || 0);
            });

            setCompletedAppointments(todayCompletedOrders.length);
            
            // Update the running totals
            setTodaySales(prev => prev + dailySales);
            setTodayCommission(prev => prev + dailyCommission);
        } catch (error) {
            console.error('Error fetching completed orders:', error);
        }
    };

    // Add this useEffect to fetch completed orders when component mounts
    useEffect(() => {
        if (userData?.id) {
            fetchCompletedOrders();
        }
    }, [userData?.id]);

    // Add this new function to fetch walk-in appointments
    const fetchWalkInAppointments = async () => {
        try {
            const response = await axios.get(`https://api.feelaxo.com/api/staff/walk-in?staff_id=${userData?.id}`);
            const today = new Date().toISOString().split('T')[0];
            
            let dailySales = 0;
            let dailyCommission = 0;

            // Filter and calculate totals for walk-in appointments
            const todayWalkIns = response.data.data.filter(appointment => {
                const appointmentDate = appointment.delivery_date.split('T')[0];
                return appointmentDate === today && appointment.status === 'completed';
            });

            todayWalkIns.forEach(order => {
                dailySales += parseFloat(order.gross_total);
                dailyCommission += parseFloat(order.commission || 0);
            });

            setWalkInAppointments(todayWalkIns.length);
            
            // Update the running totals
            setTodaySales(prev => prev + dailySales);
            setTodayCommission(prev => prev + dailyCommission);
        } catch (error) {
            console.error('Error fetching walk-in appointments:', error);
        }
    };

    // Add this useEffect to fetch walk-in appointments when component mounts
    useEffect(() => {
        if (userData?.id) {
            fetchWalkInAppointments();
        }
    }, [userData?.id]);

    return (
        <>
            <View className="flex-1 bg-gray-100 p-4">
                {/* Welcome Header */}
                <View className="bg-white rounded-xl p-4 shadow-md">
                    <Text className="text-xl font-bold">Welcome {userData?.name}!</Text>
                    <Text className="text-gray-600 text-sm">Last login: {currentTime} {currentDate}</Text>
                </View>

                {/* Stats Grid */}
                <View className="flex-row justify-between mt-4 gap-4">
                    <View className="flex-1 bg-white rounded-xl p-4 shadow-md">
                        <Text className="text-gray-600">Today Sales</Text>
                        <Text className="text-lg font-bold">₹{todaySales.toFixed(2)}</Text>
                    </View>
                    <View className="flex-1 bg-white rounded-xl p-4 shadow-md">
                        <Text className="text-gray-600">Today Commission</Text>
                        <Text className="text-lg font-bold">₹{todayCommission.toFixed(2)}</Text>
                    </View>
                </View>

                <View className="flex-row justify-between mt-4 gap-4">
                    <View className="flex-1 bg-white rounded-xl p-4 shadow-md">
                        <Text className="text-gray-600">Appointments</Text>
                        <Text className="text-lg font-bold">Upcoming: {upcomingAppointments}</Text>
                    </View>
                    <View className="flex-1 bg-white rounded-xl p-4 shadow-md">
                        <Text className="text-gray-600">Service Completed</Text>
                        <View className="flex-row justify-between">
                            <Text className="font-bold">Walk-in: {walkInAppointments}</Text>
                            <Text className="font-bold">POS: {completedAppointments}</Text>
                        </View>
                    </View>
                </View>

                {/* Attendance Box */}
                <View className="bg-white rounded-xl p-4 shadow-md mt-4">
                    <Text className="text-lg font-bold mb-2">Today Attendance</Text>
                    <View className="flex-row justify-between mb-4">
                        <View>
                            <Text className="text-gray-600">Check-in:</Text>
                            <Text className="font-bold">{checkInTime || '--:--'}</Text>
                        </View>
                        <View>
                            <Text className="text-gray-600">Check-out:</Text>
                            <Text className="font-bold">
                                {attendanceData?.attendance?.[0]?.time && 
                                 Object.entries(attendanceData.attendance[0].time)
                                    .filter(([_, status]) => status === 'out')
                                    .pop()?.[0] || '--:--'}
                            </Text>
                        </View>
                    </View>

                    {/* Staff Information */}
                    <View className="space-y-7">
                        <View className="flex-row items-center">
                            <Icon name="id-badge" size={20} color="#666" />
                            <Text className="text-gray-600 ml-3">Staff ID: {userData?.id}</Text>
                        </View>
                        <View className="flex-row items-center mt-2 ">
                            <Icon name="briefcase" size={20} color="#666" />
                            <Text className="text-gray-600 ml-3">Position: {userData?.job_title}</Text>
                        </View>
                        <View className="flex-row items-center mt-2 ">
                            <Icon name="calendar" size={20} color="#666" />
                            <Text className="text-gray-600 ml-3">Date: {currentDate}</Text>
                        </View>
                        <View className="flex-row items-center mt-2">
                            <Icon name="clock-o" size={20} color="#666" />
                            <Text className="text-gray-600 ml-3">Time: {currentTime}</Text>
                        </View>
                    </View>
                </View>

                {/* Check In/Out Buttons */}
                <View className="mt-8">
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
                            className="bg-gray-700 py-3  rounded-xl"
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

                <Link href="../attendance-calender" asChild>
                    <Text className="text-blue-500 text-center font-semibold mt-4">
                        Show Calendar
                    </Text>
                </Link>
            </View>
            <Toast />
        </>
    );
}

