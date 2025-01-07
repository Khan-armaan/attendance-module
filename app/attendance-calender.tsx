import { Text, View, Modal, Pressable, TouchableOpacity, Image } from "react-native";
import { Calendar } from 'react-native-calendars';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../contexts/UserContext';
import { Link, router } from 'expo-router';
import FontAwesome from 'react-native-vector-icons/FontAwesome';

// there is the api issue for getting of the chech out time of the response 


// type for attendance response
interface AttendanceResponse {
  staff: {
    staff_id: number;
    staff_name: string;
    status: string;
  };
  attendance: Array<{
    time: Record<string, 'in' | 'out'>;
    created_at: string;
    updated_at: string;
  }>;
}

// Add this utility function at the top of the file
const calculateDuration = (checkIn: string, checkOut: string): string => {
  if (!checkIn || !checkOut) return 'Still Working';
  
  try {
    // Ensure the time strings are in "HH:mm" format
    const [checkInHour, checkInMinute] = checkIn.split(':').map(Number);
    const [checkOutHour, checkOutMinute] = checkOut.split(':').map(Number);
    
    if (isNaN(checkInHour) || isNaN(checkInMinute) || isNaN(checkOutHour) || isNaN(checkOutMinute)) {
      return 'Invalid time format';
    }
    
    const start = new Date(2000, 0, 1, checkInHour, checkInMinute);
    const end = new Date(2000, 0, 1, checkOutHour, checkOutMinute);
    
    const diffMs = end.getTime() - start.getTime();
    const hours = Math.floor(diffMs / (1000 * 60 * 60));
    const minutes = Math.floor((diffMs % (1000 * 60 * 60)) / (1000 * 60));
    
    return `${hours}h ${minutes}m`;
  } catch (error) {
    console.error('Duration calculation error:', error);
    return 'Error calculating duration';
  }
};

