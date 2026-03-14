import { Routes } from '@angular/router';

export default [
    {
        path: '',
        redirectTo: 'inbox',
        pathMatch: 'full'
    },
    {
        path: 'inbox',
        loadComponent: () => import('./mail-inbox').then((c) => c.MailInbox),
        data: { breadcrumb: 'Inbox' }
    },
    {
        path: 'detail/:id',
        loadComponent: () => import('./mail-detail').then((c) => c.MailDetail),
        data: { breadcrumb: 'Detail' }
    }
] as Routes;
