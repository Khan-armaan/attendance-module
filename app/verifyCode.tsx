import { router } from 'expo-router';
import { useState } from 'react';
import { Text, View, TextInput, TouchableOpacity, Image } from "react-native";
import { Link } from 'expo-router';

export default function VerifyCode() {
    const [code, setCode] = useState('');

    const handleSubmit = () => {
        console.log('Verification code submitted:', code);
        router.replace('../mark-attendance');
    };

    return (
        <View className="flex-1">
            <View className="h-20 justify-center items-start px-4 bg-white">
                <Link href="/">
                    <Image
                        source={require('../assets/images/icon.jpeg')}
                        className="w-10 h-10"
                        style={{ resizeMode: 'contain' }}
                    />
                </Link>
            </View>
            <View className="flex-1 p-5 items-center justify-center">
                <Text className="text-2xl font-bold mb-2">Verify Code</Text>
                <Text className="text-base text-gray-600 text-center mb-8">
                    Please enter the verification code sent to your device
                </Text>
                <TextInput
                    className="w-full h-12 border border-gray-300 rounded-lg px-4 mb-5 text-base"
                    value={code}
                    onChangeText={setCode}
                    placeholder="Enter verification code"
                    keyboardType="number-pad"
                    maxLength={6}
                />
                <TouchableOpacity
                    className="w-full h-12 bg-blue-500 rounded-lg items-center justify-center"
                    onPress={handleSubmit}
                >
                    <Text className="text-white text-base font-bold">
                        Verify
                    </Text>
                </TouchableOpacity>
            </View>
        </View>
    );
}