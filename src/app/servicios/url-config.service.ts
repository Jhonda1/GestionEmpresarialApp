import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';

export interface UrlConfig {
  urlPrincipal: string;
  urlContingencia: string;
  usarContingencia: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class UrlConfigService {
  private readonly CONFIG_KEY = 'url_config';
  private readonly CONTINGENCIA_KEY = 'usar_contingencia';

  constructor() { }

  /**
   * Obtiene la configuración de URLs del localStorage o valores por defecto
   * ✅ Síncrono y persiste entre sesiones (no se borra en logout)
   */
  getConfig(): UrlConfig {
    try {
      const usarContingencia = localStorage.getItem(this.CONTINGENCIA_KEY) === 'true';
      const savedConfig = localStorage.getItem(this.CONFIG_KEY);
      
      if (savedConfig) {
        const config = JSON.parse(savedConfig);
        return {
          ...config,
          usarContingencia
        };
      }
    } catch (error) {
      console.error('Error al obtener configuración de URLs:', error);
    }

    return {
      urlPrincipal: environment.urlBack,
      urlContingencia: environment.urlContingencia,
      usarContingencia: localStorage.getItem(this.CONTINGENCIA_KEY) === 'true'
    };
  }

  /**
   * Guarda la configuración de URLs en localStorage
   * ✅ Persiste entre sesiones (no se borra en logout)
   */
  saveConfig(config: UrlConfig): void {
    try {
      localStorage.setItem(this.CONFIG_KEY, JSON.stringify({
        urlPrincipal: config.urlPrincipal,
        urlContingencia: config.urlContingencia
      }));
      localStorage.setItem(this.CONTINGENCIA_KEY, config.usarContingencia ? 'true' : 'false');
    } catch (error) {
      console.error('Error al guardar configuración de URLs:', error);
      throw error;
    }
  }

  /**
   * Obtiene la URL activa actual (principal o contingencia)
   */
  getActiveUrl(): string {
    if (localStorage.getItem(this.CONTINGENCIA_KEY) === 'true') {
      return environment.urlContingencia;
    }
    return environment.urlBack;
  }

  /**
   * Reinicia la configuración a valores por defecto
   */
  resetConfig(): void {
    localStorage.removeItem(this.CONFIG_KEY);
    localStorage.removeItem(this.CONTINGENCIA_KEY);
  }
}
