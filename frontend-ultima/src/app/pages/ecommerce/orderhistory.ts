import { NgClass } from '@angular/common';
import { Component, computed, model, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { TagModule } from 'primeng/tag';

interface DeliveryAddress {
    title: string;
    address: string;
    city: string;
    name: string;
    phone: string;
}

interface Order {
    id: number;
    orderNumber: string;
    product: string;
    variant: string;
    size: string;
    seller: string;
    image: string;
    date: string;
    status: string;
    statusLabel: string;
    statusColor: 'warn' | 'success' | 'danger' | 'info' | 'secondary' | 'contrast' | undefined;
    total: string;
    subtotal: string;
    shipping: string;
    tax: string;
    cardNumber: string;
    deliveryStatus: string;
    estimatedDelivery: string;
    recipient: string;
    deliveryAddress: DeliveryAddress;
}

@Component({
    selector: 'app-order-history',
    imports: [NgClass, FormsModule, ButtonModule, IconFieldModule, InputIconModule, InputTextModule, TagModule],
    template: `
        <div class="p-6 card">
            <div class="flex flex-col xl:flex-row justify-between items-start gap-6 mb-6">
                <div class="flex flex-wrap gap-3">
                    <button
                        (click)="activeFilter.set('all')"
                        class="px-4.5 py-2.5 rounded-xl text-base font-medium border transition-colors whitespace-nowrap cursor-pointer"
                        [ngClass]="
                            activeFilter() === 'all'
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-950 dark:text-primary-100 shadow-sm'
                                : 'border-surface-200 dark:border-surface-700 text-surface-950 dark:text-surface-0 hover:bg-surface-50 dark:hover:bg-surface-700'
                        "
                    >
                        All
                    </button>
                    <button
                        (click)="activeFilter.set('ongoing')"
                        class="px-4.5 py-2.5 rounded-xl text-base font-medium border transition-colors whitespace-nowrap cursor-pointer"
                        [ngClass]="
                            activeFilter() === 'ongoing'
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-950 dark:text-primary-100 shadow-sm'
                                : 'border-surface-200 dark:border-surface-700 text-surface-950 dark:text-surface-0 hover:bg-surface-50 dark:hover:bg-surface-700'
                        "
                    >
                        Ongoing Orders
                    </button>
                    <button
                        (click)="activeFilter.set('returns')"
                        class="px-4.5 py-2.5 rounded-xl text-base font-medium border transition-colors whitespace-nowrap cursor-pointer"
                        [ngClass]="
                            activeFilter() === 'returns'
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-950 dark:text-primary-100 shadow-sm'
                                : 'border-surface-200 dark:border-surface-700 text-surface-950 dark:text-surface-0 hover:bg-surface-50 dark:hover:bg-surface-700'
                        "
                    >
                        Returns
                    </button>
                    <button
                        (click)="activeFilter.set('cancelled')"
                        class="px-4.5 py-2.5 rounded-xl text-base font-medium border transition-colors whitespace-nowrap cursor-pointer"
                        [ngClass]="
                            activeFilter() === 'cancelled'
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-950 dark:text-primary-100 shadow-sm'
                                : 'border-surface-200 dark:border-surface-700 text-surface-950 dark:text-surface-0 hover:bg-surface-50 dark:hover:bg-surface-700'
                        "
                    >
                        Cancellations
                    </button>
                    <button
                        (click)="activeFilter.set('completed')"
                        class="px-4.5 py-2.5 rounded-xl text-base font-medium border transition-colors whitespace-nowrap cursor-pointer"
                        [ngClass]="
                            activeFilter() === 'completed'
                                ? 'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-950 dark:text-primary-100 shadow-sm'
                                : 'border-surface-200 dark:border-surface-700 text-surface-950 dark:text-surface-0 hover:bg-surface-50 dark:hover:bg-surface-700'
                        "
                    >
                        Completed
                    </button>
                </div>

                <div class="w-full xl:w-56">
                    <p-iconfield iconPosition="left">
                        <p-inputicon class="pi pi-search text-surface-500 dark:text-surface-400" />
                        <input type="text" pInputText [ngModel]="searchQuery()" (ngModelChange)="searchQuery.set($event)" placeholder="Search" class="w-full" />
                    </p-iconfield>
                </div>
            </div>

            <div class="flex flex-col gap-6">
                @for (order of filteredOrders(); track order.id) {
                    <div class="rounded-3xl border border-surface-200 dark:border-surface-700 overflow-hidden">
                        <div class="p-6 xl:p-8 relative cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors" (click)="toggleOrder(order.id)">
                            <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-4 xl:gap-6 pr-8">
                                <div class="flex items-center gap-4 xl:gap-8 w-full xl:w-auto">
                                    <img class="w-12 h-12 rounded-lg shrink-0" [src]="order.image" [alt]="order.product" />
                                    <div class="flex flex-col sm:flex-row sm:items-center gap-2 sm:gap-4 flex-1 xl:flex-none">
                                        <div class="flex items-center gap-1">
                                            <span class="text-surface-500 dark:text-surface-400 text-base xl:text-lg font-medium">Order No: </span>
                                            <span class="text-surface-950 dark:text-surface-0 text-base xl:text-lg font-medium">{{ order.orderNumber }}</span>
                                        </div>
                                        <div class="block sm:hidden">
                                            <p-tag [value]="order.statusLabel" [severity]="order.statusColor" styleClass="text-xs font-semibold whitespace-nowrap" />
                                        </div>
                                    </div>
                                </div>

                                <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-6 xl:gap-8 w-full xl:w-auto">
                                    <div class="hidden sm:block xl:w-40">
                                        <p-tag [value]="order.statusLabel" [severity]="order.statusColor" styleClass="text-sm font-semibold whitespace-nowrap" />
                                    </div>

                                    <div class="flex justify-between items-center gap-4 w-full sm:w-auto">
                                        <div class="text-surface-500 dark:text-surface-400 text-base xl:text-lg font-medium xl:w-44">{{ order.date }}</div>
                                        <div class="text-green-600 dark:text-green-400 text-base xl:text-lg font-medium xl:w-32">{{ order.total }}</div>
                                    </div>
                                </div>
                            </div>

                            <i
                                class="pi pi-chevron-down text-surface-500 transition-transform duration-200 dark:text-surface-400 text-lg xl:text-xl absolute right-6 xl:right-8 top-1/2 -translate-y-1/2 pointer-events-none"
                                [ngClass]="{ 'rotate-180': expandedOrders[order.id], 'rotate-0': !expandedOrders[order.id] }"
                            ></i>
                        </div>

                        <div class="grid transition-[grid-template-rows] duration-300 ease-out" [style.gridTemplateRows]="expandedOrders[order.id] ? '1fr' : '0fr'">
                            <div class="overflow-hidden min-h-0">
                                <div class="border-t border-surface-200 dark:border-surface-700">
                                    <div class="p-7">
                                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8 mb-7">
                                            <div class="flex items-start gap-4">
                                                <img class="w-29 h-29 rounded-xl" [src]="order.image" [alt]="order.product" />
                                                <div class="flex flex-col gap-3">
                                                    <div class="flex items-center gap-3">
                                                        <span class="text-surface-500 dark:text-surface-400 text-sm font-medium">Seller</span>
                                                        <div class="flex items-center gap-1">
                                                            <i class="pi pi-verified text-surface-950 dark:text-surface-0 text-base"></i>
                                                            <span class="text-surface-950 dark:text-surface-0 text-xs font-semibold">{{ order.seller }}</span>
                                                        </div>
                                                    </div>
                                                    <div class="flex flex-col gap-1">
                                                        <div class="text-surface-950 dark:text-surface-0 text-lg font-medium">{{ order.product }}</div>
                                                        <div class="text-surface-500 dark:text-surface-400 text-sm">{{ order.variant }}</div>
                                                    </div>
                                                    <div>
                                                        <span class="text-surface-500 dark:text-surface-400 text-sm">Select Number/Size: </span>
                                                        <span class="text-surface-950 dark:text-surface-0 text-sm font-medium">{{ order.size }}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="flex flex-col gap-4">
                                                <div class="text-surface-900 dark:text-surface-0 text-base font-medium">Credit Card</div>

                                                <div class="flex items-start gap-4">
                                                    <div class="w-44 h-24 relative bg-linear-to-br from-primary to-primary-400/80 rounded-xl overflow-hidden backdrop-blur-sm">
                                                        <svg class="absolute inset-0 w-full h-full" viewBox="0 0 154 86" fill="none" xmlns="http://www.w3.org/2000/svg">
                                                            <rect x="10.0333" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint0_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="14.2346" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint1_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="18.4359" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint2_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="22.6372" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint3_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="30.8424" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint4_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="35.0437" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint5_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="39.245" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint6_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="43.4463" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint7_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="51.6516" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint8_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="55.8528" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint9_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="60.0541" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint10_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="64.2554" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint11_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="72.4607" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint12_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="76.662" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint13_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="80.8633" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint14_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="85.0646" y="60.9168" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint15_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="10.0333" y="72.3836" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint16_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="14.2346" y="72.3836" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint17_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="18.4359" y="72.3836" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint18_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="22.6372" y="72.3836" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint19_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="26.8385" y="72.3836" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint20_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="36.394" y="72.3836" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint21_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="40.5953" y="72.3836" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint22_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="44.7966" y="72.3836" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint23_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="124.7" y="60.8557" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint24_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="128.901" y="60.8557" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint25_linear_1_5)" fill-opacity="0.95" />
                                                            <path d="M133.103 64.5545L134.278 60.3076H134.706L133.53 64.5545H133.103Z" fill="white" fill-opacity="0.72" />
                                                            <rect x="136.437" y="60.8557" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint26_linear_1_5)" fill-opacity="0.95" />
                                                            <rect x="140.639" y="60.8557" width="2.86667" height="2.86667" rx="1.43333" fill="url(#paint27_linear_1_5)" fill-opacity="0.95" />
                                                            <path
                                                                d="M140.356 17.3433C140.292 17.3435 140.23 17.3233 140.179 17.2855C140.145 17.2618 140.116 17.2316 140.094 17.1966C140.072 17.1616 140.057 17.1225 140.05 17.0815C140.043 17.0406 140.044 16.9986 140.052 16.958C140.061 16.9174 140.078 16.8789 140.101 16.8448C140.462 16.3189 140.656 15.6925 140.656 15.0506C140.656 14.4086 140.462 13.7822 140.101 13.2563C140.076 13.2224 140.058 13.1838 140.048 13.1426C140.038 13.1014 140.036 13.0586 140.042 13.0167C140.049 12.9748 140.063 12.9346 140.085 12.8986C140.107 12.8625 140.136 12.8314 140.17 12.807C140.204 12.7826 140.243 12.7654 140.283 12.7565C140.324 12.7475 140.366 12.747 140.407 12.755C140.448 12.7629 140.487 12.7792 140.521 12.8028C140.556 12.8264 140.586 12.8569 140.608 12.8923C141.043 13.5248 141.276 14.2783 141.276 15.0506C141.276 15.8228 141.043 16.5763 140.608 17.2088C140.58 17.2501 140.542 17.2838 140.498 17.3072C140.454 17.3306 140.406 17.343 140.356 17.3433Z"
                                                                fill="white"
                                                            />
                                                            <path
                                                                d="M139.127 16.5639C139.063 16.5638 139.001 16.5436 138.948 16.5061C138.915 16.4824 138.886 16.4522 138.864 16.4172C138.842 16.3822 138.827 16.3431 138.82 16.3021C138.813 16.2612 138.814 16.2192 138.822 16.1786C138.831 16.138 138.848 16.0995 138.871 16.0654C139.075 15.7679 139.184 15.4136 139.184 15.0506C139.184 14.6875 139.075 14.3332 138.871 14.0357C138.824 13.967 138.805 13.8819 138.819 13.7992C138.833 13.7165 138.879 13.6429 138.947 13.5946C139.014 13.5463 139.097 13.5274 139.178 13.5418C139.26 13.5563 139.332 13.603 139.379 13.6718C139.656 14.076 139.805 14.5573 139.805 15.0506C139.805 15.5438 139.656 16.0252 139.379 16.4294C139.351 16.4707 139.313 16.5044 139.269 16.5278C139.225 16.5512 139.176 16.5636 139.127 16.5639Z"
                                                                fill="white"
                                                            />
                                                            <path
                                                                d="M141.586 18.0096C141.529 18.0095 141.474 17.9936 141.425 17.9635C141.376 17.9334 141.337 17.8903 141.311 17.8389C141.285 17.7874 141.273 17.7297 141.277 17.6719C141.28 17.6141 141.3 17.5585 141.332 17.5111C141.827 16.7899 142.093 15.9309 142.093 15.0506C142.093 14.1703 141.827 13.3112 141.332 12.5901C141.307 12.5563 141.288 12.5174 141.277 12.4759C141.266 12.4344 141.264 12.3912 141.27 12.3487C141.276 12.3063 141.291 12.2656 141.313 12.2291C141.335 12.1926 141.364 12.1611 141.399 12.1365C141.433 12.1118 141.472 12.0946 141.513 12.0858C141.555 12.0769 141.597 12.0768 141.638 12.0852C141.68 12.0937 141.719 12.1106 141.753 12.135C141.788 12.1593 141.817 12.1906 141.84 12.2269C142.408 13.0545 142.713 14.0405 142.713 15.051C142.713 16.0615 142.408 17.0475 141.84 17.875C141.811 17.9166 141.773 17.9505 141.729 17.9739C141.685 17.9973 141.636 18.0095 141.586 18.0096Z"
                                                                fill="white"
                                                            />
                                                            <path
                                                                d="M142.815 18.6845C142.758 18.6843 142.703 18.6683 142.654 18.6381C142.606 18.608 142.567 18.5648 142.54 18.5134C142.514 18.462 142.503 18.4043 142.506 18.3466C142.51 18.2889 142.53 18.2333 142.562 18.186C143.193 17.2669 143.531 16.1723 143.531 15.0505C143.531 13.9288 143.193 12.8342 142.562 11.9151C142.537 11.8812 142.519 11.8425 142.509 11.8013C142.499 11.7602 142.497 11.7174 142.503 11.6754C142.51 11.6335 142.525 11.5934 142.547 11.5573C142.569 11.5213 142.597 11.4902 142.632 11.4658C142.666 11.4413 142.704 11.4242 142.745 11.4152C142.785 11.4063 142.827 11.4058 142.868 11.4137C142.909 11.4217 142.948 11.438 142.983 11.4616C143.017 11.4852 143.047 11.5156 143.07 11.5511C143.774 12.5768 144.152 13.7985 144.152 15.0505C144.152 16.3026 143.774 17.5243 143.07 18.55C143.041 18.5916 143.003 18.6256 142.959 18.649C142.914 18.6724 142.865 18.6846 142.815 18.6845Z"
                                                                fill="white"
                                                            />
                                                            <rect x="10.0333" y="10.0332" width="9.55556" height="9.55556" rx="4.77778" fill="url(#paint28_linear_1_5)" fill-opacity="0.9" />
                                                            <rect x="22.9336" y="11.9453" width="25.8" height="5.73333" rx="2.86667" fill="url(#paint29_linear_1_5)" fill-opacity="0.9" />
                                                            <defs>
                                                                <linearGradient id="paint0_linear_1_5" x1="13.4004" y1="60.4406" x2="10.6158" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint1_linear_1_5" x1="17.6017" y1="60.4406" x2="14.8171" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint2_linear_1_5" x1="21.803" y1="60.4406" x2="19.0184" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint3_linear_1_5" x1="26.0043" y1="60.4406" x2="23.2197" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint4_linear_1_5" x1="34.2095" y1="60.4406" x2="31.4249" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint5_linear_1_5" x1="38.4108" y1="60.4406" x2="35.6262" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint6_linear_1_5" x1="42.6121" y1="60.4406" x2="39.8275" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint7_linear_1_5" x1="46.8134" y1="60.4406" x2="44.0288" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint8_linear_1_5" x1="55.0187" y1="60.4406" x2="52.234" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint9_linear_1_5" x1="59.22" y1="60.4406" x2="56.4353" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint10_linear_1_5" x1="63.4213" y1="60.4406" x2="60.6366" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint11_linear_1_5" x1="67.6226" y1="60.4406" x2="64.8379" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint12_linear_1_5" x1="75.8278" y1="60.4406" x2="73.0432" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint13_linear_1_5" x1="80.0291" y1="60.4406" x2="77.2445" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint14_linear_1_5" x1="84.2304" y1="60.4406" x2="81.4458" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint15_linear_1_5" x1="88.4317" y1="60.4406" x2="85.6471" y2="63.3668" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint16_linear_1_5" x1="13.4004" y1="71.9074" x2="10.6158" y2="74.8336" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint17_linear_1_5" x1="17.6017" y1="71.9074" x2="14.8171" y2="74.8336" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint18_linear_1_5" x1="21.803" y1="71.9074" x2="19.0184" y2="74.8336" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint19_linear_1_5" x1="26.0043" y1="71.9074" x2="23.2197" y2="74.8336" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint20_linear_1_5" x1="30.2056" y1="71.9074" x2="27.421" y2="74.8336" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint21_linear_1_5" x1="39.7612" y1="71.9074" x2="36.9765" y2="74.8336" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint22_linear_1_5" x1="43.9625" y1="71.9074" x2="41.1778" y2="74.8336" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint23_linear_1_5" x1="48.1637" y1="71.9074" x2="45.3791" y2="74.8336" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint24_linear_1_5" x1="128.067" y1="60.3795" x2="125.283" y2="63.3057" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint25_linear_1_5" x1="132.268" y1="60.3795" x2="129.484" y2="63.3057" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint26_linear_1_5" x1="139.804" y1="60.3795" x2="137.02" y2="63.3057" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint27_linear_1_5" x1="144.006" y1="60.3795" x2="141.221" y2="63.3057" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint28_linear_1_5" x1="21.2571" y1="8.44575" x2="11.9749" y2="18.1998" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                                <linearGradient id="paint29_linear_1_5" x1="53.2377" y1="10.9928" x2="50.9802" y2="21.6677" gradientUnits="userSpaceOnUse">
                                                                    <stop stop-color="white" stop-opacity="0.92" />
                                                                    <stop offset="1" stop-color="white" stop-opacity="0.64" />
                                                                </linearGradient>
                                                            </defs>
                                                        </svg>
                                                    </div>

                                                    <div class="flex flex-col gap-2">
                                                        <div class="text-green-600 dark:text-green-400 text-2xl font-medium">{{ order.total }}</div>
                                                        <div class="text-surface-900 dark:text-surface-0 text-base font-medium">{{ order.cardNumber }}</div>
                                                        <div class="text-surface-500 dark:text-surface-400 text-base">Mastercard</div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="h-px bg-surface-200 dark:bg-surface-700 my-6"></div>

                                        <div class="grid grid-cols-1 xl:grid-cols-2 gap-8">
                                            <div class="flex flex-col gap-6">
                                                <div class="relative h-4">
                                                    <div class="absolute inset-0 flex items-center">
                                                        <div class="h-0.5 w-full bg-surface-200 dark:bg-surface-700"></div>
                                                    </div>
                                                    <div class="absolute inset-0 flex items-center">
                                                        <div
                                                            class="h-0.5 transition-all duration-500 bg-primary"
                                                            [ngClass]="
                                                                getDeliveryProgress(order.deliveryStatus) === 1 ? 'w-0' : getDeliveryProgress(order.deliveryStatus) === 2 ? 'w-1/3' : getDeliveryProgress(order.deliveryStatus) === 3 ? 'w-2/3' : 'w-full'
                                                            "
                                                        ></div>
                                                    </div>
                                                    <div class="relative flex justify-between">
                                                        <div
                                                            class="w-4 h-4 rounded-full border-2 bg-white dark:bg-surface-900 transition-colors"
                                                            [ngClass]="getDeliveryProgress(order.deliveryStatus) >= 1 ? 'border-primary' : 'border-surface-200 dark:border-surface-700'"
                                                        ></div>
                                                        <div
                                                            class="w-4 h-4 rounded-full border-2 bg-white dark:bg-surface-900 transition-colors"
                                                            [ngClass]="getDeliveryProgress(order.deliveryStatus) >= 2 ? 'border-primary' : 'border-surface-200 dark:border-surface-700'"
                                                        ></div>
                                                        <div
                                                            class="w-4 h-4 rounded-full border-2 bg-white dark:bg-surface-900 transition-colors"
                                                            [ngClass]="getDeliveryProgress(order.deliveryStatus) >= 3 ? 'border-primary' : 'border-surface-200 dark:border-surface-700'"
                                                        ></div>
                                                        <div
                                                            class="w-4 h-4 rounded-full border-2 bg-white dark:bg-surface-900 transition-colors"
                                                            [ngClass]="getDeliveryProgress(order.deliveryStatus) >= 4 ? 'border-primary' : 'border-surface-200 dark:border-surface-700'"
                                                        ></div>
                                                    </div>
                                                </div>

                                                <div class="flex justify-between text-sm font-medium mb-2">
                                                    <span [class]="getDeliveryProgress(order.deliveryStatus) >= 1 ? 'text-surface-950 dark:text-surface-0' : 'text-surface-500 dark:text-surface-400'">Received</span>
                                                    <span [class]="getDeliveryProgress(order.deliveryStatus) >= 2 ? 'text-surface-900 dark:text-surface-100' : 'text-surface-500 dark:text-surface-400'">Processing</span>
                                                    <span [class]="getDeliveryProgress(order.deliveryStatus) >= 3 ? 'text-surface-900 dark:text-surface-100' : 'text-surface-500 dark:text-surface-400'">Shipping</span>
                                                    <span [class]="getDeliveryProgress(order.deliveryStatus) >= 4 ? 'text-surface-900 dark:text-surface-100' : 'text-surface-500 dark:text-surface-400'">Delivered</span>
                                                </div>

                                                <div class="flex flex-col gap-2">
                                                    <div class="flex items-center justify-between">
                                                        <div>
                                                            <span class="text-surface-500 dark:text-surface-400 text-sm">Estimated delivery date: </span>
                                                            <span class="text-surface-900 dark:text-surface-100 text-sm">{{ order.estimatedDelivery }}</span>
                                                        </div>
                                                        <p-button label="Cargo tracking" icon="pi pi-map-marker" [link]="true" styleClass="p-0" />
                                                    </div>
                                                    <div>
                                                        <span class="text-surface-500 dark:text-surface-400 text-sm">Person to receive: </span>
                                                        <span class="text-surface-900 dark:text-surface-100 text-sm">{{ order.recipient }}</span>
                                                    </div>
                                                </div>
                                            </div>

                                            <div class="flex flex-col gap-6">
                                                <div class="text-surface-900 dark:text-surface-0 text-base font-medium">Delivery Address</div>
                                                <div class="flex flex-col gap-2">
                                                    <div class="text-surface-500 dark:text-surface-400 text-sm font-medium">{{ order.deliveryAddress.title }}</div>
                                                    <div class="text-surface-500 dark:text-surface-400 text-sm">{{ order.deliveryAddress.address }}</div>
                                                    <div class="text-surface-500 dark:text-surface-400 text-sm">{{ order.deliveryAddress.city }}</div>
                                                    <div class="text-surface-500 dark:text-surface-400 text-sm">{{ order.deliveryAddress.name }} {{ order.deliveryAddress.phone }}</div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>
                }

                @if (filteredOrders().length === 0) {
                    <div class="text-center py-12">
                        <div class="text-surface-500 dark:text-surface-400 text-lg mb-2">No orders found</div>
                        <div class="text-surface-400 dark:text-surface-500 text-base">Try adjusting your search or filter criteria</div>
                    </div>
                }
            </div>
        </div>
    `
})
export class OrderHistory {
    searchQuery = model('');
    activeFilter = signal<'all' | 'ongoing' | 'returns' | 'cancelled' | 'completed'>('all');
    expandedOrders: { [key: number]: boolean } = {};

    orders: Order[] = [
        {
            id: 1,
            orderNumber: '124812476',
            product: 'SkyLum™ Urban Trench Coat',
            variant: 'Premium Urban Design with Weather Protection',
            size: 'M',
            seller: 'StyleHub',
            image: '/demo/images/ecommerce/order-history/ecommerce-orderhistory-1.jpg',
            date: 'January 04, 2025',
            status: 'ongoing',
            statusLabel: 'Order in progress',
            statusColor: 'warn',
            total: '$249.99',
            subtotal: '$249.99',
            shipping: '$0',
            tax: '$0',
            cardNumber: '5200 19****** 1089',
            deliveryStatus: 'processing',
            estimatedDelivery: '07 Jan Pts 2025',
            recipient: 'Robert Fox',
            deliveryAddress: {
                title: 'Home',
                address: '1234 Elm Street, Apt 56',
                city: 'Springfield, IL 62704 USA',
                name: 'Robert Fox',
                phone: '+1 (123) 456-7890'
            }
        },
        {
            id: 2,
            orderNumber: '124812477',
            product: 'AeroFX™ All-Weather Jacket',
            variant: 'Advanced Weather Protection Technology',
            size: 'L',
            seller: 'TechWear',
            image: '/demo/images/ecommerce/order-history/ecommerce-orderhistory-2.jpg',
            date: 'January 10, 2025',
            status: 'ongoing',
            statusLabel: 'Order in progress',
            statusColor: 'warn',
            total: '$319.99',
            subtotal: '$319.99',
            shipping: '$0',
            tax: '$0',
            cardNumber: '4200 18****** 2341',
            deliveryStatus: 'shipping',
            estimatedDelivery: '13 Jan Pts 2025',
            recipient: 'Sarah Johnson',
            deliveryAddress: {
                title: 'Work',
                address: '789 Business Center',
                city: 'Chicago, IL 60601 USA',
                name: 'Sarah Johnson',
                phone: '+1 (234) 567-8901'
            }
        },
        {
            id: 3,
            orderNumber: '124812478',
            product: 'AeroShield™ Storm Jacket',
            variant: 'Storm-FIT Windproof & Water-Resistant',
            size: 'S',
            seller: 'ZenTrailMs',
            image: '/demo/images/ecommerce/order-history/ecommerce-orderhistory-3.jpg',
            date: 'January 12, 2025',
            status: 'completed',
            statusLabel: 'Order completed',
            statusColor: 'success',
            total: '$279.99',
            subtotal: '$279.99',
            shipping: '$0',
            tax: '$0',
            cardNumber: '3100 15****** 7865',
            deliveryStatus: 'delivered',
            estimatedDelivery: '15 Jan Pts 2025',
            recipient: 'Michael Chen',
            deliveryAddress: {
                title: 'Home',
                address: '456 Oak Avenue',
                city: 'Portland, OR 97201 USA',
                name: 'Michael Chen',
                phone: '+1 (345) 678-9012'
            }
        },
        {
            id: 4,
            orderNumber: '124812479',
            product: 'Nukie Windrunner PrimaLoft®',
            variant: 'Premium Insulated Winter Jacket',
            size: 'XL',
            seller: 'SportGear',
            image: '/demo/images/ecommerce/order-history/ecommerce-orderhistory-4.jpg',
            date: 'January 08, 2025',
            status: 'completed',
            statusLabel: 'Order completed',
            statusColor: 'success',
            total: '$299.99',
            subtotal: '$299.99',
            shipping: '$0',
            tax: '$0',
            cardNumber: '6200 17****** 4321',
            deliveryStatus: 'delivered',
            estimatedDelivery: '11 Jan Pts 2025',
            recipient: 'Emma Rodriguez',
            deliveryAddress: {
                title: 'Home',
                address: '789 Maple Drive',
                city: 'Austin, TX 78701 USA',
                name: 'Emma Rodriguez',
                phone: '+1 (456) 789-0123'
            }
        },
        {
            id: 5,
            orderNumber: '124812480',
            product: 'BreGD™ Lightweight Jacket',
            variant: 'Ultra-Light Summer Performance',
            size: 'M',
            seller: 'ActiveWear',
            image: '/demo/images/ecommerce/order-history/ecommerce-orderhistory-5.jpg',
            date: 'January 14, 2025',
            status: 'completed',
            statusLabel: 'Order completed',
            statusColor: 'success',
            total: '$199.99',
            subtotal: '$199.99',
            shipping: '$0',
            tax: '$0',
            cardNumber: '7200 16****** 9876',
            deliveryStatus: 'delivered',
            estimatedDelivery: '17 Jan Pts 2025',
            recipient: 'James Wilson',
            deliveryAddress: {
                title: 'Home',
                address: '321 Elm Street',
                city: 'Denver, CO 80202 USA',
                name: 'James Wilson',
                phone: '+1 (567) 890-1234'
            }
        },
        {
            id: 6,
            orderNumber: '124812481',
            product: 'FlowMotion™ Cape Jacket',
            variant: 'Designer Cape Style with Modern Fit',
            size: 'L',
            seller: 'LuxeFashion',
            image: '/demo/images/ecommerce/order-history/ecommerce-orderhistory-6.jpg',
            date: 'January 16, 2025',
            status: 'completed',
            statusLabel: 'Order completed',
            statusColor: 'success',
            total: '$349.99',
            subtotal: '$349.99',
            shipping: '$0',
            tax: '$0',
            cardNumber: '8200 14****** 5432',
            deliveryStatus: 'delivered',
            estimatedDelivery: '19 Jan Pts 2025',
            recipient: 'Olivia Martinez',
            deliveryAddress: {
                title: 'Home',
                address: '654 Cedar Lane',
                city: 'San Francisco, CA 94102 USA',
                name: 'Olivia Martinez',
                phone: '+1 (678) 901-2345'
            }
        }
    ];

    filteredOrders = computed(() => {
        let filtered = this.orders;

        if (this.activeFilter() !== 'all') {
            switch (this.activeFilter()) {
                case 'ongoing':
                    filtered = filtered.filter((order) => order.status === 'ongoing');
                    break;
                case 'returns':
                    filtered = filtered.filter((order) => order.status === 'returns');
                    break;
                case 'cancelled':
                    filtered = filtered.filter((order) => order.status === 'cancelled');
                    break;
                case 'completed':
                    filtered = filtered.filter((order) => order.status === 'completed');
                    break;
            }
        }

        if (this.searchQuery().trim()) {
            const query = this.searchQuery().toLowerCase().trim();
            filtered = filtered.filter((order) => order.orderNumber.toLowerCase().includes(query) || order.product.toLowerCase().includes(query) || order.variant.toLowerCase().includes(query));
        }

        return filtered;
    });

    toggleOrder(orderId: number) {
        this.expandedOrders[orderId] = !this.expandedOrders[orderId];
    }

    getDeliveryProgress(status: string): number {
        switch (status) {
            case 'pending':
            case 'received':
                return 1;
            case 'processing':
                return 2;
            case 'shipping':
            case 'in_transit':
                return 3;
            case 'delivered':
            case 'completed':
                return 4;
            default:
                return 1;
        }
    }
}
