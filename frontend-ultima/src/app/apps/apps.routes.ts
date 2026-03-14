import { Routes } from '@angular/router';

export default [
    {
        path: 'cms',
        loadChildren: () => import('./cms/cms.routes'),
        data: { breadcrumb: 'CMS' }
    },
    {
        path: 'chat',
        loadComponent: () => import('./chat').then((c) => c.Chat),
        data: { breadcrumb: 'Chat' }
    },
    {
        path: 'files',
        loadComponent: () => import('./files').then((c) => c.Files),
        data: { breadcrumb: 'Files' }
    },
    {
        path: 'mail',
        loadChildren: () => import('./mail/mail.routes'),
        data: { breadcrumb: 'Mail' }
    },
    {
        path: 'tasklist',
        loadComponent: () => import('./tasklist').then((c) => c.TaskList),
        data: { breadcrumb: 'Task List' }
    }
] as Routes;
