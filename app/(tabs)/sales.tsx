import { useEffect, useState } from "react";
import { useUser } from '../../contexts/UserContext';
import axios from "axios";
import { View, Text, Dimensions } from 'react-native';
import { BarChart } from 'react-native-chart-kit';

interface Order {
    appointment_date: string;
    commission: number;
}

export default function Sales() {
    const [monthlyCommissions, setMonthlyCommissions] = useState<{ [key: string]: number }>({});
    const { userData } = useUser()
    
    useEffect(() => {
        fetchSalesData();
    }, []);

    const fetchSalesData = async () => {
        try {
            const response = await axios.get(`https://api-stage.feelaxo.com/api/staff/completed-orders?staff_id=${userData?.id}`)
            console.log("API Response:", response.data); // Debug log

            const orders = response.data?.data || [];
            const monthlyData: { [key: string]: number } = {};

            orders.forEach((order: Order) => {
                const date = new Date(order.appointment_date);
                const month = date.toLocaleString('default', { month: 'short' });
                
                monthlyData[month] = (monthlyData[month] || 0) + order.commission;
            });

            console.log("Processed Monthly Data:", monthlyData); // Debug log
            setMonthlyCommissions(monthlyData);
        } catch (error) {
            console.error("Error fetching sales data:", error);
        }
    }

    // Prepare chart data
    const chartLabels = Object.keys(monthlyCommissions);
    const chartValues = Object.values(monthlyCommissions);

    console.log("Chart Labels:", chartLabels); // Debug log
    console.log("Chart Values:", chartValues); // Debug log

    // Ensure we have at least one data point
    const chartData = {
        labels: chartLabels.length > 0 ? chartLabels : ['No Data'],
        datasets: [{
            data: chartValues.length > 0 ? chartValues : [0]
        }]
    };

    return (
        <View style={{ padding: 16 }}>
            <Text style={{ fontSize: 24, fontWeight: 'bold', marginBottom: 20 }}>
                MONTHLY SALES
            </Text>
            <View>
                <BarChart
                    data={chartData}
                    width={Dimensions.get('window').width - 32}
                    height={220}
                    yAxisLabel="$"
                    yAxisSuffix=""
                    chartConfig={{
                        backgroundColor: '#ffffff',
                        backgroundGradientFrom: '#ffffff',
                        backgroundGradientTo: '#ffffff',
                        decimalPlaces: 0,
                        color: (opacity = 1) => `rgba(136, 132, 216, ${opacity})`,
                        style: {
                            borderRadius: 16,
                        },
                        barPercentage: 0.5,
                        propsForLabels: {
                            fontSize: 12,
                        }
                    }}
                    style={{
                        marginVertical: 8,
                        borderRadius: 16,
                    }}
                    showValuesOnTopOfBars={true}
                />
                {Object.keys(monthlyCommissions).length === 0 && (
                    <Text style={{ color: 'gray', textAlign: 'center' }}>
                        No sales data available
                    </Text>
                )}
            </View>
        </View>
    )
}