import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import { AuthStackParamList } from './types';
import { PhoneLoginScreen } from '../screens/auth/PhoneLoginScreen';
import { OtpVerifyScreen } from '../screens/auth/OtpVerifyScreen';
import { RegisterNameScreen } from '../screens/auth/RegisterNameScreen';

const Stack = createNativeStackNavigator<AuthStackParamList>();

export const AuthNavigator: React.FC = () => {
  return (
    <Stack.Navigator
      screenOptions={{
        headerShown: false,
        animation: 'slide_from_right',
      }}
    >
      <Stack.Screen name="PhoneLogin" component={PhoneLoginScreen} />
      <Stack.Screen name="OtpVerify" component={OtpVerifyScreen} />
      <Stack.Screen name="RegisterName" component={RegisterNameScreen} />
    </Stack.Navigator>
  );
};
