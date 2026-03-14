import { Routes } from '@angular/router';

export default [
    {
        path: 'list',
        loadComponent: () => import('./list').then((c) => c.List),
        data: { breadcrumb: 'List' }
    },
    {
        path: 'detail',
        loadComponent: () => import('./detail').then((c) => c.Detail),
        data: { breadcrumb: 'Detail' }
    },
    {
        path: 'detail2',
        loadComponent: () => import('./detail2').then((c) => c.Detail2),
        data: { breadcrumb: 'Detail-2' }
    },
    {
        path: 'edit',
        loadComponent: () => import('./edit').then((c) => c.Edit),
        data: { breadcrumb: 'Edit' }
    }
] as Routes;
