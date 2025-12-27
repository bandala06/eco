import { Ionicons } from '@expo/vector-icons';
import * as Notifications from 'expo-notifications'; // <--- 1. Importar Notificaciones
import React, { useEffect, useState } from 'react';
import { Dimensions, Platform, ScrollView, StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { useTheme } from '../../hooks/ThemeContext'; // <--- 2. Importar Tema
import { useBluetooth } from '../../hooks/useBluetooth';

const { width } = Dimensions.get('window');

// 3. Configuración del manejador de notificaciones
Notifications.setNotificationHandler({
  handleNotification: async () => ({
    shouldShowAlert: true,
    shouldPlaySound: true,
    shouldSetBadge: false,
  }),
});

export default function ControlScreen() {
  const { isConnected, sensorData, sendCommand } = useBluetooth();
  const { colors, isDark } = useTheme(); // <--- Usamos los colores del tema

  // Estado para controlar que no spammee notificaciones
  const [yaNotificado, setYaNotificado] = useState(false);

  // --- LÓGICA DE NOTIFICACIONES ---
  useEffect(() => {
    // Pedir permisos al cargar la pantalla
    registerForPushNotificationsAsync();
  }, []);

  useEffect(() => {
    // Si hay alerta de tanque bajo Y no hemos notificado aún
    if (sensorData?.alerta === 'TANQUE_BAJO' && !yaNotificado) {
      enviarNotificacion();
      setYaNotificado(true); // Bloqueamos para no repetir
    } 
    // Si el tanque se rellena (OK), reseteamos para la próxima vez
    else if (sensorData?.alerta === 'OK') {
      setYaNotificado(false);
    }
  }, [sensorData?.alerta]);

  const enviarNotificacion = async () => {
    await Notifications.scheduleNotificationAsync({
      content: {
        title: "⚠️ Alerta EcoDrop",
        body: "El nivel del tanque de agua es CRÍTICO. Por favor rellénalo.",
        sound: true,
      },
      trigger: null, // null significa "enviar ahora mismo"
    });
  };

  // --- Helper visual ---
  const isPumpActive = sensorData?.bomba === true || String(sensorData?.bomba) === 'true';
  const data = sensorData || { humS: 0, humA: 0, temp: 0, dist: 0, modo: '--', alerta: 'OK' };

  const show = (val: number, unit: string) => isConnected ? `${val}` : '--';

  // --- COMPONENTE TARJETA (Ahora con estilos dinámicos) ---
  const SensorCard = ({ title, value, unit, icon, color, bgColorLight }: any) => (
    <View style={[styles.card, { backgroundColor: colors.cardBackground }]}>
      <View style={[styles.iconContainer, { backgroundColor: isDark ? color + '30' : color + '20' }]}>
        <Ionicons name={icon} size={24} color={color} />
      </View>
      <Text style={[styles.cardValue, { color: colors.text }]}>
        {show(value, unit)}
        <Text style={[styles.cardUnit, { color: colors.subText }]}>{isConnected ? unit : ''}</Text>
      </Text>
      <Text style={[styles.cardTitle, { color: colors.subText }]}>{title}</Text>
    </View>
  );

  return (
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]} contentContainerStyle={styles.contentContainer}>
      
      {/* Header */}
      <View style={styles.header}>
        <Text style={[styles.greeting, { color: colors.text }]}></Text>
        <Text style={[styles.subtitle, { color: colors.subText }]}>
          Tu sistema EcoDrop está {isConnected ? <Text style={{color:'#4CAF50', fontWeight:'bold'}}>Conectado</Text> : <Text style={{color:'#F44336', fontWeight:'bold'}}>Desconectado</Text>}
        </Text>
      </View>

      {/* Tarjeta Estado */}
      <View style={[styles.mainCard, { backgroundColor: isPumpActive ? '#4CAF50' : (isDark ? '#D32F2F' : '#FF5252') }]}>
        <View>
          <Text style={styles.mainCardTitle}>Estado del Riego</Text>
          <Text style={styles.mainCardStatus}>{isPumpActive ? 'REGANDO' : 'INACTIVO'}</Text>
          <Text style={styles.mainCardMode}>Modo: {data.modo}</Text>
        </View>
        <Ionicons name={isPumpActive ? "water" : "water-outline"} size={60} color="white" style={{ opacity: 0.8 }} />
      </View>

      {/* Alerta Visual */}
      {isConnected && data.alerta === 'TANQUE_BAJO' && (
        <View style={styles.alertBox}>
          <Ionicons name="warning" size={24} color="#fff" />
          <Text style={styles.alertText}>¡Nivel de agua bajo! Rellena el tanque.</Text>
        </View>
      )}

      {/* Grid Sensores */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Monitoreo en Tiempo Real</Text>
      <View style={styles.grid}>
        <SensorCard title="Humedad Suelo" value={data.humS} unit="%" icon="leaf" color="#4CAF50" />
        <SensorCard title="Temperatura" value={data.temp} unit="°C" icon="thermometer" color="#FF9800" />
        <SensorCard title="Humedad Amb." value={data.humA} unit="%" icon="cloud" color="#2196F3" />
        <SensorCard title="Nivel Tanque" value={data.dist} unit="cm" icon="beaker" color="#9C27B0" />
      </View>

      {/* Controles */}
      <Text style={[styles.sectionTitle, { color: colors.text }]}>Control Manual</Text>
      <View style={styles.controlsRow}>
        <TouchableOpacity 
          style={[styles.button, styles.buttonOn, { opacity: isConnected ? 1 : 0.5 }]} 
          onPress={() => sendCommand("MANUAL_ON")} disabled={!isConnected}
        >
          <Ionicons name="power" size={24} color="white" />
          <Text style={styles.buttonText}>Encender</Text>
        </TouchableOpacity>

        <TouchableOpacity 
          style={[styles.button, styles.buttonOff, { opacity: isConnected ? 1 : 0.5 }]} 
          onPress={() => sendCommand("MANUAL_OFF")} disabled={!isConnected}
        >
          <Ionicons name="stop-circle-outline" size={24} color="white" />
          <Text style={styles.buttonText}>Apagar</Text>
        </TouchableOpacity>
      </View>

      <TouchableOpacity 
        style={[styles.button, { backgroundColor: isDark ? '#333' : '#E2E8F0', opacity: isConnected ? 1 : 0.5 }]} 
        onPress={() => sendCommand("AUTO")} disabled={!isConnected}
      >
        <Ionicons name="refresh-circle" size={24} color={isDark ? '#FFF' : '#333'} />
        <Text style={[styles.buttonText, { color: isDark ? '#FFF' : '#333' }]}>Activar Modo Automático</Text>
      </TouchableOpacity>

      <View style={{height: 50}}/>
    </ScrollView>
  );
}

