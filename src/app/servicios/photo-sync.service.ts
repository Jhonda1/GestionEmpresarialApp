import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable, Subject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhotoSyncService {

  private photoUpdatedSubject = new BehaviorSubject<string>('');
  public photoUpdated$: Observable<string> = this.photoUpdatedSubject.asObservable();
  
  // Subject adicional para forzar actualizaciones incluso si la URL es la misma
  private forceRefreshSubject = new Subject<string>();
  public forceRefresh$: Observable<string> = this.forceRefreshSubject.asObservable();

  constructor() { }

  /**
   * Notifica que la foto ha sido actualizada
   * @param newPhotoUrl Nueva URL de la foto
   */
  notifyPhotoUpdate(newPhotoUrl: string): void {
    this.photoUpdatedSubject.next(newPhotoUrl);
    // También emitir en el subject de forzar refresco para asegurar que se actualiza
    this.forceRefreshSubject.next(newPhotoUrl);
  }

  /**
   * Fuerza una actualización de la foto sin cambiar la URL
   * Útil para cuando la foto se actualiza en el servidor pero no cambia la URL base64
   * @param currentPhotoUrl URL actual de la foto
   */
  forcePhotoRefresh(currentPhotoUrl: string): void {
    this.forceRefreshSubject.next(currentPhotoUrl);
  }

  /**
   * Obtiene la última URL de foto notificada
   */
  getCurrentPhotoUrl(): string {
    return this.photoUpdatedSubject.value;
  }

  /**
   * Resetea el servicio al cerrar sesión o cambiar de usuario
   * Esto evita que la foto del usuario anterior persista en memoria
   */
  reset(): void {
    this.photoUpdatedSubject.next('assets/images/nofoto.png');
    this.forceRefreshSubject.next('assets/images/nofoto.png');
  }
}
