import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeaheadComponent } from './typeahead.component';
@NgModule({
    declarations: [
        TypeaheadComponent
    ],
    imports: [
        CommonModule,
        FormsModule
    ],
    exports: [
        TypeaheadComponent
    ]
})
export class TypeaheadModule { }

