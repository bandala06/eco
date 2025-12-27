// app/_layout.tsx
import { Stack } from 'expo-router';
import { StatusBar } from 'expo-status-bar';
import { View } from 'react-native';

// 1. 👇 IMPORTA EL PROVIDER AQUÍ
import { ThemeProvider, useTheme } from '../hooks/ThemeContext';
import { BluetoothProvider } from '../hooks/useBluetooth';

// Creamos un componente interno para poder usar el hook useTheme y cambiar el StatusBar
function RootLayoutNav() {
  const { theme, colors } = useTheme(); 

  return (
    <View style={{ flex: 1, backgroundColor: colors.background }}>
      <StatusBar style={theme === 'dark' ? 'light' : 'dark'} />
      
      <Stack screenOptions={{
        headerStyle: {
          backgroundColor: colors.cardBackground, 
        },
        headerTintColor: colors.text, 
        contentStyle: {
          backgroundColor: colors.background 
        }
      }}>
        <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
      </Stack>
    </View>
  );
}

// El componente principal que exportas
export default function RootLayout() {
  return (
    // 2. 👇 AGREGAMOS EL BLUETOOTH PROVIDER AQUÍ
    // Ahora tu app tiene acceso a Temas Y a Bluetooth
    <ThemeProvider>
      <BluetoothProvider>
        <RootLayoutNav />
      </BluetoothProvider>
    </ThemeProvider>
  );
}