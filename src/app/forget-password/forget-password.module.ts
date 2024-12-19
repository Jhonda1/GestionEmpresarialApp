import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';
import { ForgetPasswordPageRoutingModule } from './forget-password-routing.module';
import { ForgetPasswordPage } from './forget-password.page';
import { RxReactiveFormsModule } from '@rxweb/reactive-form-validators';

@NgModule({
  imports: [
    CommonModule,
    FormsModule,
    IonicModule,
    ForgetPasswordPageRoutingModule,
	ReactiveFormsModule,
	RxReactiveFormsModule
  ],
  declarations: [ForgetPasswordPage]
})
export class ForgetPasswordPageModule {}
