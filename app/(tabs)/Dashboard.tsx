import { Text, View, ScrollView, ActivityIndicator } from "react-native";
import { useState, useEffect } from "react";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useUser } from '../../contexts/UserContext';


interface AppointmentItem {
  service_type_id?: number;
  service_detail_id?: number;
  service_type_name: string;
  duration: string;
  service_price?: number;
}

interface Appointment {
  appointment_id: number;
  order_id: string;
  appointmentDate: string;
  appointmentTime: string;
  itemsSelected: AppointmentItem[];
  user_name: string;
  user_phone: string;
  status: string;
  grandTotal: number;
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const { userData } = useUser();
  useEffect(() => {
    fetchAppointments();
  }, []);

  const fetchAppointments = async () => {
    try {
      const response = await fetch(`https://api-stage.feelaxo.com/api/staff/appointments?staff_id=${userData?.id}`);
      const json = await response.json();  // converting the response to json format
      setAppointments(json.data);  // setting the appointments 
    } catch (error) {
      console.error('Error fetching appointments:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
      <View className="mb-6">
        <Text className="text-2xl font-bold text-gray-800">Today's Appointments</Text>
      </View>

      {appointments.map((appointment) => (
        <View 
          key={appointment.appointment_id} 
          className="bg-white rounded-xl mb-4 shadow-sm"
        >
          <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
            <Text className="text-base font-bold text-gray-800">
              {appointment.order_id}
            </Text>
            <View className={`px-3 py-1 rounded-full ${
              appointment.status === 'cancelled' 
                ? 'bg-red-100' 
                : 'bg-green-100'
            }`}>
              <Text className={`text-xs capitalize ${
                appointment.status === 'cancelled'
                  ? 'text-red-800'
                  : 'text-green-800'
              }`}>
                {appointment.status}
              </Text>
            </View>
          </View>

          <View className="p-4">
            <View className="space-y-2">
              <View className="flex-row items-center">
                <Icon name="user" size={16} className="text-gray-500" />
                <Text className="ml-2 text-gray-600">
                  {appointment.user_name}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Icon name="phone" size={16} className="text-gray-500" />
                <Text className="ml-2 text-gray-600">
                  {appointment.user_phone}
                </Text>
              </View>

              <View className="flex-row items-center">
                <Icon name="calendar" size={16} className="text-gray-500" />
                <Text className="ml-2 text-gray-600">
                  {formatDate(appointment.appointmentDate)} at {formatTime(appointment.appointmentTime)}
                </Text>
              </View>
            </View>

            <View className="mt-4">
              <Text className="text-sm font-bold text-gray-800 mb-2">
                Services:
              </Text>
              {appointment.itemsSelected.map((item, index) => (
                <Text key={index} className="text-gray-600 ml-2 mb-1">
                  • {item.service_type_name || 'No service selected'}
                  {item.service_price ? ` - ₹${item.service_price}` : ''}
                </Text>
              ))}
            </View>

            <View className="mt-4 pt-3 border-t border-gray-100">
              <Text className="text-right text-base font-bold text-gray-800">
                Total: ₹{appointment.grandTotal}
              </Text>
            </View>
          </View>
        </View>
      ))}
    </ScrollView>
  );
}