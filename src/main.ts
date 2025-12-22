import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';
import { defineCustomElements } from '@ionic/pwa-elements/loader';

import { AppModule } from './app/app.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

// Fix para el error "Cannot read properties of null (reading 'offsetHeight')"
// Asegurar que el DOM esté completamente listo antes de inicializar
const initializeApp = () => {
  // Llamar al elemento PWA loader después de la plataforma ha sido inicializada
  defineCustomElements(window);

  platformBrowserDynamic().bootstrapModule(AppModule)
    .catch(err => console.log(err));
};

// Esperar a que el DOM esté completamente listo
if (document.readyState === 'complete' || document.readyState === 'interactive') {
  setTimeout(initializeApp, 1);
} else {
  document.addEventListener('DOMContentLoaded', initializeApp);
}
