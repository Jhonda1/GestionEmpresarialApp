import { Component, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';

@Component({
  selector: 'app-permisos-notification',
  templateUrl: './permisos-notification.component.html',
  styleUrls: ['./permisos-notification.component.scss'],
  standalone: true,
  imports: [CommonModule, IonicModule]
})
export class PermisosNotificationComponent {
  @Input() tipo: 'warning' | 'error' | 'info' = 'warning';
  @Input() mensaje: string = '';
  @Input() mostrar: boolean = false;
  @Input() accion?: string;
  @Input() modulo?: string;
  
  get colorIcon() {
    switch(this.tipo) {
      case 'error': return 'danger';
      case 'warning': return 'warning';
      case 'info': return 'primary';
      default: return 'warning';
    }
  }
  
  get iconoTipo() {
    switch(this.tipo) {
      case 'error': return 'close-circle';
      case 'warning': return 'warning';
      case 'info': return 'information-circle';
      default: return 'lock-closed';
    }
  }
}
