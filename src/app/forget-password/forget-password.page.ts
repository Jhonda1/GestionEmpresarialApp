/* eslint-disable @typescript-eslint/member-delimiter-style */
import { Component, OnInit } from '@angular/core';
import { DomSanitizer } from '@angular/platform-browser';
import { ActivatedRoute, Router } from '@angular/router';
import { RxFormGroup } from '@rxweb/reactive-form-validators';
import { timer } from 'rxjs';
import { FuncionesGenerales } from '../config/funciones/funciones';
import { CargadorService } from '../servicios/cargador.service';
import { ForgetPasswordService } from '../servicios/forget-password.service';
import { NotificacionesService } from '../servicios/notificaciones.service';
import { StorageService } from '../servicios/storage.service';
import { ThemeService } from '../servicios/theme.service';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, FormsModule, ReactiveFormsModule } from '@angular/forms';
import { IonicModule } from '@ionic/angular';

@Component({
    selector: 'app-forget-password',
    templateUrl: './forget-password.page.html',
    styleUrls: ['./forget-password.page.scss'],
    standalone: true, // Marca el componente como independiente
    imports: [CommonModule, FormsModule, ReactiveFormsModule, IonicModule] // Importa los módulos necesarios
})
export class ForgetPasswordPage implements OnInit {

    formLogin: { formulario: FormGroup } = { formulario: new FormGroup({}) };
    ingresoDocumento = true;
    claseDocumento = '';
    claseUsuario = '';
    verPassword = false;
    verPassword2 = false;
    urlFondoImagen = '/assets/images/fondoLogin.jpg';

    constructor(
        private sanitizer: DomSanitizer,
        private activatedRoute: ActivatedRoute,
        private storageService: StorageService,
        private cargadorService: CargadorService,
        private forgetPassSvc: ForgetPasswordService,
        private theme: ThemeService,
        private router: Router,
        private notificaciones: NotificacionesService,
        private formBuilder: FormBuilder
    ) {
        this.formLogin = { formulario: new FormGroup({}) };
        this.activatedRoute.params.subscribe(({ id, cargar }) => {
            this.configForm();
            if (id !== '0') {
                const numDocuControl = this.formLogin.formulario.get('num_docu');
                if (numDocuControl) {
                    numDocuControl.setValue(id);
                }
            }
            if (cargar !== '0') {
                this.irFormulario();
            }
        }, error => {
            console.log(error);
        });
    }

    ngOnInit() { }

    obtenerFondo() {
        return this.sanitizer.bypassSecurityTrustStyle(`
            background-image: url(${this.urlFondoImagen});
            background-repeat: no-repeat;
            background-size: cover;
            background-position: center;
            background-attachment: fixed;
        `);
    }

    configForm() {
        this.formLogin = FuncionesGenerales.crearFormulario(this.forgetPassSvc);
    }

    irFormulario() {
        this.cargadorService.presentar().then(resp => {
            const numDocuControl = this.formLogin.formulario.get('num_docu');
            if (numDocuControl && numDocuControl.valid) {
                const docu = numDocuControl.value ?? '';

                this.forgetPassSvc.recuperarPassword({ docu }, 'Login/valirDocumento').then(({ nit, msj, success }) => {
                    this.cargadorService.ocultar();
                    if (nit) {
                        this.notificaciones.notificacion(msj);
                        this.router.navigateByUrl('/login');
                        return;
                    }

                    if (success) {
                        this.claseDocumento = 'animate__fadeOutLeft';
                        this.ejecutarTimer('claseUsuario', 'animate__fadeInRight').then(item => this.ingresoDocumento = !this.ingresoDocumento);
                    } else {
                        this.notificaciones.notificacion(msj);
                    }
                    return;
                }).catch(error => {
                    console.log(error);
                    this.notificaciones.notificacion('Error de conexión.');
                    this.cargadorService.ocultar();
                });
            }
        });
    }

    async ejecutarTimer(variable: string, clase: string) {
        return await timer(200).toPromise().then(resp => (this as any)[variable] = clase);
    }

    retornar() {
        this.formLogin.formulario.reset();
        this.claseUsuario = 'animate__fadeOutRight';
        this.ejecutarTimer('claseDocumento', 'animate__fadeInLeft').then(item => this.ingresoDocumento = !this.ingresoDocumento);
    }

    get fontSize() {
        return { 'fontSize': this.theme.getStyle() };
    }

    restablecer() {
        if (this.formLogin.formulario.valid) {
            this.cargadorService.presentar().then(resp => {
                let data = { ...this.formLogin.formulario.value };
                this.forgetPassSvc.recuperarPassword(data, 'Login/modificarPassword').then(({ success, msj }) => {
                    this.cargadorService.ocultar();
                    if (success) {
                        this.cargadorService.presentar('Iniciando Sesión...').then(() => {
                            const permisos = FuncionesGenerales.permisos();
                            data = { ...data, permisos };
                            this.forgetPassSvc.iniciarSesionUser(data).then(async respuesta => {
                                if (respuesta && respuesta.valido) {
                                    this.storageService.set('usuario', respuesta.usuario);
                                    this.router.navigateByUrl('/modulos/datosbasicos');
                                    this.notificaciones.presentToastConfirm('Contraseña modificada Exitosamente', 'bottom');
                                    this.formLogin.formulario.reset();
                                    this.retornar();
                                } else {
                                    this.notificaciones.notificacion(respuesta.mensaje);
                                }
                                this.cargadorService.ocultar();
                            }).catch(error => {
                                console.error('Error ', error);
                                this.cargadorService.ocultar();
                            });
                        });
                    } else {
                        this.notificaciones.notificacion(msj);
                    }
                }).catch(error => {
                    console.error('Error ', error);
                    this.cargadorService.ocultar();
                });
            });
        } else {
            FuncionesGenerales.formularioTocado(this.formLogin.formulario);
        }
    }

    irLogin() {
        this.router.navigateByUrl('/login');
    }
}
