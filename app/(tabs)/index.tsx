import { MaterialCommunityIcons } from '@expo/vector-icons'; // Para los iconos
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context'; // Para manejar las muescas de los teléfonos

// --- Paleta de Colores ---
const Colors = {
  primaryGreen: '#4CAF50', // Verde principal
  secondaryGreen: '#8BC34A', // Verde claro
  brownSoil: '#795548', // Marrón tierra
  blueWater: '#2196F3', // Azul agua
  darkBlue: '#1976D2', // Azul oscuro para contraste
  accentOrange: '#FFC107', // Naranja acento
  lightGray: '#EEEEEE', // Gris claro de fondo
  white: '#FFFFFF', // Blanco para texto y contenedores
  redError: '#F44336', // Rojo para errores o detener
  lightYellowWarning: '#FFFDE7', // Amarillo suave para alertas
};

export default function ControlScreen() {
  const [isPumpActive, setIsPumpActive] = useState(false); // Estado para la bomba
  const [isManualMode, setIsManualMode] = useState(false); // Estado para el modo manual/automático

  // Funciones de ejemplo para manejar la bomba
  const togglePump = () => {
    setIsPumpActive(!isPumpActive);
    // Aquí iría la lógica para enviar el comando Bluetooth al ESP32
    console.log(`Bomba ${isPumpActive ? 'detenida' : 'activada'}`);
  };

  const toggleManualMode = () => {
    setIsManualMode(!isManualMode);
    // Lógica para cambiar el modo en el ESP32
    console.log(`Modo ${isManualMode ? 'Automático' : 'Manual'}`);
  };

  return (
    <SafeAreaView style={styles.safeArea}>
      <ScrollView style={styles.container}>
        {/* Encabezado */}
        <View style={styles.header}>
          <MaterialCommunityIcons name="water" size={24} color={Colors.white} />
          <Text style={styles.headerTitle}>Sistema de Riego</Text>
        </View>

        {/* Sección de Estado General */}
        <View style={[styles.statusCard, { backgroundColor: isPumpActive ? Colors.secondaryGreen : Colors.brownSoil }]}>
          <MaterialCommunityIcons name="water-pump" size={60} color={Colors.white} />
          <Text style={styles.statusText}>Estado de la Bomba:</Text>
          <Text style={styles.statusValue}>{isPumpActive ? 'ACTIVA' : 'INACTIVA'}</Text>
        </View>

        {/* Sección de Sensores */}
        <View style={styles.sensorsGrid}>
          {/* Tarjeta de Humedad */}
          <View style={styles.sensorCard}>
            <MaterialCommunityIcons name="water-percent" size={30} color={Colors.brownSoil} />
            <Text style={styles.sensorTitle}>Humedad del Suelo</Text>
            <Text style={styles.sensorValue}>70%</Text>
          </View>

          {/* Tarjeta de Nivel de Agua */}
          <View style={styles.sensorCard}>
            <MaterialCommunityIcons name="bucket-outline" size={30} color={Colors.blueWater} />
            <Text style={styles.sensorTitle}>Nivel de Agua</Text>
            <Text style={styles.sensorValue}>45°C</Text> {/* Este debería ser el valor de temperatura */}
          </View>

          {/* Tarjeta de Temperatura */}
          <View style={styles.sensorCard}>
            <MaterialCommunityIcons name="thermometer" size={30} color={Colors.redError} />
            <Text style={styles.sensorTitle}>Temperatura</Text>
            <Text style={styles.sensorValue}>25°C</Text>
          </View>

          {/* Tarjeta de Último Riego */}
          <View style={styles.sensorCard}>
            <MaterialCommunityIcons name="clock-outline" size={30} color={Colors.darkBlue} />
            <Text style={styles.sensorTitle}>Último Riego</Text>
            <Text style={styles.sensorValue}>Hace 3 horas</Text>
          </View>
        </View>

        {/* Controles Manuales */}
        <View style={styles.manualControls}>
          <TouchableOpacity
            style={[styles.controlButton, { backgroundColor: isPumpActive ? Colors.redError : Colors.primaryGreen }]}
            onPress={togglePump}
          >
            <MaterialCommunityIcons name={isPumpActive ? "stop" : "play"} size={40} color={Colors.white} />
            <Text style={styles.controlButtonText}>{isPumpActive ? 'Detener Bomba' : 'Activar Bomba'}</Text>
          </TouchableOpacity>
        </View>

        {/* Modo Manual/Automático */}
        <View style={styles.modeToggleContainer}>
          <Text style={styles.modeLabel}>Modo </Text>
          <Text style={styles.modeOption}>Manual</Text>
          <Switch
            trackColor={{ false: Colors.lightGray, true: Colors.primaryGreen }}
            thumbColor={isManualMode ? Colors.white : Colors.white}
            ios_backgroundColor="#3e3e3e"
            onValueChange={toggleManualMode}
            value={isManualMode}
          />
          <Text style={styles.modeOption}>Automático</Text>
        </View>

        {/* Alerta */}
        <View style={styles.alertBanner}>
          <MaterialCommunityIcons name="alert-circle-outline" size={20} color={Colors.brownSoil} />
          <Text style={styles.alertText}>Alerta: Baja humedad en Sector 2</Text>
        </View>

      </ScrollView>
    </SafeAreaView>
  );
}

