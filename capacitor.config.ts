import type { CapacitorConfig } from '@capacitor/cli';

const config: CapacitorConfig = {
  appId: 'com.gestionemp.app',
  appName: 'gestionEmp',
  webDir: 'www/browser',
  // server: {
  //   androidScheme: 'https'
  // },
  android: {
    allowMixedContent: true
  }
};

// const config: CapacitorConfig = {
//   appId: 'cs.prosof.CocoraSM',
//   appName: 'CocoraSM',
//   webDir: 'www',
//   server: {
//     androidScheme: 'https'
//   }
// };

export default config;