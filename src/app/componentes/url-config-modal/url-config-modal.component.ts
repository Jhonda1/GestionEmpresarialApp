import { Component, OnInit, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule, FormBuilder, FormGroup, Validators } from '@angular/forms';
import { IonicModule, ModalController } from '@ionic/angular';
import { UrlConfigService, UrlConfig } from '../../servicios/url-config.service';
import { NotificacionesService } from '../../servicios/notificaciones.service';

@Component({
  selector: 'app-url-config-modal',
  templateUrl: './url-config-modal.component.html',
  styleUrls: ['./url-config-modal.component.scss'],
  standalone: true,
  imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule]
})
export class UrlConfigModalComponent implements OnInit {
  private modalCtrl = inject(ModalController);
  private urlConfigService = inject(UrlConfigService);
  private notificacionesService = inject(NotificacionesService);
  private fb = inject(FormBuilder);

  configForm!: FormGroup;

  ngOnInit() {
    this.initForm();
    this.loadConfig();
  }

  initForm() {
    this.configForm = this.fb.group({
      urlPrincipal: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      urlContingencia: ['', [Validators.pattern(/^https?:\/\/.+/)]],
      usarContingencia: [false]
    });
  }

  async loadConfig() {
    try {
      const config = await this.urlConfigService.getConfig();
      this.configForm.patchValue(config);
    } catch (error) {
      console.error('Error al cargar configuración:', error);
    }
  }

  async guardar() {
    if (this.configForm.invalid) {
      this.notificacionesService.notificacion('Por favor, verifica que la URL principal tenga un formato válido');
      return;
    }

    const config: UrlConfig = this.configForm.value;

    // Validar que si se activa contingencia, haya una URL de contingencia
    if (config.usarContingencia && !config.urlContingencia) {
      this.notificacionesService.notificacion('Debes ingresar una URL de contingencia si deseas activarla');
      return;
    }

    try {
      await this.urlConfigService.saveConfig(config);
      await this.notificacionesService.notificacion('Configuración guardada exitosamente', 3000, 'bottom', 'success');
      this.cerrar(true);
    } catch (error) {
      console.error('Error al guardar configuración:', error);
      await this.notificacionesService.notificacion('Error al guardar la configuración', 3000, 'bottom', 'danger');
    }
  }

  cerrar(guardado: boolean = false) {
    this.modalCtrl.dismiss({ guardado });
  }
}
