import { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gestionemp.app',
  appName: 'gestionEmp',
  webDir: 'www/browser',
  android: {
    allowMixedContent: true,
    // Configuraciones adicionales para Android
    webContentsDebuggingEnabled: true,
    useLegacyBridge: false
  },
  server: {
    cleartext: true,
    // Configuración adicional para desarrollo
    androidScheme: 'https', // HTTPS para compatibilidad, allowMixedContent permite backend HTTP
    iosScheme: 'ionic'
  }
};

export default config;