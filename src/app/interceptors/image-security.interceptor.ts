import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, of } from 'rxjs';
import { map, catchError } from 'rxjs/operators';

@Injectable()
export class ImageSecurityInterceptor implements HttpInterceptor {

  intercept(req: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {
    // Solo interceptar requests de imágenes
    if (this.esRequestDeImagen(req)) {
      // Verificar si estamos en un contexto HTTPS y el request es HTTP
      if (this.esMixedContent(req)) {
        console.warn('Mixed Content detectado para imagen:', req.url);
        // Intentar convertir la imagen a base64
        return this.convertirImagenABase64(req.url).pipe(
          map(dataUrl => new HttpResponse({ 
            body: dataUrl, 
            status: 200, 
            statusText: 'OK' 
          })),
          catchError(() => {
            // Si falla, devolver imagen por defecto
            return of(new HttpResponse({ 
              body: 'assets/images/nofoto.png', 
              status: 200, 
              statusText: 'OK' 
            }));
          })
        );
      }
    }

    return next.handle(req);
  }

  private esRequestDeImagen(req: HttpRequest<any>): boolean {
    const url = req.url.toLowerCase();
    return url.includes('.jpg') || url.includes('.jpeg') || url.includes('.png') || 
           url.includes('.gif') || url.includes('.webp') || url.includes('foto');
  }

  private esMixedContent(req: HttpRequest<any>): boolean {
    const esHTTPS = window.location.protocol === 'https:';
    const requestEsHTTP = req.url.startsWith('http:');
    return esHTTPS && requestEsHTTP;
  }

  private convertirImagenABase64(url: string): Observable<string> {
    return new Observable(observer => {
      const canvas = document.createElement('canvas');
      const ctx = canvas.getContext('2d');
      const img = new Image();
      
      img.crossOrigin = 'anonymous';
      
      img.onload = () => {
        canvas.width = img.width;
        canvas.height = img.height;
        ctx?.drawImage(img, 0, 0);
        
        try {
          const dataURL = canvas.toDataURL('image/jpeg', 0.8);
          observer.next(dataURL);
          observer.complete();
        } catch (error) {
          observer.error(error);
        }
      };
      
      img.onerror = (error) => {
        observer.error(error);
      };
      
      img.src = url;
    });
  }
}
