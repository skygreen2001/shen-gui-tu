import React from 'react';
import { NavigationContainer, useNavigation } from '@react-navigation/native';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { SafeAreaProvider } from 'react-native-safe-area-context';
import { navigationTheme } from './navigation/theme';
import AppNavigator from './navigation/AppNavigator';
import CrisisButton from './components/CrisisButton';
import type { RootStackParamList } from './navigation/AppNavigator';
import { NativeStackNavigationProp } from '@react-navigation/native-stack';

type NavigationProp = NativeStackNavigationProp<RootStackParamList>;

function CrisisButtonWrapper() {
  const navigation = useNavigation<NavigationProp>();
  const handleCrisisPress = () => {
    navigation.navigate('Crisis');
  };
  return <CrisisButton onPress={handleCrisisPress} />;
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <SafeAreaProvider>
        <NavigationContainer theme={navigationTheme}>
          <AppNavigator />
          <CrisisButtonWrapper />
        </NavigationContainer>
      </SafeAreaProvider>
    </GestureHandlerRootView>
  );
}
