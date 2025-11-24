import { StatusBar } from 'expo-status-bar';
import AppNavigator from './src/navigation/AppNavigator';
import { NativewindProvider } from './src/components/NativewindProvider';

export default function App() {
  return (
    <NativewindProvider>
      <AppNavigator />
      <StatusBar style="auto" />
    </NativewindProvider>
  );
}
