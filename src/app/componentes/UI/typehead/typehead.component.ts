import { Component, Input, Output, EventEmitter, OnDestroy, ChangeDetectorRef } from '@angular/core';
import { Subject } from 'rxjs';
import { debounceTime, distinctUntilChanged, switchMap } from 'rxjs/operators';
import type { OnInit } from '@angular/core';
import { Item } from '../types';
import { DatosEmpleadosService } from 'src/app/servicios/datosEmpleados.service';

@Component({
  selector: 'app-typeahead',
  templateUrl: 'typehead.component.html',
  standalone: false
})
export class TypeaheadComponent implements OnInit, OnDestroy {
  @Input() items: Item[] = [];
  @Input() selectedItems: string[] = [];
  @Input() campoNombre: string[] = [];
  @Input() title = 'Select Items';

  @Output() selectionCancel = new EventEmitter<void>();
  @Output() selectionChange = new EventEmitter<string[]>();

  filteredItems: Item[] = [];
  workingSelectedValues: { id: string; name: string }[] = [];
  initialSelectedValues: { id: string; name: string }[] = [];
  search$ = new Subject<string>();
  noResults = false;
  private searchSubscription: any;

  constructor(private datosEmpleadosService: DatosEmpleadosService,private cdr: ChangeDetectorRef) {}

  ngOnInit() {
    // Asegúrate de que `items` y `selectedItems` estén definidos
    this.items = this.items || [];
    this.selectedItems = this.selectedItems || [];

    // Inicializa `workingSelectedValues` con los objetos completos
    this.workingSelectedValues = this.selectedItems.map(id => {
      const item = this.items.find(i => i.value === id);
      return item ? { id: item.value, name: item.text } : { id, name: this.getItemNameById(id) };
    });

    // Guarda una copia de los valores seleccionados inicialmente
    this.initialSelectedValues = [...this.workingSelectedValues];

    // Inicializa `filteredItems` con los elementos seleccionados y los items
    this.filteredItems = this.items.length ? [...this.items] : [...this.workingSelectedValues.map(item => ({ value: item.id, text: item.name }))];

    this.searchSubscription = this.search$
      .pipe(
        debounceTime(600), // Espera 600ms después de que el usuario deja de escribir
        distinctUntilChanged(), // Solo sigue si el término cambió
        switchMap(term => this.obtenerInformacion('enfermedades', '', { search: term }))
      )
      .subscribe(
        (items: Item[]) => {
          this.updateFilteredList(items); // Actualizar la lista filtrada incluyendo los seleccionados
        },
        (error) => {
          console.error('Error al obtener información:', error);
        }
      );
  }

  ngOnDestroy() {
    if (this.searchSubscription) {
      this.searchSubscription.unsubscribe();
    }
  }

  trackItems(index: number, item: Item) {
    return item.value;
  }

  cancelChanges() {
    // Restaura los valores seleccionados a su estado inicial
    this.workingSelectedValues = [...this.initialSelectedValues];
    this.selectionCancel.emit();
    this.cdr.detectChanges();
  }

  confirmChanges() {
    this.initialSelectedValues = [...this.workingSelectedValues];
    this.selectionChange.emit(this.workingSelectedValues.map(item => item.name));
    this.selectionCancel.emit();
  }

  //esta funcion es para obtener el nombre de los items seleccionados
  searchbarInput(ev: any) {
    const term = ev.trim();
    this.search$.next(term);
  }

  obtenerInformacion(metodo: string, funcion: string, datos: any) {
    return this.datosEmpleadosService
      .informacion(datos, 'Autogestion/cSolicitudPermiso/' + metodo)
      .then((resp: any) => {
        const newItems = resp.datos.map((item: any) => ({
          text: item.nombre,
          value: item.id
        }));

        // Actualiza `items` y llama a `updateFilteredList` con los nuevos datos
        this.items = newItems;
        return newItems;
      })
      .catch(err => {
        console.error('Error al obtener la información:', err);
        return [];
      });
  }

  /**
   * Actualiza la lista filtrada incluyendo siempre los elementos seleccionados.
   */
  updateFilteredList(items: { value: string; text: string }[]) {
    // Mapea los IDs seleccionados a objetos completos si no están en la búsqueda
    const selectedItems = this.workingSelectedValues.map(selectedItem => ({
      value: selectedItem.id,
      text: selectedItem.name,
      selected: true, // Indicador de elemento seleccionado
    }));
  
    // Combina los elementos seleccionados con los nuevos resultados
    this.filteredItems = [...selectedItems, ...items].filter(
      (item, index, self) =>
        self.findIndex(i => i.value.trim() === item.value.trim()) === index // Elimina duplicados
    );
  
    // Asegúrate de mantener el estado "selected" en los elementos que ya estaban seleccionados
    this.filteredItems = this.filteredItems.map(item => {
      const isSelected = selectedItems.some(selected => selected.value === item.value);
      return {
        ...item,
        selected: isSelected, // Preserva el estado seleccionado
      };
    });
  
    // Filtra los elementos duplicados basándose en el valor
    const uniqueFilteredItems = this.filteredItems.reduce((acc: { value: string; text: string; selected?: boolean }[], current) => {
      // Eliminar espacios en blanco al inicio y al final del valor
      current.value = current.value.trim();
      const exists = acc.find(item => item.value.split(' ')[0] === current.value.split(' ')[0]);
      if (!exists) {
        return acc.concat([current]);
      } else {
        return acc;
      }
    }, []);
  
    this.filteredItems = uniqueFilteredItems;
    
    // Manejar caso sin resultados
    if (items.length === 0 && selectedItems.length === 0) {
      this.filteredItems = [{ value: 'no-results', text: 'No hay resultados' }];
      this.noResults = true;
    } else {
      this.noResults = false;
    }
  }
  

  isChecked(value: string): boolean {
    return this.workingSelectedValues.some(item => item.id.trim() === value.trim());
  }
  

  checkboxChange(ev: any) {
    const { checked, value } = ev.detail;
    // Buscar el item en la lista original
    const item = this.items.find(i => i.value.trim() === value.trim());
    
    if (value !== 'no-results') {
      if (checked && item) {
        // Agregar el item a la lista de seleccionados
        this.workingSelectedValues = [...this.workingSelectedValues, { id: value, name: item.text }];
      } else {
        // Eliminar el item de la lista de seleccionados
        this.workingSelectedValues = this.workingSelectedValues.filter(
          (selectedItem) => selectedItem.id.trim() !== value.trim()
        );
      }
  
      // Emitir los cambios de selección
      this.selectionChange.emit(this.workingSelectedValues.map((selectedItem) => selectedItem.id));
      // Actualizar la lista filtrada para reflejar los cambios
      this.updateFilteredList(this.filteredItems);
    }
  }
  

  //esta funcion es para obtener el nombre de los items seleccionados
  getItemNameById(id: string): string {
    const item = this.items.find(i => i.value === id);
    return item ? item.text : ` ${id}`;
  }
}
