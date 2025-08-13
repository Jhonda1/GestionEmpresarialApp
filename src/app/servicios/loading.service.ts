import { Injectable } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';

export interface LoadingState {
  isLoading: boolean;
  message?: string;
  key?: string; // Para manejar múltiples cargas simultáneas
}

@Injectable({
  providedIn: 'root'
})
export class LoadingService {
  private loadingStates = new Map<string, LoadingState>();
  private globalLoadingSubject = new BehaviorSubject<LoadingState>({ isLoading: false });
  
  constructor() { }

  /**
   * Muestra el spinner con un mensaje específico
   * @param message Mensaje a mostrar
   * @param key Clave única para identificar esta carga (opcional)
   */
  show(message: string = 'Cargando...', key: string = 'default'): void {
    const loadingState: LoadingState = {
      isLoading: true,
      message,
      key
    };
    
    this.loadingStates.set(key, loadingState);
    this.updateGlobalState();
  }

  /**
   * Oculta el spinner
   * @param key Clave de la carga a ocultar (opcional)
   */
  hide(key: string = 'default'): void {
    this.loadingStates.delete(key);
    this.updateGlobalState();
  }

  /**
   * Oculta todos los spinners activos
   */
  hideAll(): void {
    this.loadingStates.clear();
    this.updateGlobalState();
  }

  /**
   * Observable para escuchar cambios en el estado de carga global
   */
  getLoadingState(): Observable<LoadingState> {
    return this.globalLoadingSubject.asObservable();
  }

  /**
   * Verifica si hay alguna carga activa
   */
  isLoading(key?: string): boolean {
    if (key) {
      return this.loadingStates.has(key) && this.loadingStates.get(key)?.isLoading === true;
    }
    return this.loadingStates.size > 0;
  }

  /**
   * Obtiene el mensaje de carga actual
   */
  getCurrentMessage(): string {
    const states = Array.from(this.loadingStates.values());
    return states.length > 0 ? states[0].message || 'Cargando...' : 'Cargando...';
  }

  /**
   * Actualiza el estado global basado en los estados individuales
   */
  private updateGlobalState(): void {
    const hasActiveLoading = this.loadingStates.size > 0;
    const currentMessage = this.getCurrentMessage();
    
    this.globalLoadingSubject.next({
      isLoading: hasActiveLoading,
      message: currentMessage
    });
  }

  /**
   * Ejecuta una función con spinner automático
   * @param fn Función a ejecutar
   * @param message Mensaje del spinner
   * @param key Clave única para el spinner
   */
  async withLoading<T>(
    fn: () => Promise<T>, 
    message: string = 'Cargando...', 
    key: string = 'default'
  ): Promise<T> {
    try {
      this.show(message, key);
      const result = await fn();
      return result;
    } finally {
      this.hide(key);
    }
  }
}
