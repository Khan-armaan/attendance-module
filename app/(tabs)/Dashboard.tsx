import { Text, View, ScrollView, ActivityIndicator, Modal, TouchableOpacity, TouchableWithoutFeedback, Keyboard } from "react-native";
import { useState, useEffect } from "react";
import Icon from 'react-native-vector-icons/FontAwesome';
import { useUser } from '../../contexts/UserContext';
import axios from 'axios';  
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

import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { Redirect } from "expo-router";


const Tab = createMaterialTopTabNavigator();


export default function Dashboard() {
  const { userData } = useUser();
if (!userData?.id){
  return <Redirect href='/'></Redirect>
}

  return (
  <>
     <Tab.Navigator>
      <Tab.Screen name="Upcoming" component={UpcomingAppointments} />
     <Tab.Screen name="Completed" component={CompletedAppointments} />
    </Tab.Navigator>
   </>
  );
}

function UpcomingAppointments(){

  const [currentPage, setCurrentPage] = useState(1);
  const [totalPages, setTotalPages] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);

  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
  const [modalVisible, setModalVisible] = useState(false);
  const { userData } = useUser();
  const [notificationModal, setNotificationModal] = useState(false);
  const [notificationMessage, setNotificationMessage] = useState('');
  const [completed, setCompleted] = useState(false)



  useEffect(() => {
    fetchAppointments(1);
   fetchCompletedAppointments()
  }, [completed]);

  const fetchAppointments = async (page: number) => {
    try {
      setIsLoadingMore(true);
      const response = await axios.get(
        `https://api.feelaxo.com/api/staff/appointments`, {
          params: {
            staff_id: userData?.id,
            page: page,
            limit: 10
          }
        }
      );
      
      if (response.data && response.data.data) {
        if (page === 1) {
          setAppointments(response.data.data);
        } else {
          setAppointments(prev => [...prev, ...response.data.data]);
        }
        
        const meta = response.data.meta;
        setTotalPages(meta.total_pages || Math.ceil(meta.total_records / meta.limit));
        setCurrentPage(meta.current_page);
      } else {
        setAppointments([]);
        setTotalPages(1);
        setCurrentPage(1);
      }
    } catch (error: any) {
      console.error('Error fetching appointments:', error.response?.data || error.message);
      setAppointments([]);
      setTotalPages(1);
      setCurrentPage(1);
      
      Toast.show({
        type: 'error',
        text1: 'Error',
        text2: 'Failed to fetch appointments',
        position: 'top',
        visibilityTime: 3000,
      });
    } finally {
      setLoading(false);
      setIsLoadingMore(false);
    }
  };

  const loadMore = () => {
    if (currentPage < totalPages && !isLoadingMore) {
      fetchAppointments(currentPage + 1);
    }
  };

  const fetchCompletedAppointments = async () => {
    try {
      const response = await axios.get(`https://api-stage.feelaxo.com/api/staff/completed-orders?staff_id=${userData?.id}`);
     
    } catch (error) {
      console.error('Error fetching completed appointments:', error);
    }
  };

 

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  const formatTime = (timeString: string) => {
    const [hours, minutes] = timeString.split(':');
    const hour = parseInt(hours);
    const ampm = hour >= 12 ? 'PM' : 'AM';
    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
    return `${formattedHour}:${minutes} ${ampm}`;
  };

  const handleAppointmentPress = (appointment: Appointment) => {
    setSelectedAppointment(appointment);
    setModalVisible(true);
  };

  const handleCompleteAppointment = async () => {
    if (selectedAppointment) {
      try {
        const response = await axios.put('https://api.feelaxo.com/api/staff/appointment/update', {
          appointment_id: selectedAppointment.appointment_id,
          status: 'completed',
        });
        setCompleted(true)
     
      if (response.status ) {
        setModalVisible(false)
    //   alert("appointment status updated successfully")
       setNotificationMessage('Appointment status updated successfully');
    //  setNotificationModal(true);
      
    Toast.show({
      type: 'success',
     text1: 'Done',
     text2: 'Appointment status updated successfully',
    position: 'top',
      visibilityTime: 3000,
});
       await fetchAppointments(1); // Refresh appointments after update
       setTimeout(() => {
        setNotificationModal(false);
      }, 2000);
       
      } else {
   //    alert('appointment status not updated')
       setNotificationMessage('Failed to update the status of the appointment');
    //  setNotificationModal(true);
    Toast.show({
      type: 'success',
     text1: 'Error',
     text2: 'Failed to update the status of the appointment',
    position: 'top',
      visibilityTime: 3000,
}); 
    await fetchAppointments(1)

        setTimeout(() => {
          setNotificationModal(false);
        }, 2000);
      }
      } catch (error) {
        setNotificationMessage('Failed to update the status of the appointment')
        setNotificationModal(true);
        console.error('Error updating appointment:', error);
    
      }
    }
  };
  return<>
    <ScrollView className="flex-1 bg-gray-50 px-2 py-6">
        <View className="mb-6 mt-8 flex-row justify-between items-center px-2">
          <Text className="text-2xl font-bold text-gray-800">Upcoming Appointments</Text>
          <TouchableOpacity 
            onPress={() => fetchAppointments(1)}
            className="bg-blue-500 px-3 py-2 rounded-lg flex-row items-center ml-2"
          >
            <Icon name="refresh" size={14} color="white" className="mr-1" />
            <Text className="text-white font-medium text-sm">Refresh</Text>
          </TouchableOpacity>
        </View>

        {!appointments || appointments.length === 0 ? (  // Modified this line to check for undefined
          <View className="flex-1 justify-center items-center">
            <Text className="text-lg text-gray-600">No upcoming appointments</Text>
          </View>
        ) : (
          appointments.map((appointment) => (
            <TouchableOpacity 
              key={appointment.appointment_id} 
              onPress={() => handleAppointmentPress(appointment)}
            >
              <View className="bg-white rounded-xl mb-4 shadow-sm border border-black">
                <View className="flex-row justify-between items-center p-4  border-gray-100">
                  <Text className="text-base font-bold text-gray-800">
                    {appointment.order_id}
                  </Text>
                  <View className={`px-3 py-1 rounded-full border border-black ${
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
 {/* Add Load More button at the bottom */}
 {currentPage < totalPages && (
        <TouchableOpacity 
          onPress={loadMore}
          className="bg-blue-500 rounded px-4 py-2 mt-4 mb-14"
          disabled={isLoadingMore}
        >
          <Text className="text-white text-center">
            {isLoadingMore ? 'Loading...' : 'Load More'}
          </Text>
        </TouchableOpacity>
      )}

      
      </ScrollView>

      {/* Modal for displaying appointment details */}
      <Modal
        visible={modalVisible}
        transparent={true}
        animationType="slide"
      >
        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
          <View className="flex-1 justify-center items-center bg-black/50">
            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
              <View className="bg-white rounded-lg p-4 w-11/12 relative">
                <TouchableOpacity 
                  onPress={() => setModalVisible(false)} 
                  className="absolute top-4 right-4"
                >
                
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
                    {selectedAppointment && 'commission' in selectedAppointment ? (
                      <Text>Commission: ₹{(selectedAppointment as CompletedAppointment).commission}</Text>
                    ) : null}
                    
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
                        <Text className="text-white text-center">Complete</Text>
                      </TouchableOpacity>
                    ) : (null)}
                  </>
                )}
              </View>
            </TouchableWithoutFeedback>
          </View>
        </TouchableWithoutFeedback>
      </Modal>
      <Modal 
       visible={notificationModal}
       transparent={true}
       animationType="fade"
       >
        <View className="flex-1 justify-center items-center">
        <View className="bg-black bg-opacity-70 px-6 py-4 rounded-lg">
          <Text className="text-white text-center">
            {notificationMessage}
          </Text>
        </View>
      </View>
       </Modal>
    
    </>
  
}






                function  CompletedAppointments(){
                  
                  const [currentPage, setCurrentPage] = useState(1);
                  const [totalPages, setTotalPages] = useState(1);
                  const [isLoadingMore, setIsLoadingMore] = useState(false);
                  
                  const [completedAppointments, setCompletedAppointments] = useState<CompletedAppointment[]>([]);
                  const [loading, setLoading] = useState(true);
                  const [selectedAppointment, setSelectedAppointment] = useState<Appointment | null>(null);
                  const [modalVisible, setModalVisible] = useState(false);
                  const { userData } = useUser();
                  const [notificationModal, setNotificationModal] = useState(false);
                  const [notificationMessage, setNotificationMessage] = useState('');
                  const [refresh, setRefresh] = useState(false)

                  useEffect(() => {
                    fetchCompletedAppointments(1);
                  }, []);

                  const fetchCompletedAppointments = async (page: number) => {
                    try {
                      setIsLoadingMore(true);
                      const response = await axios.get(
                        `https://api.feelaxo.com/api/staff/completed-orders?staff_id=${userData?.id}&page=${page}&limit=10`
                      );
                      
                      if (page === 1) {
                        setCompletedAppointments(response.data.data);
                      } else {
                        setCompletedAppointments(prev => [...prev, ...response.data.data]);
                      }
                      
                      setTotalPages(response.data.meta.total_pages);
                      setCurrentPage(response.data.meta.current_page);
                      setLoading(false);
                    } catch (error) {
                      console.error('Error fetching completed appointments:', error);
                    } finally {
                      setIsLoadingMore(false);
                    }
                  };

                  const loadMore = () => {
                    if (currentPage < totalPages && !isLoadingMore) {
                      fetchCompletedAppointments(currentPage + 1);
                    }
                  };

                  const formatDate = (dateString: string) => {
                    return new Date(dateString).toLocaleDateString();
                  };

                  const formatTime = (timeString: string) => {
                    const [hours, minutes] = timeString.split(':');
                    const hour = parseInt(hours);
                    const ampm = hour >= 12 ? 'PM' : 'AM';
                    const formattedHour = hour % 12 || 12; // Convert 0 to 12 for 12 AM
                    return `${formattedHour}:${minutes} ${ampm}`;
                  };

                  const handleAppointmentPress = (appointment: Appointment) => {
                    setSelectedAppointment(appointment);
                    setModalVisible(true);
                  };

                  const handleCompleteAppointment = async () => {
                    if (selectedAppointment) {
                      try {
                        const response = await axios.put('https://api.feelaxo.com/api/staff/appointment/update', {
                          appointment_id: selectedAppointment.appointment_id,
                          status: 'completed',
                        });
                    
                      if (response.status ) {
                        setModalVisible(false)
                    //   alert("appointment status updated successfully")
                      setNotificationMessage('Appointment status updated successfully');
                      setNotificationModal(true);
                    await fetchCompletedAppointments(1)
                      setTimeout(() => {
                        setNotificationModal(false);
                      }, 2000);
                      
                      } else {
                  //    alert('appointment status not updated')
                      setNotificationMessage('Failed to update the status of the appointment');
                      setNotificationModal(true);
                      await fetchCompletedAppointments(1)

                        setTimeout(() => {
                          setNotificationModal(false);
                        }, 2000);
                      }
                      } catch (error) {
                        setNotificationMessage('Failed to update the status of the appointment')
                        setNotificationModal(true);
                        console.error('Error updating appointment:', error);
                    
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


                  return<>
                  <ScrollView className="flex-1 bg-gray-50 px-2 py-6">
                      

                        <View className="mb-6 mt-8 flex-row justify-between items-center">
                          <Text className="text-2xl font-bold text-gray-800">Completed Appointments</Text>
                          <TouchableOpacity 
                            onPress={() => fetchCompletedAppointments(1)}
                            className="bg-blue-500 px-4 py-2 rounded-lg flex-row items-center"
                          >
                            <Icon name="refresh" size={16} color="white" className="mr-2" />
                            <Text className="text-white font-medium">Refresh</Text>
                          </TouchableOpacity>
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
                              <View className="bg-white rounded-xl mb-4 shadow-sm border border-black">
                                <View className="flex-row justify-between items-center p-4 border-b border-gray-100">
                                  <Text className="text-base font-bold text-gray-800">
                                    {appointment.order_id}
                                  </Text>
                                  <View className={`px-3 py-1 rounded-full border border-black ${
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

                        {currentPage < totalPages && (
                          <TouchableOpacity 
                            onPress={loadMore}
                            className="bg-blue-500 rounded px-4 py-2 mt-4 mb-14"
                            disabled={isLoadingMore}
                          >
                            <Text className="text-white text-center">
                              {isLoadingMore ? 'Loading...' : 'Load More'}
                            </Text>
                          </TouchableOpacity>
                        )}
                      </ScrollView>

                      {/* Modal for displaying appointment details */}
                      <Modal
                        visible={modalVisible}
                        transparent={true}
                      
                      >
                        <TouchableWithoutFeedback onPress={() => setModalVisible(false)}>
                          <View className="flex-1 justify-center items-center bg-black/50  border border-black">
                            <TouchableWithoutFeedback onPress={Keyboard.dismiss}>
                              <View className="bg-white rounded-lg p-4 w-11/12 relative">
                                <TouchableOpacity 
                                  onPress={() => setModalVisible(false)} 
                                  className="absolute top-4 right-4"
                                >
                                
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

                                    {selectedAppointment && 'commission' in selectedAppointment ? (
                                      <Text>Commission: ₹{(selectedAppointment as CompletedAppointment).commission}</Text>
                                    ) : null}

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
                      <Modal 
                      visible={notificationModal}
                      transparent={true}
                      
                      >
                        <View className="flex-1 justify-center items-center">
                        <View className="bg-black bg-opacity-70 px-6 py-4 rounded-lg">
                          <Text className="text-white text-center">
                            {notificationMessage}
                          </Text>
                        </View>
                      </View>
                      </Modal>
                    
                  </>
                }