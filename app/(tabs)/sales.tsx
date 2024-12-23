import { useUser } from '@/contexts/UserContext';
import { createMaterialTopTabNavigator } from '@react-navigation/material-top-tabs';
import { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator, Modal, Pressable } from 'react-native';

interface ItemSelected {
  service_type_id: number;
  service_detail_id: number;
  service_type_name: string;
  duration: string;
  service_price: number;
}

interface SalesData {
  appointment_id: number;
  appointmentDate: string;
  appointmentTime: string;
  cartTotal: string;
  commission: string;
  itemsSelected: ItemSelected[];
}

interface ApiResponse {
  meta: {
    total_records: number;
    total_pages: number;
    current_page: number;
    limit: number;
  };
  data: SalesData[];
}

// Add new interface for selected sale
interface SelectedSale extends SalesData {
  user_name?: string;
  user_phone?: string;
}


const Tab = createMaterialTopTabNavigator();
export default function Sales() {
    return(
        <>
         <Tab.Navigator>
      <Tab.Screen name="Today" component={TodaySales} />
      <Tab.Screen name="Week" component={WeeklySales} />
    </Tab.Navigator>
        </>
    )
}


 function TodaySales() {
  const { userData } = useUser();
  const [salesData, setSalesData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);
  const [selectedSale, setSelectedSale] = useState<SelectedSale | null>(null);
  const [modalVisible, setModalVisible] = useState(false);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch(`https://api-stage.feelaxo.com/api/staff/completed-orders?staff_id=${userData?.id}`);
      
      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getCurrentDaySales = () => {
    if (!salesData?.data) return [];
    const today = new Date().toISOString().split('T')[0]; // Get today's date in YYYY-MM-DD format
    return salesData.data.filter(sale => sale.appointmentDate.startsWith(today));
  };

  const calculateTotalBusiness = () => {
    const todaySales = getCurrentDaySales();
    return todaySales.reduce((total, item) => total + parseFloat(item.cartTotal), 0);
  };

  const calculateTotalCommission = () => {
    const todaySales = getCurrentDaySales();
    return todaySales.reduce((total, item) => total + parseFloat(item.commission), 0);
  };

  if (loading) return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );

  const todaySales = getCurrentDaySales();

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      {/* Heading */}
      <Text className="text-2xl font-bold mb-4">My Commission</Text>

      {/* Summary Card */}
      <View className="bg-green-50 rounded-lg p-4 mb-6 flex-row justify-between items-center border border-black">
        <View>
          <Text className="text-base font-bold">Total Business</Text>
          <Text className="text-2xl font-bold">
            {calculateTotalBusiness().toFixed(2)}
          </Text>
        </View>
        <View>
          <Text className="text-base font-bold">Total Commission</Text>
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-green-600">
              {calculateTotalCommission().toFixed(2)}
            </Text>
            <Text className="text-xs"> (10%)</Text>
          </View>
        </View>
      </View>

      {/* Sales List with Pressable */}
      <View className="gap-4">
        {todaySales.map((sale) => {
          const date = new Date(sale.appointmentDate);
          return (
            <Pressable 
              key={sale.appointment_id}
              onPress={() => {
                setSelectedSale(sale);
                setModalVisible(true);
              }}
            >
              <View className="border border-black rounded-lg p-4 flex-row justify-between items-center mb-4">
                <View className="flex-col">
                  <Text className="font-bold">
                    {date.toLocaleDateString('en-US', { 
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}
                  </Text>
                  <Text className="text-gray-500">
                    {sale.appointmentTime.substring(0, 5)}
                  </Text>
                </View>
                <View className="flex-row items-center gap-8">
                  <Text className="text-gray-500">
                    {parseFloat(sale.cartTotal).toFixed(2)}
                  </Text>
                  <Text className="font-bold">
                    {parseFloat(sale.commission).toFixed(2)}
                  </Text>
                </View>
              </View>
            </Pressable>
          );
        })}
      </View>

      {/* Detail Modal */}
      <Modal
        animationType="slide"
        transparent={true}
        visible={modalVisible}
        onRequestClose={() => setModalVisible(false)}
      >
        <View className="flex-1 justify-center items-center bg-black/50">
          <View className="bg-white p-4 rounded-lg w-[90%]">
            {selectedSale && (
              <>
                <View className="flex-row justify-between items-center mb-4">
                  <Text className="text-xl font-bold">
                    {new Date(selectedSale.appointmentDate).toLocaleDateString('en-US', {
                      day: '2-digit',
                      month: 'short',
                      year: 'numeric'
                    })}, {selectedSale.appointmentTime.substring(0, 5)}
                  </Text>
                  <Text className="text-xl font-bold">{parseFloat(selectedSale.cartTotal).toFixed(2)}</Text>
                </View>

                <View className="mb-4">
                  <Text className="font-bold">{selectedSale.user_name || 'Customer'}, {selectedSale.user_phone}</Text>
                </View>

                {selectedSale.itemsSelected.map((item, index) => (
                  <View key={index} className="flex-row justify-between mb-2">
                    <View>
                      <Text className="font-bold">{item.service_type_name}</Text>
                      <Text className="text-gray-500">{item.duration}</Text>
                    </View>
                    <Text>{item.service_price}</Text>
                  </View>
                ))}

                <Pressable
                  onPress={() => setModalVisible(false)}
                  className="bg-gray-200 p-3 rounded-lg mt-4"
                >
                  <Text className="text-center">Close</Text>
                </Pressable>
              </>
            )}
          </View>
        </View>
      </Modal>
    </ScrollView>
  );
}

