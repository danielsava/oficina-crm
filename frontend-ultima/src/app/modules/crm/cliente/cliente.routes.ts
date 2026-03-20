import { Routes } from '@angular/router';

export const ClienteRoute: Routes = [
  {
    path: '',
    loadComponent: () => import('./list/cliente-table.component').then(m => m.ClienteTableComponent)
  },
  {
    path: 'novo',
    loadComponent: () => import('./edit/cliente-form.component').then(m => m.ClienteFormComponent)
  },
  {
    path: 'editar/:id',
    loadComponent: () => import('./edit/cliente-form.component').then(m => m.ClienteFormComponent)
  }
];
