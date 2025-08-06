import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { SelectAutogestionComponent } from '../select-autogestion/select-autogestion.component';
import { IonicSelectableComponent } from 'ionic-selectable';
import { IonicModule } from '@ionic/angular';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

@NgModule({
  imports: [
    CommonModule,
    IonicSelectableComponent,
    IonicModule,
    FormsModule,
    ReactiveFormsModule,
    RxReactiveFormsModule
  ],
  declarations: [
    SelectAutogestionComponent,
    
  ],
  exports:[SelectAutogestionComponent],
})
export class SelectAutogestionModule { }
