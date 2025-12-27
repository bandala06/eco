// hooks/useBluetooth.ts
import { useState, createContext, useContext, ReactNode, useMemo } from 'react';
import { Device } from 'react-native-ble-plx';
import { bluetoothService } from '../services/BluetoothService'; // <--- ¡Importamos tu servicio!

// 1. Definir la forma de los datos del sensor (según tu JSON del ESP32)
export interface SensorData {
  humS: number;    // Humedad Suelo
  humA: number;    // Humedad Ambiente
  temp: number;    // Temperatura
  dist: number;    // Distancia
  bomba: boolean;  // Estado de la bomba
  modo: 'AUTO' | 'MANUAL';
  alerta: string;  // 'OK' o 'TANQUE_BAJO'
}

// 2. Definir lo que nuestro "cerebro" (Context) va a proveer
interface BluetoothContextType {
  isConnected: boolean;
  isConnecting: boolean;
  connectedDevice: Device | null;
  sensorData: SensorData | null;
  error: string | null;
  scanForDevices: () => void; // Función para empezar a escanear
  connectToDevice: (device: Device) => void; // Función para conectarse
  disconnectDevice: () => void;
  sendCommand: (command: string) => void; // Para enviar "AUTO", "MANUAL_ON", etc.
}

// 3. Crear el Contexto
const BluetoothContext = createContext<BluetoothContextType | null>(null);

// 4. Crear el "Proveedor" (El componente que envuelve la App)
export function BluetoothProvider({ children }: { children: ReactNode }) {
  const [connectedDevice, setConnectedDevice] = useState<Device | null>(null);
  const [isConnecting, setIsConnecting] = useState(false);
  const [sensorData, setSensorData] = useState<SensorData | null>(null);
  const [error, setError] = useState<string | null>(null);

  const isConnected = useMemo(() => !!connectedDevice, [connectedDevice]);

  // --- FUNCIONES PRINCIPALES ---

  const scanForDevices = async () => {
    const permissions = await bluetoothService.requestPermissions();
    if (!permissions) {
      setError("Faltan permisos de Bluetooth");
      return;
    }
    // Esta función la modificaremos en la pantalla 'devices.tsx' para que
    // muestre una lista de dispositivos encontrados en lugar de autoconectarse.
    console.log("Iniciando escaneo (implementar en la pantalla de dispositivos)");
  };

  const connectToDevice = async (device: Device) => {
    setIsConnecting(true);
    setError(null);
    try {
      const connected = await bluetoothService.connectToDevice(device.id);
      if (connected) {
        setConnectedDevice(connected);
        setIsConnecting(false);

        // ¡Clave! Una vez conectado, empieza a monitorear los datos
        bluetoothService.monitorSensorData((data: SensorData) => {
          // Esto se llamará cada vez que el ESP32 envíe datos
          setSensorData(data);
        });
      } else {
        throw new Error("No se pudo conectar");
      }
    } catch (e: any) {
      setError(e.message);
      setIsConnecting(false);
    }
  };

  const disconnectDevice = async () => {
    await bluetoothService.disconnectDevice();
    setConnectedDevice(null);
    setSensorData(null); // Limpia los datos
  };

  const sendCommand = (command: string) => {
    if (isConnected) {
      bluetoothService.sendControlCommand(command);
    }
  };

  // El "valor" que será accesible por toda la app
  const value: BluetoothContextType = {
    isConnected,
    isConnecting,
    connectedDevice,
    sensorData,
    error,
    scanForDevices,
    connectToDevice,
    disconnectDevice,
    sendCommand,
  };

  return (
    <BluetoothContext.Provider value={value}>
      {children}
    </BluetoothContext.Provider>
  );
}

// 5. Crear el Hook (la forma fácil de usar el contexto)
export const useBluetooth = (): BluetoothContextType => {
  const context = useContext(BluetoothContext);
  if (!context) {
    throw new Error("useBluetooth debe ser usado dentro de un BluetoothProvider");
  }
  return context;
};