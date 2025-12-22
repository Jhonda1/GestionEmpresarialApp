// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  
  // 🚀 API Configuration
  // urlBack: 'http://192.168.0.224:8016/dev/GestionEmp_Jhonda/', // dev
  // urlBack: 'http://144.217.75.8:8018/testing/GestionEmpresarial/', // testing
  // urlBack: 'http://144.217.75.8:8018/Release/GestionEmpresarial/', // Release
  urlBack: 'https://prosof.co:8011/GestionEmpresarial/', // producción

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

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