// --- Estilos de la Interfaz ---
const styles = StyleSheet.create({
  safeArea: {
    flex: 1,
    backgroundColor: Colors.lightGray, // Fondo general de la app
  },
  container: {
    flex: 1,
    backgroundColor: Colors.lightGray,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center', // Centrado
    paddingVertical: 15,
    backgroundColor: Colors.primaryGreen,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  headerTitle: {
    color: Colors.white,
    fontSize: 20,
    fontWeight: 'bold',
    marginLeft: 10,
  },
  statusCard: {
    margin: 15,
    padding: 20,
    borderRadius: 15,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusText: {
    color: Colors.white,
    fontSize: 18,
    marginTop: 10,
  },
  statusValue: {
    color: Colors.white,
    fontSize: 26,
    fontWeight: 'bold',
  },
  sensorsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-around',
    marginHorizontal: 10,
  },
  sensorCard: {
    backgroundColor: Colors.white,
    width: '45%', // Aproximadamente la mitad del ancho, con espacio
    padding: 15,
    borderRadius: 15,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: 10,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.05,
    shadowRadius: 2.22,
    elevation: 3,
  },
  sensorTitle: {
    fontSize: 14,
    color: '#666',
    marginTop: 5,
  },
  sensorValue: {
    fontSize: 18,
    fontWeight: 'bold',
    color: Colors.darkBlue,
    marginTop: 3,
  },
  manualControls: {
    flexDirection: 'row',
    justifyContent: 'center', // Centra el botón
    marginTop: 20,
    marginHorizontal: 15,
  },
  controlButton: {
    flexDirection: 'row', // Icono y texto en línea
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 15,
    paddingHorizontal: 30, // Más ancho
    borderRadius: 30, // Bordes más redondeados
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 3.84,
    elevation: 5,
  },
  controlButtonText: {
    color: Colors.white,
    fontSize: 18,
    fontWeight: 'bold',
    marginLeft: 10, // Espacio entre icono y texto
  },
  modeToggleContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    marginTop: 25,
    marginBottom: 15,
  },
  modeLabel: {
    fontSize: 16,
    color: '#555',
  },
  modeOption: {
    fontSize: 16,
    fontWeight: 'bold',
    color: Colors.darkBlue,
    marginHorizontal: 5,
  },
  alertBanner: {
    backgroundColor: Colors.lightYellowWarning,
    padding: 10,
    marginHorizontal: 15,
    marginTop: 10,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    borderWidth: 1,
    borderColor: Colors.accentOrange,
  },
  alertText: {
    color: Colors.brownSoil,
    fontSize: 14,
    fontWeight: 'bold',
    marginLeft: 8,
  },
});