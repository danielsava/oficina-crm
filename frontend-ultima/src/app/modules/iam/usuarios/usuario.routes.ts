import { Routes } from '@angular/router';
import { UsuarioTableComponent } from './list/usuario-table.component';
import { UsuarioFormComponent } from './edit/usuario-form.component';

export const UsuarioRoute: Routes = [
    { path: 'list', component: UsuarioTableComponent },
    { path: 'edit/:id', component: UsuarioFormComponent },
    { path: '', redirectTo: 'list', pathMatch: 'full' }
];
