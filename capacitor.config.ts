import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gestionemp.app',
  appName: 'gestionEmp',
  webDir: 'www/browser',
  android: {
    allowMixedContent: true,
    // Configuraciones adicionales para Android
    webContentsDebuggingEnabled: true,
    useLegacyBridge: false,
    // CRÍTICO PARA ANDROID 14: Permitir mixed content explícitamente
    // Esto permite que una app HTTPS cargue imágenes de servidores HTTP
    // En Android 14+, esto es bloqueado por defecto por seguridad
  },
  server: {
    cleartext: true,
    // Configuración adicional para desarrollo
    androidScheme: 'http', // Cambiar a HTTP para evitar mixed content en Android 14
    iosScheme: 'ionic'
  }
};

export default config;