
import { Component, EventEmitter, Input, OnChanges, OnInit, Output } from '@angular/core';
import { RxFormGroup } from '@rxweb/reactive-form-validators';

@Component({
  selector: 'app-select-autogestion',
  templateUrl: './select-autogestion.component.html',
  styleUrls: ['./select-autogestion.component.scss'],
  standalone: false
})
export class SelectAutogestionComponent implements OnInit, OnChanges {

	@Input() lista: Array<any> = [];
	@Input() valueField: string = '';
	@Input() formControlSelect: string = '';
	@Input() textField: string = '';
	@Input() title: string = '';
	@Input() formulario!: RxFormGroup;
	@Input() cambiovalor: boolean = false;
	@Output() valorSelect = new EventEmitter();
	valorCampo: any;

	constructor() { }

	ngOnInit() { }

	ngOnChanges() {
		this.valorCampo = null;
		if (this.lista && this.lista.length) {
			let enc = this.lista.find(it => it[this.valueField] == this.formulario.get(this.formControlSelect)?.value);
			if (enc) this.valorCampo = enc;
		}
	}

	cambioConjunto(event: any) {
		this.valorCampo = null;
		this.valorSelect.emit({ valor: event.value, key: this.valueField, control: this.formControlSelect });
	}

}
