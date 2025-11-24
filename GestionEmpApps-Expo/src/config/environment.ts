export const environment = {
  production: false,
  
  // 🚀 API Configuration
  urlBack: 'http://144.217.75.8:8018/testing/GestionEmpresarial/', // testing
  // urlBack: 'http://144.217.75.8:8018/Release/GestionEmpresarial/', // Release
  
  // 🔒 Security Settings
  allowMixedContent: true,
  isDevelopment: true,
  
  // 📱 App Configuration
  appName: 'Gestión Empresarial',
  version: '2.0.0',
  
  // 🎯 Feature Flags
  features: {
    enableBiometric: true,
    enableQRScanner: true,
    enableOfflineMode: true,
    enableAnalytics: false
  },
  
  // ⚡ Performance Settings
  enableServiceWorker: false,
  enableHttpCache: true,
  httpTimeout: 30000,
  
  // 🎨 UI Settings
  theme: 'default',
  language: 'es'
};
