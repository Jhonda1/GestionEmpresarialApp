import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { TypeaheadComponent } from './typehead.component';
import { IonicModule } from '@ionic/angular';
@NgModule({
    declarations: [
        TypeaheadComponent
    ],
    imports: [
        CommonModule,
        FormsModule,
        IonicModule
    ],
    exports: [
        TypeaheadComponent
    ]
})
export class TypeaheadModule { }

