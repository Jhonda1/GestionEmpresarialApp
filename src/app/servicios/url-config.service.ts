import { Injectable, inject } from '@angular/core';
import { StorageService } from './storage.service';
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
  private storageService = inject(StorageService);
  private readonly CONFIG_KEY = 'url_config';

  constructor() { }

  /**
   * Obtiene la configuración de URLs del storage o valores por defecto
   */
  async getConfig(): Promise<UrlConfig> {
    try {
      const savedConfig = await this.storageService.get(this.CONFIG_KEY);
      if (savedConfig) {
        return JSON.parse(savedConfig);
      }
    } catch (error) {
      // Silenciar el error si es porque el storage no está inicializado
      // Solo loggear si es otro tipo de error
      if (error instanceof Error && !error.message.includes('Database not created')) {
        console.error('Error al obtener configuración de URLs:', error);
      }
    }

    // Valores por defecto desde environment
    return {
      urlPrincipal: environment.urlBack,
      urlContingencia: '',
      usarContingencia: false
    };
  }

  /**
   * Guarda la configuración de URLs en el storage
   */
  async saveConfig(config: UrlConfig): Promise<void> {
    try {
      await this.storageService.set(this.CONFIG_KEY, JSON.stringify(config));
    } catch (error) {
      console.error('Error al guardar configuración de URLs:', error);
      throw error;
    }
  }

  /**
   * Obtiene la URL activa actual (principal o contingencia)
   */
  async getActiveUrl(): Promise<string> {
    const config = await this.getConfig();
    if (config.usarContingencia && config.urlContingencia) {
      return config.urlContingencia;
    }
    return config.urlPrincipal || environment.urlBack;
  }

  /**
   * Reinicia la configuración a valores por defecto
   */
  async resetConfig(): Promise<void> {
    const defaultConfig: UrlConfig = {
      urlPrincipal: environment.urlBack,
      urlContingencia: '',
      usarContingencia: false
    };
    await this.saveConfig(defaultConfig);
  }
}
