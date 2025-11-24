import { NavigationContainer } from '@react-navigation/native';
import { createNativeStackNavigator, NativeStackScreenProps } from '@react-navigation/native-stack';

import HomeScreen from '../screens/HomeScreen';
import NitScreen from '../screens/NitScreen';
import LoginStepScreen from '../screens/LoginStepScreen';
import { useAuthStore } from '../state/store';
import React, { useCallback } from 'react';

export type RootStackParamList = {
  Home: undefined;
  Nit: undefined;
  LoginStep: { nit: string; extraData: any };
};

const Stack = createNativeStackNavigator<RootStackParamList>();

export default function AppNavigator() {
  const isLoggedIn = useAuthStore((s) => s.isLoggedIn);
  return (
    <NavigationContainer>
      <Stack.Navigator initialRouteName={isLoggedIn ? 'Home' : 'Nit'} screenOptions={{ headerShown: false }}>
        {!isLoggedIn ? (
          <>
            <Stack.Screen name="Nit" component={NitScreenWrapper} />
            <Stack.Screen name="LoginStep" component={LoginStepScreenWrapper} />
          </>
        ) : (
          <Stack.Screen name="Home" component={HomeScreen} />
        )}
      </Stack.Navigator>
    </NavigationContainer>
  );
}

// Wrappers para manejar navegación entre pantallas de login
import { useNavigation } from '@react-navigation/native';
type NitScreenNavProps = NativeStackScreenProps<RootStackParamList, 'Nit'>;
function NitScreenWrapper({ navigation }: NitScreenNavProps) {
  const handleValidNit = useCallback((nit: string, extraData: any) => {
    navigation.navigate('LoginStep', { nit, extraData });
  }, [navigation]);
  return <NitScreen onValidNit={handleValidNit} />;
}

type LoginStepScreenNavProps = NativeStackScreenProps<RootStackParamList, 'LoginStep'>;
function LoginStepScreenWrapper({ navigation, route }: LoginStepScreenNavProps) {
  const { nit, extraData } = route.params;
  const setLoggedIn = useAuthStore((s) => s.setLoggedIn);
  const handleBack = useCallback(() => {
    navigation.goBack();
  }, [navigation]);
  const handleLoginSuccess = useCallback((user: any) => {
    setLoggedIn(true);
    navigation.reset({ index: 0, routes: [{ name: 'Home' }] });
  }, [navigation, setLoggedIn]);
  return <LoginStepScreen nit={nit} onBack={handleBack} onLoginSuccess={handleLoginSuccess} />;
}
