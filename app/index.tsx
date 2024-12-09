import { ActivityIndicator, Text, TextInput, TouchableOpacity, View, Image } from "react-native";
import { router } from 'expo-router';

import { zodResolver } from "@hookform/resolvers/zod";
import { SubmitHandler, useForm, Controller } from "react-hook-form";
import { z } from "zod";

const schema = z.object({
  number: z.string().length(10, "Phone number must be exactly 10 digits"),
  password: z.string().min(6, "Password must be at least 6 characters")
});

type FormFields = z.infer<typeof schema>;

export default function Login() {
  const {
    control,
    handleSubmit,
    setError,
    formState: { errors, isSubmitting },
  } = useForm<FormFields>({
    defaultValues: {
      number: "",
      password: "",
    },
    resolver: zodResolver(schema),
  });

  const onSubmit: SubmitHandler<FormFields> = async (data) => {
    try {
      const phoneNumber = data.number;
      console.log('Phone number:', phoneNumber);
      
      router.replace('/mark-attendance');
    } catch (error) {
      setError("root", {
        message: "error in the server",                        
      });        
    }
  };

  return (
    <View className="flex-1 justify-start items-center px-4 bg-white">
      <View className="w-full max-w-md space-y-6 mt-8">
        <View className="items-center">
          <Image 
            source={require('../assets/images/feelaxo-logo.png')}
            style={{ width: 150, height: 150 }}
            resizeMode="contain"
          />
        </View>

        <View className="items-center mt-8">
          <Text className="text-2xl font-bold text-gray-800">Welcome Back</Text>
          <Text className="text-gray-500 mt-2">Please enter your phone number to continue</Text>
        </View>

        <View className="w-full space-y-2">
          <Text className="text-gray-700 text-sm font-medium ml-1 mt-7">Phone Number</Text>
          <Controller
            control={control}
            name="number"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Enter 10-digit number"
                keyboardType="numeric"
                maxLength={10}
                className="border border-gray-300 p-4 rounded-xl w-full bg-gray-50 mt-3"
              />
            )}
          />
          {errors.number && (
            <Text className="text-red-500 text-sm ml-1">{errors.number.message}</Text>
          )}
        </View>
        <View className="w-full space-y-2">
          <Text className="text-gray-700 text-sm font-medium ml-1 mt-7">Password</Text>
          <Controller
            control={control}
            name="password"
            render={({ field: { onChange, value } }) => (
              <TextInput
                value={value}
                onChangeText={onChange}
                placeholder="Enter password"
                secureTextEntry={true}
                className="border border-gray-300 p-4 rounded-xl w-full bg-gray-50 mt-3"
              />
            )}
          />
          {errors.password && (
            <Text className="text-red-500 text-sm ml-1">{errors.password.message}</Text>
          )}
        </View>

        <TouchableOpacity
          onPress={handleSubmit(onSubmit)}
          disabled={isSubmitting}
          className="bg-[#1877F2] py-3 rounded-full w-full mt-3 shadow-lg"
        >
          {isSubmitting ? (
            <ActivityIndicator color="#FFFFFF" />
          ) : (
            <Text className="text-white text-center font-bold">Sign In</Text>
          )}
        </TouchableOpacity>

        {errors.root && (
          <Text className="text-red-500 text-center mt-4">{errors.root.message}</Text>
        )}
      </View>
    </View>
  );
}

