import { Routes } from '@angular/router';

export const IamRoutes: Routes = [

    {
        path: 'usuarios',
        loadChildren: () => import('./usuarios/usuario.routes').then((m) => m.UsuarioRoute)
    },

    {
        path: '',
        redirectTo: 'usuarios',
        pathMatch: 'full'
    }

];
