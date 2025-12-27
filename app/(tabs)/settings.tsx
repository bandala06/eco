import { Ionicons } from '@expo/vector-icons';
import React, { useState } from 'react';
import { ScrollView, StyleSheet, Switch, Text, TouchableOpacity, View } from 'react-native';
// 1. IMPORTAR EL HOOK DEL TEMA
import { useTheme } from '../../hooks/ThemeContext';

export default function SettingsScreen() {
  // 2. OBTENER LOS COLORES Y FUNCIONES DEL CONTEXTO
  const { theme, toggleTheme, colors } = useTheme();
  const isDarkMode = theme === 'dark';

  // Estado simulado para notificaciones (este se queda igual por ahora)
  const [notifications, setNotifications] = useState(true);

  // Componente reutilizable actualizado con colores dinámicos
  const SettingItem = ({ icon, title, type, value, onToggle, color }: any) => (
    <TouchableOpacity 
      // Aplicamos color de fondo y borde dinámicos a la fila
      style={[styles.item, { backgroundColor: colors.cardBackground, borderColor: colors.border }]} 
      disabled={type === 'switch'}
    >
      <View style={[styles.iconContainer, { backgroundColor: color + '15' }]}>
        <Ionicons name={icon} size={22} color={color} />
      </View>
      {/* Aplicamos color de texto dinámico */}
      <Text style={[styles.itemText, { color: colors.text }]}>{title}</Text>
      
      {type === 'switch' ? (
        <Switch 
          value={value} 
          onValueChange={onToggle} 
          // Colores del switch dinámicos
          trackColor={{ false: colors.border, true: colors.tint }}
          thumbColor={"#FFF"}
        />
      ) : (
        // Icono de flecha dinámico
        <Ionicons name="chevron-forward" size={20} color={colors.iconDefault} />
      )}
    </TouchableOpacity>
  );

  return (
    // Color de fondo principal dinámico
    <ScrollView style={[styles.container, { backgroundColor: colors.background }]}>
      {/* Título principal dinámico */}
      <Text style={[styles.headerTitle, { color: colors.text }]}>Ajustes</Text>

      {/* Sección de Perfil (Actualizada para tema oscuro) */}
      <View style={[styles.profileSection, { backgroundColor: colors.cardBackground }]}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>EC</Text>
        </View>
        <View>
          <Text style={[styles.profileName, { color: colors.text }]}>Estudiante Sistemas</Text>
          {/* Usamos un pequeño truco de opacidad para el texto secundario */}
          <Text style={[styles.profileEmail, { color: colors.text, opacity: 0.7 }]}>admin@ecodrop.com</Text>
        </View>
      </View>

      {/* Grupo: Riego */}
      <Text style={styles.sectionHeader}>CONFIGURACIÓN DE RIEGO</Text>
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <SettingItem 
          icon="water" 
          title="Umbral de Humedad" 
          type="link" 
          color="#2196F3" 
        />
        <SettingItem 
          icon="time" 
          title="Programar Horarios" 
          type="link" 
          color="#FF9800" 
        />
      </View>

      {/* Grupo: App */}
      <Text style={styles.sectionHeader}>APLICACIÓN</Text>
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <SettingItem 
          icon="notifications" 
          title="Notificaciones" 
          type="switch" 
          value={notifications}
          onToggle={() => setNotifications(!notifications)}
          color="#E91E63"
        />
        {/* EL INTERRUPTOR REAL DEL MODO OSCURO */}
        <SettingItem 
          icon="moon" 
          title="Modo Oscuro" 
          type="switch" 
          value={isDarkMode} // <-- Usa el estado real
          onToggle={toggleTheme} // <-- Usa la función real
          color="#673AB7"
        />
      </View>

      {/* Grupo: Información */}
      <Text style={styles.sectionHeader}>INFORMACIÓN</Text>
      <View style={[styles.section, { backgroundColor: colors.cardBackground }]}>
        <SettingItem 
          icon="information-circle" 
          title="Sobre EcoDrop" 
          type="link" 
          color="#607D8B" 
        />
        <SettingItem 
          icon="document-text" 
          title="Política de Privacidad" 
          type="link" 
          color="#607D8B" 
        />
      </View>

      <Text style={styles.versionText}>EcoDrop v1.1</Text>
    </ScrollView>
  );
}

// HEMOS ELIMINADO LOS COLORES FIJOS DE FONDO Y TEXTO DE AQUÍ
const styles = StyleSheet.create({
  container: {
    flex: 1,
    // backgroundColor: '#F5F7FA', <-- ELIMINADO
    padding: 20,
  },
  headerTitle: {
    fontSize: 32,
    fontWeight: 'bold',
    // color: '#1A202C', <-- ELIMINADO
    marginBottom: 20,
    marginTop: 20,
  },
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    // backgroundColor: 'white', <-- ELIMINADO
    padding: 20,
    borderRadius: 16,
    marginBottom: 30,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
  },
  avatar: {
    width: 60,
    height: 60,
    borderRadius: 30,
    backgroundColor: '#2196F3',
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  avatarText: {
    color: 'white',
    fontSize: 20,
    fontWeight: 'bold',
  },
  profileName: {
    fontSize: 18,
    fontWeight: 'bold',
    // color: '#2D3748', <-- ELIMINADO
  },
  profileEmail: {
    fontSize: 14,
    // color: '#718096', <-- ELIMINADO (se maneja con opacidad en linea)
  },
  sectionHeader: {
    fontSize: 13,
    fontWeight: 'bold',
    color: '#A0AEC0', // Este color neutro suele verse bien en ambos modos
    marginBottom: 10,
    marginLeft: 10,
    letterSpacing: 1,
  },
  section: {
    // backgroundColor: 'white', <-- ELIMINADO
    borderRadius: 16,
    marginBottom: 25,
    paddingHorizontal: 10,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.05,
    shadowRadius: 5,
    elevation: 2,
    overflow: 'hidden', // Importante para los bordes redondeados con fondo dinámico
  },
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: 15,
    paddingHorizontal: 10,
    borderBottomWidth: 1,
    // borderBottomColor: '#F7FAFC', <-- ELIMINADO
  },
  iconContainer: {
    width: 36,
    height: 36,
    borderRadius: 10,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 15,
  },
  itemText: {
    flex: 1,
    fontSize: 16,
    // color: '#2D3748', <-- ELIMINADO
    fontWeight: '500',
  },
  versionText: {
    textAlign: 'center',
    color: '#CBD5E0',
    marginBottom: 40,
  },
});