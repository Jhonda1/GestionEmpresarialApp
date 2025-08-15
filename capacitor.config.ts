import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gestionemp.app',
  appName: 'gestionEmp',
  webDir: 'www/browser',
  server: {
    // Permitir navegación a dominios específicos
    allowNavigation: [
      'http://192.168.0.224:8016',
      'https://localhost',
      'http://localhost',
      'https://prosof.co:8011'
    ],
    cleartext: true,
    // Configuración adicional para desarrollo
    hostname: 'localhost',
    androidScheme: 'http', // Usar HTTP en desarrollo para evitar Mixed Content
    iosScheme: 'ionic'
  },
  android: {
    allowMixedContent: true,
    // Configuraciones adicionales para Android
    webContentsDebuggingEnabled: true,
    useLegacyBridge: false
  },
  ios: {
    // Configuraciones para iOS
    allowsLinkPreview: false,
    contentInset: 'automatic'
  },
  plugins: {
    SplashScreen: {
      launchShowDuration: 3000,
      launchAutoHide: true,
      backgroundColor: "#ffffffff",
      androidSplashResourceName: "splash",
      androidScaleType: "CENTER_CROP",
      showSpinner: true,
      androidSpinnerStyle: "large",
      iosSpinnerStyle: "small",
      spinnerColor: "#999999",
      splashFullScreen: true,
      splashImmersive: true,
      layoutName: "launch_screen",
      useDialog: true,
    },
    Camera: {
      saveToGallery: false
    }
  },
};

// Configuración alternativa para producción con HTTPS
// const config: CapacitorConfig = {
//   appId: 'cs.prosof.CocoraSM',
//   appName: 'CocoraSM',
//   webDir: 'www',
//   server: {
//     androidScheme: 'https'
//   }
// };

export default config;