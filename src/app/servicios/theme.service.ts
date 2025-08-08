
import { Injectable, Inject, DOCUMENT } from '@angular/core';
import { DomController } from '@ionic/angular';
import { Constantes } from '../config/constantes/constantes';
import { StorageService } from './storage.service';

interface Theme {
  name: string;
  styles: ThemeStyle[];
}

interface ThemeStyle {
  themeVariable: string;
  value: string;
}

@Injectable({
  providedIn: 'root'
})
export class ThemeService {
  private themes: Theme[] = Constantes.temas;
  public fontSize: number = 0;
  public temaActual = 'estandar';
  public appliedSize: boolean = false;

  constructor(
    private domCtrl: DomController,
    @Inject(DOCUMENT) private document: Document, // Tipo explícito agregado
    private storage: StorageService
  ) {
    this.storage.get('theme').then((tema) => this.setTheme(tema));
    this.getFontsize();
  }

  setTheme(name: string): void {
    const theme = this.themes.find(theme => theme.name === name);
    if (theme) {
      this.storage.set('theme', name);
      this.temaActual = theme.name;
      this.domCtrl.write(() => {
        theme.styles.forEach(style => {
          this.document.documentElement.style.setProperty(style.themeVariable, style.value);
        });
      });
    }
  }

  setFontSize(size: number, vaciar?: undefined): void { // Tipo de retorno cambiado a void
	if (vaciar) {
	  this.appliedSize = false;
	  this.storage.set('appliedSize', false);
	  return; // No es necesario devolver un valor, solo terminamos la ejecución
	}
	if (size && this.appliedSize) {
	  this.appliedSize = true;
	  this.storage.set('appliedSize', true);
	  this.fontSize = size;
	  this.storage.set('fontSize', this.fontSize);
	  this.document.documentElement.style.setProperty('--default-font', `${this.fontSize}px`);
	}
  }
  

  getFontsize() {
    this.storage.get('fontSize').then((number) => {
      this.storage.get('appliedSize').then((opt) => {
        this.appliedSize = opt;
        this.setFontSize(number);
      });
    });
  }

  getStyle() {
    return this.appliedSize;
  }
}
