import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PhotoSyncService {

  private photoUpdatedSubject = new BehaviorSubject<string>('');
  public photoUpdated$: Observable<string> = this.photoUpdatedSubject.asObservable();

  constructor() { }

  /**
   * Notifica que la foto ha sido actualizada
   * @param newPhotoUrl Nueva URL de la foto
   */
  notifyPhotoUpdate(newPhotoUrl: string): void {
    this.photoUpdatedSubject.next(newPhotoUrl);
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
  }
}
