import { Routes } from '@angular/router';
import { UserList } from './user-list';
import { UserCreate } from './user-create';
import { CreateLayout } from './create/create-layout';
import { BasicInformation } from './create/basic-information';
import { BusinessInformation } from './create/business-information';
import { LocationInformation } from './create/location-information';
import { Authorization } from './create/authorization';
import { AccountStatus } from './create/account-status';

export default [
    { path: 'list', component: UserList },
    { path: 'create-simple', component: UserCreate },
    {
        path: 'create',
        component: CreateLayout,
        children: [
            { path: '', redirectTo: 'basic-information', pathMatch: 'full' },
            { path: 'basic-information', component: BasicInformation },
            { path: 'business-information', component: BusinessInformation },
            { path: 'location-information', component: LocationInformation },
            { path: 'authorization', component: Authorization },
            { path: 'account-status', component: AccountStatus }
        ]
    },
    { path: '', redirectTo: 'list', pathMatch: 'full' }
] as Routes;
