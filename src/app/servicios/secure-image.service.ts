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

    // Verificar si hay problemas de Mixed Content
    if (this.hasMixedContentIssue(imageUrl)) {
      console.warn('Mixed Content detectado. Convirtiendo imagen a base64:', imageUrl);
      return this.convertToBase64(imageUrl);
    }

    // En dispositivos móviles con allowMixedContent, usar URL directa
    if (this.isMobileApp()) {
      return of(imageUrl);
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
      
      // Configurar CORS
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        try {
          canvas.width = img.width;
          canvas.height = img.height;
          ctx?.drawImage(img, 0, 0);
          
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          observer.next(dataURL);
          observer.complete();
        } catch (error) {
          console.error('Error convirtiendo imagen a base64:', error);
          observer.next('assets/images/nofoto.png'); // Fallback
          observer.complete();
        }
      };
      
      img.onerror = (error) => {
        console.error('Error cargando imagen:', error);
        observer.next('assets/images/nofoto.png'); // Fallback
        observer.complete();
      };
      
      // Usar un timeout para evitar que se cuelgue
      const timeout = setTimeout(() => {
        console.warn('Timeout cargando imagen:', imageUrl);
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
          console.error('Error convirtiendo imagen a base64:', error);
          observer.next('assets/images/nofoto.png');
          observer.complete();
        }
      };
      
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