// Función auxiliar para pedir permisos (solo necesaria en dispositivos físicos)
async function registerForPushNotificationsAsync() {
  if (Platform.OS === 'android') {
    await Notifications.setNotificationChannelAsync('default', {
      name: 'default',
      importance: Notifications.AndroidImportance.MAX,
      vibrationPattern: [0, 250, 250, 250],
      lightColor: '#FF231F7C',
    });
  }
  const { status: existingStatus } = await Notifications.getPermissionsAsync();
  let finalStatus = existingStatus;
  if (existingStatus !== 'granted') {
    const { status } = await Notifications.requestPermissionsAsync();
    finalStatus = status;
  }
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  contentContainer: { padding: 20 },
  header: { marginBottom: 20, marginTop: 10 },
  greeting: { fontSize: 28, fontWeight: 'bold' },
  subtitle: { fontSize: 16, marginTop: 5 },
  mainCard: { flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', padding: 25, borderRadius: 20, marginBottom: 20, elevation: 5 },
  mainCardTitle: { color: 'rgba(255,255,255,0.8)', fontSize: 16, fontWeight: '600' },
  mainCardStatus: { color: 'white', fontSize: 28, fontWeight: 'bold', marginVertical: 5 },
  mainCardMode: { color: 'rgba(255,255,255,0.9)', fontSize: 14, backgroundColor: 'rgba(0,0,0,0.1)', alignSelf: 'flex-start', paddingHorizontal: 10, paddingVertical: 4, borderRadius: 10 },
  alertBox: { flexDirection: 'row', backgroundColor: '#FF5252', padding: 15, borderRadius: 12, alignItems: 'center', marginBottom: 20 },
  alertText: { color: 'white', fontWeight: 'bold', marginLeft: 10, flex: 1 },
  sectionTitle: { fontSize: 18, fontWeight: 'bold', marginBottom: 15 },
  grid: { flexDirection: 'row', flexWrap: 'wrap', justifyContent: 'space-between', marginBottom: 20 },
  card: { width: (width - 50) / 2, padding: 15, borderRadius: 16, marginBottom: 15, alignItems: 'flex-start', elevation: 2 },
  iconContainer: { padding: 10, borderRadius: 12, marginBottom: 10 },
  cardValue: { fontSize: 24, fontWeight: 'bold' },
  cardUnit: { fontSize: 14, fontWeight: 'normal', marginLeft: 2 },
  cardTitle: { fontSize: 14, marginTop: 5 },
  controlsRow: { flexDirection: 'row', justifyContent: 'space-between', marginBottom: 15 },
  button: { flexDirection: 'row', alignItems: 'center', justifyContent: 'center', padding: 15, borderRadius: 15, width: '100%' },
  buttonOn: { backgroundColor: '#4CAF50', flex: 0.48 },
  buttonOff: { backgroundColor: '#F44336', flex: 0.48 },
  buttonText: { fontWeight: 'bold', fontSize: 16, marginLeft: 8 },
});