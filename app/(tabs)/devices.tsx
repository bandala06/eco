import { Ionicons } from '@expo/vector-icons';
import React, { useEffect, useState } from 'react';
import { ActivityIndicator, Alert, FlatList, KeyboardAvoidingView, Platform, StyleSheet, Text, TextInput, TouchableOpacity, View } from 'react-native';
import { Device } from 'react-native-ble-plx';
import { useBluetooth } from '../../hooks/useBluetooth';
import { bluetoothService } from '../../services/BluetoothService';
import { wifiService } from '../../services/WiFiService';
// 1. IMPORTAR EL TEMA
import { useTheme } from '../../hooks/ThemeContext';

export default function DevicesScreen() {
  // --- ESTADOS TEMA ---
  const { colors, isDark } = useTheme(); // <--- 2. EXTRAER COLORES

  // --- ESTADOS BLE ---
  const [foundDevices, setFoundDevices] = useState<Device[]>([]);
  const [isScanning, setIsScanning] = useState(false);
  const { connectToDevice, isConnecting, isConnected, disconnectDevice, connectedDevice } = useBluetooth();

  // --- ESTADOS WI-FI ---
  const [ipAddress, setIpAddress] = useState("");
  const [isSavingWifi, setIsSavingWifi] = useState(false);

  // Cargar la IP guardada al abrir la pantalla
  useEffect(() => {
    wifiService.getIP().then(ip => setIpAddress(ip));
  }, []);

  // --- LÓGICA BLE ---
  const handleScan = async () => {
    const permissions = await bluetoothService.requestPermissions();
    if (!permissions) return;
    setIsScanning(true);
    setFoundDevices([]); 
    bluetoothService.scanForDevices((device) => {
      setFoundDevices((prev) => {
        if (!prev.find((d) => d.id === device.id)) return [...prev, device];
        return prev;
      });
    });
    setTimeout(() => setIsScanning(false), 5000);
  };

  // --- LÓGICA WI-FI ---
  const handleSaveIp = async () => {
    setIsSavingWifi(true);
    await wifiService.saveIP(ipAddress);
    
    // Probamos la conexión
    const data = await wifiService.getSensorData();
    setIsSavingWifi(false);

    if (data) {
      Alert.alert("¡Éxito!", "IP Guardada y conexión verificada.");
    } else {
      Alert.alert("Guardado", "IP Guardada, pero no se detectó el ESP32. Verifica que estés en la misma red.");
    }
  };

  const renderDeviceItem = ({ item }: { item: Device }) => (
    <TouchableOpacity 
      style={[styles.deviceCard, { backgroundColor: colors.cardBackground }]} 
      onPress={() => connectToDevice(item)} 
      disabled={isConnecting}
    >
      {/* Icono con fondo dinámico */}
      <View style={[styles.deviceIcon, { backgroundColor: isDark ? '#2196F3' + '20' : '#E3F2FD' }]}>
        <Ionicons name="bluetooth" size={24} color="#2196F3" />
      </View>
      <View style={styles.deviceInfo}>
        <Text style={[styles.deviceName, { color: colors.text }]}>{item.name || "Dispositivo Sin Nombre"}</Text>
        <Text style={[styles.deviceId, { color: colors.subText }]}>{item.id}</Text>
      </View>
      <Ionicons name="chevron-forward" size={24} color={colors.iconDefault} />
    </TouchableOpacity>
  );

  // Encabezado de la lista (Bluetooth)
  const ListHeader = () => (
    <View>
      <View style={styles.header}>
        <Text style={[styles.title, { color: colors.text }]}>Conexiones</Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>Gestiona Bluetooth y Wi-Fi</Text>
      </View>

      {/* SECCIÓN BLUETOOTH */}
      <Text style={styles.sectionHeader}>BLUETOOTH</Text>
      
      {isConnected && connectedDevice ? (
        <View style={[styles.connectedCard, { backgroundColor: colors.cardBackground, borderColor: colors.success }]}>
          <Ionicons name="checkmark-circle" size={40} color={colors.success} />
          <View style={{flex: 1, marginLeft: 10}}>
            <Text style={[styles.connectedTitle, { color: colors.success }]}>Conectado</Text>
            <Text style={[styles.connectedSubtitle, { color: colors.subText }]}>{connectedDevice.name}</Text>
          </View>
          <TouchableOpacity style={styles.disconnectMiniButton} onPress={disconnectDevice}>
            <Text style={styles.disconnectText}>Salir</Text>
          </TouchableOpacity>
        </View>
      ) : (
        <TouchableOpacity 
            style={[styles.scanButton, isScanning && styles.scanningButton, { backgroundColor: colors.tint }]} 
            onPress={handleScan} 
            disabled={isScanning}
        >
          {isScanning ? <ActivityIndicator color="#FFF" /> : (
            <>
              <Ionicons name="search" size={20} color="white" style={{marginRight: 8}} />
              <Text style={styles.scanButtonText}>Escanear Bluetooth</Text>
            </>
          )}
        </TouchableOpacity>
      )}
    </View>
  );

  // Pie de página de la lista (Wi-Fi)
  const ListFooter = () => (
    <View style={styles.wifiSection}>
      <Text style={styles.sectionHeader}>WI-FI (IP ESTÁTICA)</Text>
      <View style={[styles.wifiCard, { backgroundColor: colors.cardBackground }]}>
        <Text style={[styles.wifiLabel, { color: colors.text }]}>Dirección IP del ESP32:</Text>
        <View style={styles.inputRow}>
          <TextInput 
            style={[styles.input, { 
                backgroundColor: isDark ? '#333' : '#F7FAFC', // Fondo del input
                borderColor: colors.border,
                color: colors.text // Color de la letra que escribes
            }]}
            value={ipAddress}
            onChangeText={setIpAddress}
            placeholder="Ej: 192.168.1.50"
            placeholderTextColor={colors.subText} // Color del placeholder
            keyboardType="numeric"
          />
          <TouchableOpacity style={styles.saveButton} onPress={handleSaveIp} disabled={isSavingWifi}>
            {isSavingWifi ? <ActivityIndicator color="white" size="small" /> : <Ionicons name="save-outline" size={20} color="white" />}
          </TouchableOpacity>
        </View>
        <Text style={[styles.wifiHint, { color: colors.subText }]}>
            Mira el Monitor Serie o la pantalla OLED para ver la IP actual.
        </Text>
      </View>
    </View>
  );

  return (
    // Fondo principal dinámico
    <KeyboardAvoidingView behavior={Platform.OS === "ios" ? "padding" : "height"} style={[styles.container, { backgroundColor: colors.background }]}>
      <FlatList
        data={foundDevices}
        keyExtractor={(item) => item.id}
        renderItem={renderDeviceItem}
        ListHeaderComponent={ListHeader}
        ListFooterComponent={ListFooter} 
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={!isScanning && !isConnected ? (
          <Text style={[styles.emptyText, { color: colors.subText }]}>No hay dispositivos BLE visibles</Text>
        ) : null}
      />
      
      {isConnecting && (
        <View style={[styles.loadingOverlay, { backgroundColor: isDark ? 'rgba(0,0,0,0.8)' : 'rgba(255,255,255,0.8)' }]}>
          <ActivityIndicator size="large" color={colors.tint} />
          <Text style={{marginTop: 10, fontWeight: '600', color: colors.text}}>Conectando...</Text>
        </View>
      )}
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  listContent: { padding: 20, paddingBottom: 50 },
  header: { marginTop: 20, marginBottom: 20 },
  title: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16 },
  sectionHeader: { fontSize: 13, fontWeight: 'bold', color: '#A0AEC0', marginBottom: 10, marginTop: 10, letterSpacing: 1 },
  
  // Estilos BLE
  scanButton: { padding: 15, borderRadius: 12, flexDirection: 'row', justifyContent: 'center', alignItems: 'center', marginBottom: 10 },
  scanningButton: { opacity: 0.8 },
  scanButtonText: { color: 'white', fontWeight: 'bold', fontSize: 16 },
  deviceCard: { padding: 16, borderRadius: 16, marginBottom: 10, flexDirection: 'row', alignItems: 'center', elevation: 2 },
  deviceIcon: { padding: 10, borderRadius: 10, marginRight: 15 },
  deviceInfo: { flex: 1 },
  deviceName: { fontSize: 16, fontWeight: 'bold' },
  deviceId: { fontSize: 12 },
  connectedCard: { padding: 15, borderRadius: 16, flexDirection: 'row', alignItems: 'center', borderWidth: 1, marginBottom: 20 },
  connectedTitle: { fontWeight: 'bold', fontSize: 16 },
  connectedSubtitle: { fontSize: 14 },
  disconnectMiniButton: { backgroundColor: '#FFEBEE', paddingHorizontal: 15, paddingVertical: 8, borderRadius: 20 },
  disconnectText: { color: '#D32F2F', fontWeight: 'bold', fontSize: 12 },
  emptyText: { textAlign: 'center', marginTop: 20, marginBottom: 20 },

  // Estilos Wi-Fi
  wifiSection: { marginTop: 20 },
  wifiCard: { padding: 20, borderRadius: 16, elevation: 2 },
  wifiLabel: { fontSize: 14, marginBottom: 8, fontWeight: '600' },
  inputRow: { flexDirection: 'row', gap: 10 },
  input: { flex: 1, borderWidth: 1, borderRadius: 10, padding: 10, fontSize: 16 },
  saveButton: { backgroundColor: '#4CAF50', width: 50, borderRadius: 10, justifyContent: 'center', alignItems: 'center' },
  wifiHint: { fontSize: 12, marginTop: 10, fontStyle: 'italic' },
  
  loadingOverlay: { ...StyleSheet.absoluteFillObject, justifyContent: 'center', alignItems: 'center', zIndex: 10 },
});