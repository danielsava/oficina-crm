import { Routes } from '@angular/router';
import { AppLayout } from '@/app/layout/components/app.layout';

export const appRoutes: Routes = [
    {
        path: '',
        component: AppLayout,
        children: [
            { path: '', redirectTo: '/dashboards', pathMatch: 'full' },
            {
                path: 'dashboards',
                data: { breadcrumb: 'Analytics Dashboard' },
                loadChildren: () => import('@/app/pages/dashboard/dashboard.routes')
            },
            {
                path: 'uikit',
                data: { breadcrumb: 'UI Kit' },
                loadChildren: () => import('@/app/pages/uikit/uikit.routes')
            },
            {
                path: 'documentation',
                data: { breadcrumb: 'Documentation' },
                loadComponent: () => import('@/app/pages/documentation/documentation').then((c) => c.Documentation)
            },
            {
                path: 'pages',
                data: { breadcrumb: 'Pages' },
                loadChildren: () => import('@/app/pages/pages.routes')
            },
            {
                path: 'apps',
                data: { breadcrumb: 'Apps' },
                loadChildren: () => import('./app/apps/apps.routes')
            },
            {
                path: 'ecommerce',
                data: { breadcrumb: 'E-Commerce' },
                loadChildren: () => import('@/app/pages/ecommerce/ecommerce.routes')
            },
            {
                path: 'blocks',
                data: { breadcrumb: 'Prime Blocks' },
                loadChildren: () => import('@/app/pages/blocks/blocks.routes')
            },
            {
                path: 'profile',
                data: { breadcrumb: 'User Management' },
                loadChildren: () => import('@/app/pages/usermanagement/usermanagement.routes')
            }
        ]
    },
    { path: 'auth', loadChildren: () => import('@/app/pages/auth/auth.routes') },
    {
        path: 'landing',
        loadComponent: () => import('@/app/pages/landing/landing').then((c) => c.Landing)
    },
    {
        path: 'notfound',
        loadComponent: () => import('@/app/pages/notfound/notfound').then((c) => c.Notfound)
    },
    { path: '**', redirectTo: '/notfound' }
];
