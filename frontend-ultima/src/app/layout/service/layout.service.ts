import { Injectable, effect, signal, computed, inject } from '@angular/core';
import { Router } from '@angular/router';

export type MenuMode = 'static' | 'overlay' | 'slim-plus' | 'slim' | 'horizontal' | 'reveal' | 'drawer';

export interface LayoutConfig {
    preset: string;
    primary: string;
    surface: string | undefined | null;
    darkTheme: boolean;
    menuMode: MenuMode;
    menuTheme: string;
    topbarTheme: string;
    menuProfilePosition: string;
}

export interface LayoutState {
    staticMenuDesktopInactive: boolean;
    overlayMenuActive: boolean;
    profileSidebarVisible: boolean;
    configSidebarVisible: boolean;
    mobileMenuActive: boolean;
    searchBarActive: boolean;
    sidebarExpanded: boolean;
    menuHoverActive: boolean;
    activePath: any;
    anchored: boolean;
    rightMenuActive: boolean;
    topbarMenuActive: boolean;
    menuProfileActive: boolean;
}

@Injectable({
    providedIn: 'root'
})
export class LayoutService {
    layoutConfig = signal<LayoutConfig>({
        preset: 'Material',
        primary: 'indigo',
        surface: 'slate',
        darkTheme: false,
        menuMode: 'static',
        menuTheme: 'light',
        topbarTheme: 'indigo',
        menuProfilePosition: 'end'
    });

    layoutState = signal<LayoutState>({
        staticMenuDesktopInactive: false,
        overlayMenuActive: false,
        profileSidebarVisible: false,
        configSidebarVisible: false,
        mobileMenuActive: false,
        searchBarActive: false,
        sidebarExpanded: false,
        menuHoverActive: false,
        activePath: null,
        anchored: false,
        rightMenuActive: false,
        topbarMenuActive: false,
        menuProfileActive: false
    });

    router = inject(Router);

    isDarkTheme = computed(() => this.layoutConfig().darkTheme);

    isSlim = computed(() => this.layoutConfig().menuMode === 'slim');

    isSlimPlus = computed(() => this.layoutConfig().menuMode === 'slim-plus');

    isHorizontal = computed(() => this.layoutConfig().menuMode === 'horizontal');

    isOverlay = computed(() => this.layoutConfig().menuMode === 'overlay');

    hasOverlaySubmenu = computed(() => this.isSlim() || this.isSlimPlus() || this.isHorizontal());

    hasOpenOverlay = computed(() => this.layoutState().overlayMenuActive || this.hasOpenOverlaySubmenu());

    hasOpenOverlaySubmenu = computed(() => {
        return this.hasOverlaySubmenu() && !!this.layoutState().activePath;
    });

    isSidebarActive = computed(() => this.layoutState().overlayMenuActive || this.layoutState().mobileMenuActive);

    isSidebarStateChanged = computed(() => {
        const layoutConfig = this.layoutConfig();
        return layoutConfig.menuMode === 'horizontal' || layoutConfig.menuMode === 'slim' || layoutConfig.menuMode === 'slim-plus';
    });

    private initialized = false;

    private previousMenuMode: MenuMode | undefined = undefined;

    constructor() {
        effect(() => {
            const config = this.layoutConfig();

            if (!this.initialized || !config) {
                this.initialized = true;
                return;
            }

            this.handleDarkModeTransition(config);
        });

        effect(() => {
            this.updateMenuState();
        });
    }

    private updateMenuState() {
        const menuMode = this.layoutConfig().menuMode;
        if (this.previousMenuMode === undefined) {
            this.previousMenuMode = menuMode;
            return;
        }

        if (this.previousMenuMode === menuMode) {
            return;
        }

        this.previousMenuMode = menuMode;

        const isOverlaySubmenu = menuMode === 'slim' || menuMode === 'slim-plus' || menuMode === 'horizontal';

        this.layoutState.update((prev) => ({
            ...prev,
            staticMenuDesktopInactive: false,
            overlayMenuActive: false,
            staticMenuMobileActive: false,
            sidebarExpanded: false,
            menuHoverActive: false,
            anchored: false,
            menuProfileActive: false,
            activePath: this.isDesktop() ? (isOverlaySubmenu ? null : this.router.url) : prev.activePath
        }));
    }

    private handleDarkModeTransition(config: LayoutConfig): void {
        const supportsViewTransition = 'startViewTransition' in document;

        if (supportsViewTransition) {
            this.startViewTransition(config);
        } else {
            this.toggleDarkMode(config);
        }
    }

    private startViewTransition(config: LayoutConfig): void {
        (document as any).startViewTransition(() => {
            this.toggleDarkMode(config);
        });
    }

    toggleDarkMode(config?: LayoutConfig): void {
        const _config = config || this.layoutConfig();
        if (_config.darkTheme) {
            document.documentElement.classList.add('app-dark');
        } else {
            document.documentElement.classList.remove('app-dark');
        }
    }

    onMenuToggle() {
        if (this.isDesktop()) {
            if (this.layoutConfig().menuMode === 'static') {
                this.layoutState.update((prev) => ({ ...prev, staticMenuDesktopInactive: !prev.staticMenuDesktopInactive }));
            }

            if (this.layoutConfig().menuMode === 'overlay') {
                this.layoutState.update((prev) => ({ ...prev, overlayMenuActive: !prev.overlayMenuActive }));
            }
        } else {
            this.layoutState.update((prev) => ({ ...prev, mobileMenuActive: !prev.mobileMenuActive }));
        }
    }

    onMenuProfileToggle() {
        this.layoutState.update((prev) => ({ ...prev, menuProfileActive: !prev.menuProfileActive }));
    }

    openRightMenu() {
        this.layoutState.update((prev) => ({ ...prev, rightMenuActive: true }));
    }

    toggleConfigSidebar() {
        this.layoutState.update((prev) => ({
            ...prev,
            configSidebarVisible: !prev.configSidebarVisible
        }));
    }

    hideConfigSidebar() {
        this.layoutState.update((prev) => ({ ...prev, configSidebarVisible: false }));
    }

    isDesktop() {
        return window.innerWidth > 991;
    }
}
