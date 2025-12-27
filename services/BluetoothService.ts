// services/BluetoothService.ts
import { Buffer } from 'buffer'; // <--- ¡Aquí está tu corrección!
import { PermissionsAndroid, Platform } from 'react-native';
import { BleManager, Device } from 'react-native-ble-plx';

// --- UUIDs (DEBEN COINCIDIR CON EL .CPP) ---
const DEVICE_NAME = "RiegoESP32_BLE"; // El nombre del BLE
const RIEGO_SERVICE_UUID = "4fafc201-1fb5-459e-8fcc-c5c9c331914b";
const CONTROL_CHAR_UUID = "beb5483e-36e1-4688-b7f5-ea07361b26a8"; // (W) Para enviar comandos
const SENSOR_JSON_CHAR_UUID = "c3c5c9c3-3191-4b45-9e1f-b5c201c5c9c3"; // (N) Para recibir datos JSON
// ------------------------------------------

class BluetoothService {
  private static instance: BluetoothService;
  private manager: BleManager;
  private connectedDevice: Device | null = null;

  // Constructor privado para el Singleton
  private constructor() {
    this.manager = new BleManager();
    console.log("BluetoothService inicializado");
  }

  // Método para obtener la instancia única
  public static getInstance(): BluetoothService {
    if (!BluetoothService.instance) {
      BluetoothService.instance = new BluetoothService();
    }
    return BluetoothService.instance;
  }

  // --- 1. Permisos ---
  public async requestPermissions(): Promise<boolean> {
    // ... (Esta función queda exactamente igual que en tu código) ...
    if (Platform.OS === 'android') {
      const granted = await PermissionsAndroid.requestMultiple([
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_SCAN,
        PermissionsAndroid.PERMISSIONS.BLUETOOTH_CONNECT,
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
      ]);
      return (
        granted['android.permission.BLUETOOTH_CONNECT'] === 'granted' &&
        granted['android.permission.BLUETOOTH_SCAN'] === 'granted' &&
        granted['android.permission.ACCESS_FINE_LOCATION'] === 'granted'
      );
    }
    return true;
  }

  // --- 2. Escaneo ---
  public scanForDevices(onDeviceFound: (device: Device) => void) {
    this.manager.startDeviceScan(null, null, (error, device) => {
      if (error) {
        console.error("Error escaneando:", error);
        return;
      }
      // ¡Importante! Filtra por el nuevo nombre de BLE
      if (device && device.name === DEVICE_NAME) { 
        console.log("¡Sistema de Riego encontrado!", device.id);
        this.manager.stopDeviceScan();
        onDeviceFound(device);
      }
    });
  }

  // --- 3. Conexión y Desconexión ---
  // ... (connectToDevice y disconnectDevice quedan exactamente igual) ...
  public async connectToDevice(deviceId: string): Promise<Device | null> {
    try {
      console.log("Conectando a", deviceId);
      const device = await this.manager.connectToDevice(deviceId);
      
      if (Platform.OS === 'android') {
        try {
          await device.requestMTU(512);
          console.log("MTU aumentado a 512 bytes");
        } catch (mtuError) {
          console.warn("No se pudo negociar MTU, intentando seguir...", mtuError);
        }
      }

      await device.discoverAllServicesAndCharacteristics();
      this.connectedDevice = device;
      console.log("¡Conectado y servicios descubiertos!");
      return device;
    } catch (error) {
      console.error("Error al conectar:", error);
      return null;
    }
  }

  public async disconnectDevice() {
    if (this.connectedDevice) {
      await this.manager.cancelDeviceConnection(this.connectedDevice.id);
      this.connectedDevice = null;
      console.log("Dispositivo desconectado");
    }
  }

  // --- 4. Escribir Datos (Versión corregida) ---
  /**
   * Envía un comando de control al ESP32.
   * Acepta cualquier string, ej: "AUTO", "MANUAL_ON", "UMBRAL:50"
   */
  public async sendControlCommand(comando: string) {
    if (!this.connectedDevice) {
      console.warn("No hay dispositivo conectado para enviar comando");
      return;
    }

    // Convertimos el string a Base64
    const dataBase64 = Buffer.from(comando).toString('base64');

    try {
      await this.manager.writeCharacteristicWithoutResponseForDevice(
        this.connectedDevice.id,
        RIEGO_SERVICE_UUID,
        CONTROL_CHAR_UUID,
        dataBase64
      );
      console.log(`Comando '${comando}' enviado.`);
    } catch (error) {
      console.error("Error al escribir comando:", error);
    }
  }

  // --- 5. Monitorear Datos (Versión corregida) ---
  /**
   * Se suscribe a los datos del sensor.
   * Espera recibir un string JSON con todo el estado.
   */
  public monitorSensorData(onDataReceived: (data: any) => void) {
    if (!this.connectedDevice) return;

    this.manager.monitorCharacteristicForDevice(
      this.connectedDevice.id,
      RIEGO_SERVICE_UUID,
      SENSOR_JSON_CHAR_UUID, // Escuchamos la característica de JSON
      (error, characteristic) => {
        if (error) {
          console.error("Error al monitorear:", error);
          return;
        }
        if (!characteristic?.value) return;

        // 1. Decodificar de Base64 a String
        const jsonData = Buffer.from(characteristic.value, 'base64').toString('utf-8');
        
        console.log("RAW JSON recibido:", jsonData);

        try {
          // 2. Convertir (Parsear) el String JSON a un objeto
          const dataObject = JSON.parse(jsonData);
          onDataReceived(dataObject); // Enviamos el objeto completo a la UI
        } catch (e) {
          console.error("Error al parsear JSON recibido:", e, jsonData);
        }
      }
    );
  }
}

// Exportamos la instancia única
export const bluetoothService = BluetoothService.getInstance();