function WeeklySales() {
  const [salesData, setSalesData] = useState<ApiResponse | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchSalesData();
  }, []);

  const fetchSalesData = async () => {
    try {
      const response = await fetch('https://api-stage.feelaxo.com/api/staff/completed-orders?staff_id=738');
      const data = await response.json();
      setSalesData(data);
    } catch (error) {
      console.error('Error fetching sales data:', error);
    } finally {
      setLoading(false);
    }
  };

  const getWeeklySales = () => {
    if (!salesData?.data) return [];
    
    const today = new Date();
    const startOfWeek = new Date(today);
    startOfWeek.setDate(today.getDate() - today.getDay()); // Start from Sunday
    startOfWeek.setHours(0, 0, 0, 0);

    return salesData.data.filter(sale => {
      const saleDate = new Date(sale.appointmentDate);
      return saleDate >= startOfWeek && saleDate <= today;
    });
  };

  const calculateTotalBusiness = () => {
    const weeklySales = getWeeklySales();
    return weeklySales.reduce((total, item) => total + parseFloat(item.cartTotal), 0);
  };

  const calculateTotalCommission = () => {
    const weeklySales = getWeeklySales();
    return weeklySales.reduce((total, item) => total + parseFloat(item.commission), 0);
  };

  if (loading) return (
    <View className="flex-1 justify-center items-center">
      <ActivityIndicator size="large" color="#0000ff" />
    </View>
  );

  const weeklySales = getWeeklySales();

  return (
    <ScrollView className="flex-1 p-4 bg-white">
      {/* Heading */}
      <Text className="text-2xl font-bold mb-4">My Commission</Text>

      {/* Summary Card */}
      <View className="bg-green-50 rounded-lg p-4 mb-6 flex-row justify-between items-center border border-black">
        <View>
          <Text className="text-base font-bold">Total Business</Text>
          <Text className="text-2xl font-bold">
            {calculateTotalBusiness().toFixed(2)}
          </Text>
        </View>
        <View>
          <Text className="text-base font-bold">Total Commission</Text>
          <View className="flex-row items-center">
            <Text className="text-2xl font-bold text-green-600">
              {calculateTotalCommission().toFixed(2)}
            </Text>
            <Text className="text-xs"> (10%)</Text>
          </View>
        </View>
      </View>

      {/* Sales List */}
      <View className="gap-4">
        {weeklySales.map((sale) => {
          const date = new Date(sale.appointmentDate);
          return (
            <View 
              key={sale.appointment_id}
              className="border border-black rounded-lg p-4 flex-row justify-between items-center mb-4"
            >
              <View className="flex-col">
                <Text className="font-bold">
                  {date.toLocaleDateString('en-US', { 
                    day: '2-digit',
                    month: 'short',
                    year: 'numeric'
                  })}
                </Text>
                <Text className="text-gray-500">
                  {sale.appointmentTime.substring(0, 5)}
                </Text>
              </View>
              <View className="flex-row items-center gap-8">
                <Text className="text-gray-500">
                  {parseFloat(sale.cartTotal).toFixed(2)}
                </Text>
                <Text className="font-bold">
                  {parseFloat(sale.commission).toFixed(2)}
                </Text>
              </View>
            </View>
          );
        })}
      </View>
    </ScrollView>
  );
}