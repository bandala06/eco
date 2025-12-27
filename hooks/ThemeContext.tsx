import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useContext, useEffect, useState } from 'react';
import { useColorScheme as useNativeColorScheme } from 'react-native';
import { Colors } from '../constants/theme';

// Definimos los tipos de tema posibles
type ThemeType = 'light' | 'dark' | 'system';

interface ThemeContextType {
  theme: 'light' | 'dark'; // El tema actual activo
  themePreference: ThemeType; // La preferencia guardada (puede ser 'system')
  colors: typeof Colors.light; // Los colores actuales
  setThemePreference: (pref: ThemeType) => void; // Función para cambiar
  toggleTheme: () => void; // Función rápida para alternar
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined);
const STORAGE_KEY = '@theme_preference';

export function ThemeProvider({ children }: { children: React.ReactNode }) {
  const systemColorScheme = useNativeColorScheme(); // Detecta si el cel está en modo oscuro
  const [themePreference, setThemePreferenceState] = useState<ThemeType>('system');
  
  // Este estado calcula el tema real final (si es 'system', usa el del celular)
  const activeTheme = themePreference === 'system' 
    ? (systemColorScheme || 'light') 
    : themePreference;

  // 1. Cargar la preferencia guardada al iniciar
  useEffect(() => {
    const loadTheme = async () => {
      try {
        const savedPref = await AsyncStorage.getItem(STORAGE_KEY);
        if (savedPref) {
          setThemePreferenceState(savedPref as ThemeType);
        }
      } catch (e) {
        console.error("Error cargando tema:", e);
      }
    };
    loadTheme();
  }, []);

  // 2. Función para guardar la preferencia
  const setThemePreference = async (pref: ThemeType) => {
    setThemePreferenceState(pref);
    try {
      await AsyncStorage.setItem(STORAGE_KEY, pref);
    } catch (e) {
      console.error("Error guardando tema:", e);
    }
  };

  // 3. Función rápida para alternar entre claro y oscuro manualmente
  const toggleTheme = () => {
    const newTheme = activeTheme === 'light' ? 'dark' : 'light';
    setThemePreference(newTheme);
  };

  const value = {
    theme: activeTheme,
    themePreference,
    colors: Colors[activeTheme],
    setThemePreference,
    toggleTheme,
  };

  return (
    <ThemeContext.Provider value={value}>
      {children}
    </ThemeContext.Provider>
  );
}

// Este es el Hook que usarás en tus pantallas
export const useTheme = () => {
  const context = useContext(ThemeContext);
  if (!context) {
    throw new Error('useTheme debe usarse dentro de un ThemeProvider');
  }
  return context;
};