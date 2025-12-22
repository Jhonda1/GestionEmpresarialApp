import { Injectable } from '@angular/core';
import { Observable, of, from } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable({
  providedIn: 'root'
})
export class SecureImageService {

  constructor() { }

  /**
   * Obtiene una imagen de forma segura, manejando problemas de Mixed Content
   * @param imageUrl URL de la imagen
   * @returns Observable<string> URL segura o base64 de la imagen
   */
  getSecureImageUrl(imageUrl: string): Observable<string> {
    // Si ya es base64, devolverla directamente
    if (imageUrl.startsWith('data:image')) {
      return of(imageUrl);
    }

    // Si es una imagen local (assets), devolverla directamente
    if (imageUrl.startsWith('assets/')) {
      return of(imageUrl);
    }

    // 🔥 En dispositivos móviles nativos (Android/iOS), SIEMPRE usar URL directa
    // capacitor.config.ts tiene allowMixedContent: true y network_security_config.xml permite HTTP
    if (this.isMobileApp()) {
      return of(imageUrl);
    }

    // Verificar si hay problemas de Mixed Content (solo para WEB)
    if (this.hasMixedContentIssue(imageUrl)) {
      return this.convertToBase64(imageUrl);
    }
    return of(imageUrl);
  }

  /**
   * Verifica si estamos en una aplicación móvil (Capacitor)
   */
  private isMobileApp(): boolean {
    return window && (window as any).Capacitor !== undefined;
  }

  /**
   * Verifica si hay problemas de Mixed Content
   */
  private hasMixedContentIssue(imageUrl: string): boolean {
    const isHTTPS = window.location.protocol === 'https:';
    const imageIsHTTP = imageUrl.startsWith('http:');
    const isWeb = !this.isMobileApp();
    
    return isHTTPS && imageIsHTTP && isWeb;
  }

  /**
   * Convierte una imagen a base64
   */
  private convertToBase64(imageUrl: string): Observable<string> {
    return new Observable<string>(observer => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      
      // Timeout para evitar que se cuelgue
      const timeout = setTimeout(() => {
        observer.next('assets/images/nofoto.png');
        observer.complete();
      }, 10000);
      
      img.onload = () => {
        clearTimeout(timeout);
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          observer.next(dataURL);
          observer.complete();
        } catch (error) {
          console.error('❌ SecureImageService - Error convirtiendo imagen a base64:', error);
          observer.next('assets/images/nofoto.png');
          observer.complete();
        }
      };
      
      img.onerror = (error) => {
        clearTimeout(timeout);
        console.error('❌ SecureImageService - Error cargando imagen:', error);
        console.error('❌ SecureImageService - URL que falló:', imageUrl);
        observer.next('assets/images/nofoto.png');
        observer.complete();
      };
      
      // Intentar cargar la imagen
      img.src = imageUrl;
    });
  }

  /**
   * Pre-carga una imagen y la almacena en cache como base64
   */
  preloadAndCacheImage(imageUrl: string): Promise<string> {
    return this.getSecureImageUrl(imageUrl).toPromise() || Promise.resolve('assets/images/nofoto.png');
  }

  /**
   * Valida si una URL de imagen es accesible
   */
  validateImageUrl(imageUrl: string): Promise<boolean> {
    return new Promise((resolve) => {
      const img = new Image();
      img.onload = () => resolve(true);
      img.onerror = () => resolve(false);
      img.src = imageUrl;
      
      // Timeout de 5 segundos
      setTimeout(() => resolve(false), 5000);
    });
  }
}
