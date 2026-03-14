import { Component, computed, inject } from '@angular/core';
import { LayoutService } from '@/app/layout/service/layout.service';
import { TooltipModule } from 'primeng/tooltip';
import { ButtonModule } from 'primeng/button';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';

@Component({
    selector: '[app-menu-profile]',
    standalone: true,
    imports: [CommonModule, TooltipModule, ButtonModule, RouterModule],
    template: `<button (click)="toggleMenu()" pTooltip="Profile" [tooltipDisabled]="isTooltipDisabled()" class="cursor-pointer">
            <img src="/demo/images/avatar/amyelsner.png" alt="avatar" style="width: 32px; height: 32px;" />
            <span class="text-start">
                <strong>Amy Elsner</strong>
                <small>Webmaster</small>
            </span>
            <i class="layout-menu-profile-toggler pi pi-fw" [ngClass]="{ 'pi-angle-down': menuProfilePosition() === 'start' || isHorizontal(), 'pi-angle-up': menuProfilePosition() === 'end' && !isHorizontal() }"></i>
        </button>

        @if (menuProfileActive()) {
            <ul [animate.enter]="'p-menuprofile-enter'" [animate.leave]="'p-menuprofile-leave'" [class.overlay-menu]="isHorizontal()">
                <li pTooltip="Settings" [tooltipDisabled]="isTooltipDisabled()" [routerLink]="['/profile/create']">
                    <button class="cursor-pointer" [routerLink]="['/documentation']">
                        <i class="pi pi-cog pi-fw"></i>
                        <span>Settings</span>
                    </button>
                </li>
                <li pTooltip="Profile" [tooltipDisabled]="isTooltipDisabled()">
                    <button class="cursor-pointer" [routerLink]="['/documentation']">
                        <i class="pi pi-file-o pi-fw"></i>
                        <span>Profile</span>
                    </button>
                </li>
                <li pTooltip="Support" [tooltipDisabled]="isTooltipDisabled()">
                    <button class="cursor-pointer" [routerLink]="['/documentation']">
                        <i class="pi pi-compass pi-fw"></i>
                        <span>Support</span>
                    </button>
                </li>
                <li pTooltip="Logout" [tooltipDisabled]="isTooltipDisabled()" [routerLink]="['/auth/login2']">
                    <button class="cursor-pointer p-link">
                        <i class="pi pi-power-off pi-fw"></i>
                        <span>Logout</span>
                    </button>
                </li>
            </ul>
        }`,
    host: {
        class: 'layout-menu-profile'
    },
    styles: [
        `
            /* Menu Profile Enter Animation */
            .p-menuprofile-enter {
                animation: p-animate-menuprofile-expand 400ms cubic-bezier(0.86, 0, 0.07, 1) forwards;
            }

            /* Menu Profile Leave Animation */
            .p-menuprofile-leave {
                animation: p-animate-menuprofile-collapse 400ms cubic-bezier(0.86, 0, 0.07, 1) forwards;
            }

            /* Overlay Menu Enter Animation */
            ul.overlay-menu.p-menuprofile-enter {
                animation: p-animate-menuprofile-overlay-enter 120ms cubic-bezier(0, 0, 0.2, 1) forwards;
            }

            /* Overlay Menu Leave Animation */
            ul.overlay-menu.p-menuprofile-leave {
                animation: p-animate-menuprofile-overlay-leave 100ms linear forwards;
            }

            @keyframes p-animate-menuprofile-expand {
                from {
                    max-height: 0;
                    opacity: 0;
                    overflow: hidden;
                }
                to {
                    max-height: 500px;
                    opacity: 1;
                    overflow: visible;
                }
            }

            @keyframes p-animate-menuprofile-collapse {
                from {
                    max-height: 500px;
                    opacity: 1;
                    overflow: hidden;
                }
                to {
                    max-height: 0;
                    opacity: 0;
                    overflow: hidden;
                }
            }

            @keyframes p-animate-menuprofile-overlay-enter {
                from {
                    opacity: 0;
                    transform: scaleY(0.8);
                }
                to {
                    opacity: 1;
                    transform: scaleY(1);
                }
            }

            @keyframes p-animate-menuprofile-overlay-leave {
                from {
                    opacity: 1;
                }
                to {
                    opacity: 0;
                }
            }
        `
    ]
})
export class AppMenuProfile {
    layoutService = inject(LayoutService);

    isHorizontal = computed(() => this.layoutService.isHorizontal() && this.layoutService.isDesktop());

    menuProfileActive = computed(() => this.layoutService.layoutState().menuProfileActive);

    menuProfilePosition = computed(() => this.layoutService.layoutConfig().menuProfilePosition);

    isTooltipDisabled = computed(() => !this.layoutService.isSlim());

    toggleMenu() {
        if (this.isHorizontal() && this.layoutService.layoutState().activePath) {
            this.layoutService.layoutState.update((val) => ({
                ...val,
                activePath: null,
                menuHoverActive: false
            }));
        }
        this.layoutService.onMenuProfileToggle();
    }
}
