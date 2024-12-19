import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({
	providedIn: 'root'
})
export class SettingsProvider {

	private theme: BehaviorSubject<String>;

	constructor() {
		this.theme = new BehaviorSubject<String>('default-theme');
	}

	setActiveTheme(val: String) {
		this.theme.next(val);
	}

	getActiveTheme() {
		return this.theme.asObservable();
	}

}