import { Text, View, Modal, TouchableOpacity, Pressable } from "react-native";
import { Calendar } from 'react-native-calendars';
import { useState, useEffect } from 'react';
import axios from 'axios';
import { useUser } from '../../contexts/UserContext';

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
 
  const { userData } = useUser();

  // function to fetch attendance for a specific date 
  const fetchAttendance = async (date: string) => {
    try {
      setIsLoading(true);
      const formattedDate = date.split('-').reverse().join('-');
      const response = await axios.get<AttendanceResponse>(
        `https://api-stage.feelaxo.com/api/attendance/staff/${userData?.id}?date=${formattedDate}`
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
        `https://api-stage.feelaxo.com/api/attendance/staff/${userData?.id}/range?date=${formattedDate}`
      );
      
      const marks: Record<string, any> = {};
      response.data.attendance.forEach(record => {
        const date = record.created_at.split('T')[0];
        const lastStatus = Object.values(record.time).pop();
        
        marks[date] = {
          selected: true,
          selectedColor: lastStatus === 'in' ? '#4ade80' : '#ef4444',
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

  return (
    <View className="flex-1 justify-center items-center bg-white p-4">
      <View className="w-11/12 max-w-xl shadow-xl rounded-xl border border-gray-200">
        <Calendar
          onDayPress={handleDayPress}
          markedDates={{
            ...markedDates,
            [selectedDate]: { 
              ...markedDates[selectedDate],
              selected: true,
              selectedColor: '#2563eb'
            }
          }}
          theme={{
            backgroundColor: '#ffffff',
            calendarBackground: '#ffffff',
            textSectionTitleColor: '#2563eb',
            selectedDayBackgroundColor: '#2563eb',
            selectedDayTextColor: '#ffffff',
            todayTextColor: '#2563eb',
            dayTextColor: '#2d3748',
            textDisabledColor: '#9ca3af',
            monthTextColor: '#1f2937',
            textMonthFontSize: 18,
            textMonthFontWeight: 'bold',
            textDayFontSize: 16,
            textDayHeaderFontSize: 14,
            textDayHeaderFontWeight: 'bold',
          }}
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
            className="bg-white p-6 rounded-lg m-4 w-[80%]"
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
                    <View className="bg-green-100 p-3 rounded-md mb-2">
                      <Text className="font-semibold">TIME IN</Text>
                      <Text>
                        {Object.keys(attendanceData.attendance[0].time)[0]}
                      </Text>
                    </View>
                    
                    <View className="bg-red-100 p-3 rounded-md mb-2">
                      <Text className="font-semibold">OUT OF OFFICE</Text>
                      <Text>
                        {Object.entries(attendanceData.attendance[0].time)
                          .filter(([_, status]) => status === 'out')
                          .slice(-1)[0]?.[0] || 'Still Working'}
                      </Text>
                    </View>
                    
                    <View className="bg-blue-100 p-3 rounded-md">
                      <Text className="font-semibold">DURATION</Text>
                      <Text>
                        {attendanceData?.attendance.length ? (() => {
                          const timeEntries = Object.entries(attendanceData.attendance[0].time);
                          const checkInTime = timeEntries[0]?.[0];
                          const checkOutEntry = timeEntries.filter(([_, status]) => status === 'out').pop();
                          const checkOutTime = checkOutEntry?.[0];
                          
                          console.log('Check-in time:', checkInTime); // For debugging
                          console.log('Check-out time:', checkOutTime); // For debugging
                          
                          return calculateDuration(checkInTime, checkOutTime || "");
                        })() : '-'}
                      </Text>
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