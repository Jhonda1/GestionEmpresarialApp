// This file can be replaced during build by using the `fileReplacements` array.
// `ng build --prod` replaces `environment.ts` with `environment.prod.ts`.
// The list of file replacements can be found in `angular.json`.

export const environment = {
  production: false,
  // Configuración para desarrollo - HTTP
  urlBack: 'http://192.168.0.224:8016/dev/GestionEmp_Jhonda/',
  
  // Configuración alternativa para desarrollo con HTTPS (si tienes certificados SSL en tu servidor)
  // urlBack: 'https://192.168.0.224:8017/dev/GestionEmp_Jhonda/',
  
  // Configuración para servidor de pruebas HTTPS
  // urlBack: 'https://prosof.co:8011/testing/Gestion_Empresarial/',
  
  // Configuración adicional para manejo de Mixed Content
  allowMixedContent: true,
  isDevelopment: true
};

/*
 * For easier debugging in development mode, you can import the following file
 * to ignore zone related error stack frames such as `zone.run`, `zoneDelegate.invokeTask`.
 *
 * This import should be commented out in production mode because it will have a negative impact
 * on performance if an error is thrown.
 */
// import 'zone.js/dist/zone-error';  // Included with Angular CLI.
