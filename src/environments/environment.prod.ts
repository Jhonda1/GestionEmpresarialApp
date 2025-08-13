export const environment = {
  production: true,
  
  // 🚀 API Configuration
  urlBack: 'http://192.168.0.224:8016/dev/GestionEmp_Jhonda/',
  // urlBack: 'https://prosof.co:8011/dev/Gestion_Empresarial/',
  
  // 🔒 Security Settings
  allowMixedContent: false,
  isDevelopment: false,
  
  // 📱 App Configuration
  appName: 'GestionEmpresarialApp',
  version: '2.0.0',
  
  // 🎯 Feature Flags
  features: {
    enableBiometric: true,
    enableQRScanner: true,
    enableOfflineMode: true,
    enableAnalytics: true
  },
  
  // ⚡ Performance Settings
  enableServiceWorker: true,
  enableHttpCache: true,
  httpTimeout: 15000,
  
  // 🎨 UI Settings
  theme: 'default',
  language: 'es'
};
