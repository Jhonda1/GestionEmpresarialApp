import { Directive, ElementRef, Input, OnInit } from '@angular/core';

/**
 * Directiva que automáticamente agrega un título (header) al ion-select
 * basado en el texto del ion-label anterior
 * 
 * Uso: <ion-select appAutoSelectTitle ...>
 */
@Directive({
  selector: 'ion-select[appAutoSelectTitle]',
  standalone: true
})
export class AutoSelectTitleDirective implements OnInit {
  @Input() appAutoSelectTitle: string | null = null; // Permite override manual

  constructor(private el: ElementRef) {}

  ngOnInit() {
    const selectElement = this.el.nativeElement;
    
    // Si ya tiene un título manual, no hace nada
    if (this.appAutoSelectTitle) {
      this.updateInterfaceOptions(this.appAutoSelectTitle);
      return;
    }

    // Busca el ion-label anterior al ion-select
    let labelElement = selectElement.previousElementSibling;
    
    // Si hay otros elementos, sigue buscando hacia atrás
    while (labelElement && labelElement.tagName.toLowerCase() !== 'ion-label') {
      labelElement = labelElement.previousElementSibling;
    }

    if (labelElement) {
      const labelText = labelElement.textContent?.trim() || '';
      if (labelText) {
        // Limpia el texto del label (ej: "* Campo" -> "Campo")
        const cleanText = labelText.replace(/^\*\s*/, '').trim();
        this.updateInterfaceOptions(cleanText);
      }
    }
  }

  private updateInterfaceOptions(headerText: string) {
    const selectElement = this.el.nativeElement;
    const currentOptions = selectElement.getAttribute('[interfaceOptions]') || '{}';
    
    try {
      // Obtiene las opciones actuales si existen
      let options: any = {};
      const interfaceAttr = selectElement.getAttribute('[interfaceOptions]');
      if (interfaceAttr && interfaceAttr !== '{}') {
        // Nota: Aquí solo podemos acceder al atributo vinculado en tiempo de compilación
        // Por lo que usamos una propiedad para actualizar en tiempo de ejecución
      }
      
      // Actualiza el objeto interfaceOptions
      options.header = headerText;
      
      // Aplica las opciones al componente ion-select
      selectElement.interfaceOptions = options;
    } catch (e) {
      console.warn('Error al actualizar interfaceOptions:', e);
    }
  }
}
