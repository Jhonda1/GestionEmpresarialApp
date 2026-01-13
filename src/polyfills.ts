/***************************************************************************************************
 * Polyfills para compatibilidad con Android 9 y versiones anteriores
 * Polyfills completos para máxima compatibilidad
 */
import './globalthis-polyfill';

// Polyfills específicos para Android 9 WebView - solo lo necesario para evitar romper Angular 20
import 'core-js/es/array';
import 'core-js/es/promise';
import 'core-js/es/object';
import 'core-js/es/function';
import 'core-js/es/parse-int';
import 'core-js/es/parse-float';
import 'core-js/es/number';
import 'core-js/es/date';
import 'core-js/es/string';
import 'core-js/es/regexp';
import 'core-js/es/map';
import 'core-js/es/set';

/***************************************************************************************************
 * Polyfill para queueMicrotask (requerido para Android 9)
 */
if (typeof queueMicrotask === 'undefined') {
  console.log('GestionEmpresarial: Aplicando polyfill para queueMicrotask (Android 9 compatibility)');
  (window as any).queueMicrotask = function(callback: () => void) {
    Promise.resolve().then(() => callback()).catch(e => setTimeout(() => { throw e; }, 0));
  };
}

/***************************************************************************************************
 * Polyfill para PerformanceObserver (Android 9 compatibility)
 */
if (typeof PerformanceObserver === 'undefined') {
  console.log('GestionEmpresarial: Aplicando polyfill para PerformanceObserver (Android 9 compatibility)');
  (window as any).PerformanceObserver = class {
    private callback: Function;
    private entryTypes: string[] = [];
    
    constructor(callback: Function) {
      this.callback = callback;
    }
    
    observe(options: any) {
      try {
        if (!options || !options.entryTypes) {
          console.warn('GestionEmpresarial PerformanceObserver polyfill: entryTypes is required but missing');
          return;
        }
        
        // Almacenar los tipos de entrada solicitados
        this.entryTypes = Array.isArray(options.entryTypes) ? options.entryTypes : [options.entryTypes];
        console.log('GestionEmpresarial PerformanceObserver polyfill: observing', this.entryTypes);
      } catch (error) {
        console.error('GestionEmpresarial PerformanceObserver.observe error:', error);
      }
    }
    
    disconnect() {
      this.entryTypes = [];
      console.log('GestionEmpresarial PerformanceObserver polyfill: disconnect called');
    }
    
    takeRecords() {
      return [];
    }
  };
} else {
  // Parche para PerformanceObserver existente pero roto en Android 9/14
  try {
    const originalObserve = PerformanceObserver.prototype.observe;
    const originalDisconnect = PerformanceObserver.prototype.disconnect;
    const originalTakeRecords = PerformanceObserver.prototype.takeRecords;
    
    // Parche para observe
    PerformanceObserver.prototype.observe = function(options: any) {
      try {
        if (!options || !options.entryTypes) {
          console.warn('GestionEmpresarial: PerformanceObserver.observe called without entryTypes, skipping');
          return;
        }
        
        // Asegurar que entryTypes es un array
        if (!Array.isArray(options.entryTypes)) {
          options.entryTypes = [options.entryTypes];
        }
        
        // Filtrar entryTypes válidos para evitar errores
        const validTypes = ['navigation', 'resource', 'paint', 'measure', 'mark', 'longtask', 'largest-contentful-paint', 'layout-shift', 'first-input'];
        options.entryTypes = options.entryTypes.filter((type: string) => validTypes.includes(type));
        
        if (options.entryTypes.length === 0) {
          console.warn('GestionEmpresarial: No valid entryTypes found');
          return;
        }
        
        return originalObserve.call(this, options);
      } catch (error) {
        console.warn('GestionEmpresarial: PerformanceObserver.observe failed, using fallback:', error);
      }
    };
    
    // Parche para disconnect
    PerformanceObserver.prototype.disconnect = function() {
      try {
        return originalDisconnect?.call(this);
      } catch (error) {
        console.warn('GestionEmpresarial: PerformanceObserver.disconnect failed:', error);
      }
    };
    
    // Parche para takeRecords
    if (originalTakeRecords) {
      PerformanceObserver.prototype.takeRecords = function() {
        try {
          return originalTakeRecords.call(this);
        } catch (error) {
          console.warn('GestionEmpresarial: PerformanceObserver.takeRecords failed:', error);
          return [];
        }
      };
    }
  } catch (error) {
    console.error('GestionEmpresarial: Failed to patch PerformanceObserver:', error);
  }
}

/***************************************************************************************************
 * Load `$localize` onto the global scope - used if i18n tags appear in Angular templates.
 */
import '@angular/localize/init';

/**
 * This file includes polyfills needed by Angular and is loaded before the app.
 * You can add your own extra polyfills to this file.
 *
 * This file is divided into 2 sections:
 *   1. Browser polyfills. These are applied before loading ZoneJS and are sorted by browsers.
 *   2. Application imports. Files imported after ZoneJS that should be loaded before your main
 *      file.
 *
 * The current setup is for so-called "evergreen" browsers; the last versions of browsers that
 * automatically update themselves. This includes Safari >= 10, Chrome >= 55 (including Opera),
 * Edge >= 13 on the desktop, and iOS 10 and Chrome on mobile.
 *
 * Learn more in https://angular.io/guide/browser-support
 */

/***************************************************************************************************
 * BROWSER POLYFILLS
 */

/**
 * By default, zone.js will patch all possible macroTask and DomEvents
 * user can disable parts of macroTask/DomEvents patch by setting following flags
 * because those flags need to be set before `zone.js` being loaded, and webpack
 * will put import in the top of bundle, so user need to create a separate file
 * in this directory (for example: zone-flags.ts), and put the following flags
 * into that file, and then add the following code before importing zone.js.
 * import './zone-flags';
 *
 * The flags allowed in zone-flags.ts are listed here.
 *
 * The following flags will work for all browsers.
 *
 * (window as any).__Zone_disable_requestAnimationFrame = true; // disable patch requestAnimationFrame
 * (window as any).__Zone_disable_on_property = true; // disable patch onProperty such as onclick
 * (window as any).__zone_symbol__UNPATCHED_EVENTS = ['scroll', 'mousemove']; // disable patch specified eventNames
 *
 *  in IE/Edge developer tools, the addEventListener will also be wrapped by zone.js
 *  with the following flag, it will bypass `zone.js` patch for IE/Edge
 *
 *  (window as any).__Zone_enable_cross_context_check = true;
 *
 */

import './zone-flags';

/***************************************************************************************************
 * Zone JS is required by default for Angular itself.
 */
import 'zone.js';  // Included with Angular CLI.


/***************************************************************************************************
 * APPLICATION IMPORTS
 */
