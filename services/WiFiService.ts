import AsyncStorage from '@react-native-async-storage/async-storage';

const STORAGE_KEY = '@esp32_ip';
const DEFAULT_IP = "192.168.0.109"; // IP de respaldo

export const wifiService = {
  
  // Guardar la IP que escribe el usuario
  async saveIP(ip: string) {
    try {
      await AsyncStorage.setItem(STORAGE_KEY, ip);
      console.log("IP Guardada:", ip);
    } catch (e) {
      console.error("Error guardando IP", e);
    }
  },

  // Obtener la IP guardada
  async getIP() {
    try {
      const ip = await AsyncStorage.getItem(STORAGE_KEY);
      return ip || DEFAULT_IP;
    } catch (e) {
      return DEFAULT_IP;
    }
  },

  // Obtener datos (lee la IP dinámicamente)
  async getSensorData() {
    try {
      const ip = await this.getIP();
      const response = await fetch(`http://${ip}/data`, { signal: AbortSignal.timeout(2000) }); // Timeout de 2s
      return await response.json();
    } catch (error) {
      // console.warn("Wi-Fi no disponible");
      return null;
    }
  },

  // Enviar comando
  async sendCommand(command: string) {
    try {
      const ip = await this.getIP();
      await fetch(`http://${ip}/control?cmd=${command}`);
    } catch (error) {
      console.error("Error Wi-Fi CMD:", error);
    }
  }
};