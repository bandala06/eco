import { Ionicons } from '@expo/vector-icons'; // ¡Un paquete de íconos popular!
import { Tabs } from 'expo-router';
import React from 'react';

export default function TabLayout() {
  return (
    <Tabs>
      <Tabs.Screen
        name="index" // El nombre del archivo .tsx
        options={{
          title: 'Control', // El texto en la pestaña
          tabBarIcon: ({ color }) => (
            <Ionicons name="game-controller-outline" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="devices" // El nombre del archivo .tsx
        options={{
          title: 'Dispositivos',
          tabBarIcon: ({ color }) => (
            <Ionicons name="hardware-chip-outline" size={28} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="settings" // El nombre del archivo .tsx
        options={{
          title: 'Ajustes',
          tabBarIcon: ({ color }) => (
            <Ionicons name="settings-outline" size={28} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
