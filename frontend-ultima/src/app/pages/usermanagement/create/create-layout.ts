import { Component, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router, RouterModule, ActivatedRoute } from '@angular/router';
import { FormStateService } from './form-state.service';

interface MenuItem {
    label: string;
    shortLabel: string;
    icon: string;
    route: string;
}

@Component({
    selector: 'app-create-layout',
    standalone: true,
    imports: [CommonModule, RouterModule],
    template: `
        <div class="flex flex-col xl:flex-row h-full card overflow-hidden !p-0">
            <div class="hidden xl:flex w-80 bg-surface-0 dark:bg-surface-900 rounded-tl-3xl rounded-bl-3xl flex-col overflow-hidden border-r border-surface-200 dark:border-surface-700">
                <div class="px-6 py-5 border-b border-surface-200 dark:border-surface-700">
                    <h1 class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Create User</h1>
                </div>

                <div class="p-6 flex flex-col gap-4">
                    <span class="text-surface-500 dark:text-surface-400 text-sm font-medium leading-tight">Menu</span>

                    @for (item of menuItems; track item.route) {
                        <button (click)="navigateTo(item.route)" [class]="getMenuButtonClass(item.route)">
                            <i [class]="item.icon + ' text-base'"></i>
                            <span [class]="'flex-1 text-left text-base ' + (isActive(item.route) ? 'font-medium' : 'font-normal')">{{ item.label }}</span>
                        </button>
                    }
                </div>
            </div>

            <!-- Mobile Tab Menu -->
            <div class="xl:hidden bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
                <div class="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                    <h1 class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Create User</h1>
                </div>

                <div class="overflow-x-auto">
                    <div class="flex gap-2 p-4 min-w-max">
                        @for (item of menuItems; track item.route) {
                            <button (click)="navigateTo(item.route)" [class]="getMobileMenuButtonClass(item.route)">
                                <i [class]="item.icon + ' text-sm'"></i>
                                <span [class]="'text-sm ' + (isActive(item.route) ? 'font-medium' : 'font-normal')">{{ item.shortLabel }}</span>
                            </button>
                        }
                    </div>
                </div>
            </div>

            <!-- Content Area -->
            <div class="flex-1 rounded-tr-3xl rounded-br-3xl bg-surface-0 dark:bg-surface-900 overflow-auto">
                <router-outlet></router-outlet>
            </div>
        </div>
    `
})
export class CreateLayout {
    menuItems: MenuItem[] = [
        {
            label: 'Basic Information',
            shortLabel: 'Basic',
            icon: 'pi pi-user',
            route: '/profile/create/basic-information'
        },
        {
            label: 'Business Information',
            shortLabel: 'Business',
            icon: 'pi pi-briefcase',
            route: '/profile/create/business-information'
        },
        {
            label: 'Location Information',
            shortLabel: 'Location',
            icon: 'pi pi-map-marker',
            route: '/profile/create/location-information'
        },
        {
            label: 'Authorization and Access',
            shortLabel: 'Access',
            icon: 'pi pi-key',
            route: '/profile/create/authorization'
        },
        {
            label: 'Account Status',
            shortLabel: 'Status',
            icon: 'pi pi-shield',
            route: '/profile/create/account-status'
        }
    ];

    currentRoute = '';

    constructor(
        private router: Router,
        private route: ActivatedRoute,
        public formStateService: FormStateService
    ) {
        this.router.events.subscribe(() => {
            this.currentRoute = this.router.url;
        });
    }

    isActive(menuRoute: string): boolean {
        return this.currentRoute === menuRoute;
    }

    navigateTo(menuRoute: string) {
        this.router.navigate([menuRoute]);
    }

    getMenuButtonClass(route: string): string {
        const baseClass = 'pl-3 pr-2 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer';
        if (this.isActive(route)) {
            return `${baseClass} bg-primary text-surface-0 dark:text-surface-900 shadow-sm`;
        }
        return `${baseClass} text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700`;
    }

    getMobileMenuButtonClass(route: string): string {
        const baseClass = 'px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap';
        if (this.isActive(route)) {
            return `${baseClass} bg-primary text-surface-0 dark:text-surface-900 shadow-sm`;
        }
        return `${baseClass} bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700`;
    }
}
