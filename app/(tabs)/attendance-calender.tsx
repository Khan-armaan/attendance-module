import { Text, View, Modal, TouchableOpacity, Pressable } from "react-native";
import { Calendar } from 'react-native-calendars';
import { useState, useEffect } from 'react';
import axios from 'axios';
import staffData from '../../data/staffData.json';


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

export default function AttendanceCalendar() {

  // state variables  
  const [selectedDate, setSelectedDate] = useState('');
  const [showModal, setShowModal] = useState(false);
  // attendance data for a specific date
  const [attendanceData, setAttendanceData] = useState<AttendanceResponse | null>(null);
  const [markedDates, setMarkedDates] = useState<Record<string, any>>({});
  const [isLoading, setIsLoading] = useState(false);
 


  // function to fetch attendance for a specific date 
  const fetchAttendance = async (date: string) => {
    try {
      setIsLoading(true);
      const formattedDate = date.split('-').reverse().join('-');
      const response = await axios.get<AttendanceResponse>(
        `https://api-stage.feelaxo.com/api/attendance/staff/${staffData.staffId}?date=${formattedDate}`
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
      console.log(formattedDate)
      const response = await axios.get<AttendanceResponse>(
        `https://api-stage.feelaxo.com/api/attendance/staff/${staffData.staffId}/range?date=${formattedDate}`
      );
      
      const marks: Record<string, any> = {};
      response.data.attendance.forEach(record => {
        const date = record.created_at.split('T')[0];
        const lastStatus = Object.values(record.time).pop();
        
        marks[date] = {
          marked: true,
          dotColor: lastStatus === 'in' ? '#4ade80' : '#ef4444',
          selectedColor: '#2563eb'
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
            dotColor: '#ef4444',
            selectedDotColor: '#ffffff',
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
                  Attendance for {selectedDate}
                </Text>
                {attendanceData?.staff && (
                  <View className="mb-4">
                    <Text className="font-medium">Staff: {attendanceData.staff.staff_name}</Text>
                    <Text>Status: {attendanceData.staff.status}</Text>
                  </View>
                )}
                {attendanceData?.attendance.length ? (
                  attendanceData.attendance.map((entry, index) => (
                    <View key={index} className="border-t border-gray-200 pt-2">
                      {Object.entries(entry.time).map(([time, status]) => (
                        <Text key={time}>
                          {time}: {status}
                        </Text>
                      ))}
                    </View>
                  ))
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