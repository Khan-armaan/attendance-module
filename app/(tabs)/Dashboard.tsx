import { Text, View, ScrollView, ActivityIndicator, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState, useEffect } from "react";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';  // Import Axios
import Toast from 'react-native-toast-message';

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

interface CompletedAppointmentItem {
  service_type_id: number;
  service_type_name: string;
  duration: string;
  service_detail_id: number;
  service_price: number;
}

interface CompletedAppointment {
  appointment_id: number;
  business_id: number;
  order_id: string;
  staffMemberId: number;
  WhatsAppOTP: number;
  appointmentDate: string;
  appointmentTime: string;
  itemsSelected: CompletedAppointmentItem[];
  cartTotal: string;
  paidAmount: number;
  balanceAmaount: number;
  discount: number;
  grandTotal: number;
  gst_value: number;
  gst_percentage: number;
  paymentId: string;
  invoice: string | null;
  couponApplied: number;
  couponCode: string | null;
  paymentType: string;
  bookedFrom: string;
  notes: string | null;
  user_id: number;
  user_name: string;
  user_email: string;
  user_phone: string;
  otp: number;
  is_otp_verified: number;
  status: string;
  created_at: string;
  commission: string;
}

export default function Dashboard() {
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { userData } = useUser();
  const [completedAppointments, setCompletedAppointments] = useState<CompletedAppointment[]>([]);

  useEffect(() => {
    fetchAppointments();
    fetchCompletedAppointments();
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

  const fetchCompletedAppointments = async () => {
    try {
      const response = await axios.get(`https://api-stage.feelaxo.com/api/staff/completed-orders?staff_id=${userData?.id}`);
      setCompletedAppointments(response.data.data);
    } catch (error) {
      console.error('Error fetching completed appointments:', error);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    return timeString.substring(0, 5);
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const handleCompleteAppointment = async () => {
    if (selectedAppointment) {
      try {
        const response = await axios.put('https://api-stage.feelaxo.com/api/staff/appointment/update', {
          appointment_id: selectedAppointment.appointment_id,
          status: 'completed',
        });
      console.log(response)
      if (response) {
        Toast.show({
          type: 'success',
          text1: 'Success',
          text2: 'Successfully updated the appointment',
          position: 'bottom',
          visibilityTime: 2000,
        });
        fetchAppointments(); // Refresh appointments after update
      } else {
        Toast.show({
          type: 'error',
          text1: 'Error',
          text2: 'Failed to update the status of the appointment',
          position: 'bottom',
          visibilityTime: 2000,
        });
      }
      } catch (error) {
        console.error('Error updating appointment:', error);
        alert('Failed to update the status of the appointment');
      }
    }
  };

  if (loading) {
    return (
      <View className="flex-1 justify-center items-center">
        <ActivityIndicator size="large" color="#0066cc" />
      </View>
    );
  }

  return (
    <>
      <ScrollView className="flex-1 bg-gray-50 px-4 py-6">
        <View className="mb-6">
          <Text className="text-2xl font-bold text-gray-800">Upcoming Appointments</Text>
        </View>

        {appointments.length === 0 ? (  // Check if there are no appointments
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">No upcoming appointments</Text>
          </View>
        ) : (
          appointments.map((appointment) => (
            <TouchableOpacity 
              key={appointment.appointment_id} 
              onPress={() => handleAppointmentPress(appointment)}
            >
              <View className="bg-white rounded-xl mb-4 shadow-sm">
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
            </TouchableOpacity>
          ))
        )}

        <View className="mb-6 mt-8">
          <Text className="text-2xl font-bold text-gray-800">Completed Appointments</Text>
        </View>

        {completedAppointments.length === 0 ? (
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">No completed appointments</Text>
          </View>
        ) : (
          completedAppointments.map((appointment) => (
            <TouchableOpacity 
              key={appointment.appointment_id} 
              onPress={() => handleAppointmentPress(appointment)}
            >
              <View className="bg-white rounded-xl mb-4 shadow-sm">
                <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                  <Text className="text-base font-bold text-gray-800">
                    {appointment.order_id}
                  </Text>
                  <View className={`px-3 py-1 rounded-full ${
                    appointment.status === 'completed' 
                      ? 'bg-green-100' 
                      : 'bg-red-100'
                  }`}>
                    <Text className={`text-xs capitalize ${
                      appointment.status === 'completed'
                        ? 'text-green-800'
                        : 'text-red-800'
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
                    <Text className="text-right text-sm text-gray-600">
                      Commission: ₹{appointment.commission}
                    </Text>
                  </View>
                </View>
              </View>
            </TouchableOpacity>
          ))
        )}
      </ScrollView>

      {/* Modal for displaying appointment details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black bg-opacity-50">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="bg-white rounded-lg p-4 w-11/12 relative">
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)} 
                  className="absolute top-4 right-4"
                >
                  <Text className="text-blue-500">Close</Text>
                </TouchableOpacity>
                {selectedAppointment && (
                  <>
                    <Text className="text-lg font-bold">{selectedAppointment.order_id}</Text>
                    <Text>Date: {formatDate(selectedAppointment.appointmentDate)}</Text>
                    <Text>Time: {formatTime(selectedAppointment.appointmentTime)}</Text>
                    <Text>Name: {selectedAppointment.user_name}</Text>
                    <Text>Phone: {selectedAppointment.user_phone}</Text>
                    <Text>Status: {selectedAppointment.status}</Text>
                    <Text>Total: ₹{selectedAppointment.grandTotal}</Text>
                    <Text>Services:</Text>
                    {selectedAppointment.itemsSelected.map((item, index) => (
                      <Text key={index}>
                        • {item.service_type_name || 'No service selected'} {item.service_price ? `- ₹${item.service_price}` : ''}
                      </Text>
                    ))}

                    {/* Conditionally render the Completed button */}
                    {selectedAppointment.status !== 'completed' && selectedAppointment.status !== 'cancelled'  ? (
                      <TouchableOpacity 
                        onPress={handleCompleteAppointment} 
                        className="bg-blue-500 rounded px-4 py-2 mt-4"
                      >
                        <Text className="text-white text-center">Completed</Text>
                      </TouchableOpacity>
                    ) : (null)}
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
    </>
  );
}