export default function AttendanceCalendar() {

  // state variables  
  const [selectedDate, setSelectedDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  // attendance data for a specific date
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
  const [showMenu, setShowMenu] = useState(false);
 
  const { userData } = useUser();

  // function to fetch attendance for a specific date 
  const fetchAttendance = async (date: string) => {
    try {
      setIsLoading(true);
      const formattedDate = date.split('-').reverse().join('-');
      const response = await axios.get<AttendanceResponse>(
        `https://api.feelaxo.com/api/attendance/staff/${userData?.id}?date=${formattedDate}`
      );
     
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance:', error);
    } finally {
      setIsLoading(false);
    }
  };


  // function to handle day press on specific date of the calender 
  const handleDayPress = (day: any) => {
    setSelectedDate(day.dateString);
    setShowModal(true);
    fetchAttendance(day.dateString);
  };


  // function to fetch attendance for a range of dates
  const fetchAttendanceRange = async () => {
    try {
      setIsLoading(true);
      const today = new Date();
      const formattedDate = `${today.getDate().toString().padStart(2, '0')}-${(today.getMonth() + 1).toString().padStart(2, '0')}-${today.getFullYear()}`;
      const response = await axios.get<AttendanceResponse>(
        `https://api.feelaxo.com/api/attendance/staff/${userData?.id}/range?date=${formattedDate}`
      );
      
      const marks: Record<string, any> = {};
      response.data.attendance.forEach(record => {
        const date = record.created_at.split('T')[0];
        // Check if any status in the time object is "in"
        const hasInStatus = Object.values(record.time).includes('in');
        
        marks[date] = {
          selected: true,
          selectedColor: hasInStatus ? '#4ade80' : '#ef4444', // green if present, red if absent
          disableTouchEvent: false
        };
      });
      
      setMarkedDates(marks);
      setAttendanceData(response.data);
    } catch (error) {
      console.error('Error fetching attendance range:', error);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    fetchAttendanceRange();
  }, []);

  // Add logout handler
  const handleLogout = () => {
    router.replace('/login');
  };

  return (  


    
    <View className="flex-1 bg-white">
      {/* Navbar */}
      <View className="h-20 flex-row justify-between items-center px-4 bg-white shadow-sm">
        <Link href="/">
          <Image
            source={require('../assets/images/icon.jpeg')}
            className="w-14 h-14 rounded-full"
            style={{ resizeMode: 'contain' }}
          />
        </Link>

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
                  handleLogout();
                  setShowMenu(false);
                }}
              >
                <FontAwesome name="sign-out" size={16} color="red" className="mr-2" />
                <Text className="ml-2 text-red-500">Sign Out</Text>
              </TouchableOpacity>
            </View>
          )}
        </View>
      </View>

      {/* Added spacing container */}
      <View className="mt-6">
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: { 
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: '#3b82f6'
            },
            [new Date().toISOString().split('T')[0]]: {
              selected: true,
              selectedColor: '#3b82f6'
            }
          }}
          maxDate={new Date().toISOString().split('T')[0]}
          hideExtraDays={true}
          disableAllTouchEventsForDisabledDays={true}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#000000',
            selectedDayBackgroundColor: '#6B7280',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#000000',
            dayTextColor: '#000000',
            textDisabledColor: '#d9d9d9',
            monthTextColor: '#000000',
            textMonthFontSize: 24,
            textMonthFontWeight: 'bold',
            textDayFontSize: 16,
            textDayHeaderFontSize: 12,
            textDayFontWeight: '400',
            textDayHeaderFontWeight: '400',
            stylesheet: {
              calendar: {
                header: {
                  flexDirection: 'row',
                  justifyContent: 'space-between',
                  paddingLeft: 10,
                  paddingRight: 10,
                  marginTop: 8,
                  alignItems: 'center',
                }
              }
            },
            arrowColor: '#000000',
          }}
          enableSwipeMonths={true}
        />
      </View>

      <Modal
        transparent={true}
        visible={showModal}
        onRequestClose={() => setShowModal(false)}
      >
        <Pressable 
          className="flex-1 justify-center items-center bg-black/50"
          onPress={() => setShowModal(false)}
        >
          <Pressable 
            className="bg-white p-6 rounded-lg m-4 w-[90%] max-h-[80%]"
            onPress={(e) => e.stopPropagation()}
          >
            {isLoading ? (
              <Text>Loading...</Text>
            ) : (
              <>
                <Text className="text-lg font-semibold mb-4">
                  Attendance Details - {selectedDate}
                </Text>
                {attendanceData?.attendance.length ? (
                  <View>
                    {/* Table Header */}
                    <View className="flex-row border-b border-gray-200 pb-2 mb-2">
                      <Text className="flex-1 font-bold text-gray-700">Time In</Text>
                      <Text className="flex-1 font-bold text-gray-700">Time Out</Text>
                      <Text className="flex-1 font-bold text-gray-700">Duration</Text>
                    </View>

                    {/* Table Content */}
                    <View className="max-h-[400px]">
                      {(() => {
                        const timeEntries = Object.entries(attendanceData.attendance[0].time)
                          .map(([time, status]) => ({ time, status }));

                        let inOutPairs: { in: string; out: string }[] = [];
                        let currentIn: string | null = null;

                        timeEntries.forEach((entry) => {
                          if (entry.status === 'in') {
                            currentIn = entry.time;
                          } else if (entry.status === 'out' && currentIn) {
                            inOutPairs.push({
                              in: currentIn,
                              out: entry.time
                            });
                            currentIn = null;
                          }
                        });

                        // If there's a remaining "in" without an "out"
                        if (currentIn) {
                          inOutPairs.push({
                            in: currentIn,
                            out: ''
                          });
                        }

                        return inOutPairs.map((pair, index) => (
                          <View key={index} className="flex-row py-2 border-b border-gray-100">
                            <Text className="flex-1 text-green-600">{pair.in}</Text>
                            <Text className="flex-1 text-red-600">
                              {pair.out || 'Not checked out'}
                            </Text>
                            <Text className="flex-1 text-blue-600">
                              {calculateDuration(pair.in, pair.out)}
                            </Text>
                          </View>
                        ));
                      })()}
                    </View>
                  </View>
                ) : (
                  <Text className="text-gray-500">No attendance records found</Text>
                )}
              </>
            )}
          </Pressable>
        </Pressable>
      </Modal>
    </View>
  );
}