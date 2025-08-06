import { NgModule } from '@angular/core';
import { CamelCasePipe } from './camel-case/camel-case.pipe';
import { FiltroListaPipe } from './filtro-lista/filtro-lista.pipe';

@NgModule({
    imports: [
        CamelCasePipe,
        FiltroListaPipe
    ],
    exports: [
        CamelCasePipe,
        FiltroListaPipe
    ]
})
export class PipesModule { }