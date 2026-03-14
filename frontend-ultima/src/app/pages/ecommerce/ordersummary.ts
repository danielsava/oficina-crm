import { Component } from '@angular/core';
import { ButtonModule } from 'primeng/button';

interface OrderItem {
    id: number;
    name: string;
    description: string;
    price: number;
    estimatedDelivery: string;
    image: string;
}

interface PaymentMethod {
    type: string;
    last4: string;
    cardNumber: string;
    brand: string;
}

interface ShippingAddress {
    name: string;
    phone: string;
    street: string;
    city: string;
    state: string;
    zip: string;
    country: string;
}

@Component({
    selector: 'app-order-summary',
    imports: [ButtonModule],
    template: `
        <div class="bg-surface-0 dark:bg-surface-900 relative card">
            <div class="bg-emerald-50 dark:bg-emerald-900/20 border-b border-surface-200 dark:border-surface-700">
                <div class="max-w-6xl mx-auto p-6">
                    <div class="flex justify-center items-start gap-2">
                        <div class="flex-1 flex justify-start items-center gap-6">
                            <div class="h-20 w-20 flex items-center justify-center bg-emerald-400/25 rounded-full shrink-0">
                                <div class="h-12 w-12 bg-emerald-400 rounded-full flex justify-center items-center">
                                    <i class="pi pi-check text-emerald-50 text-lg leading-0!"></i>
                                </div>
                            </div>

                            <div class="flex-1 flex flex-col justify-center items-start gap-1">
                                <div class="text-surface-900 dark:text-surface-100 text-sm font-normal leading-tight">Thanks!</div>
                                <div class="text-emerald-700 dark:text-emerald-400 text-2xl font-medium leading-loose">Successful Order</div>
                                <div class="text-surface-900 dark:text-surface-100 text-sm font-normal leading-tight">Your order is on the way. It'll be shipped today. We'll inform you.</div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <div class="max-w-6xl mx-auto px-6 py-8">
                <div class="grid grid-cols-1 xl:grid-cols-3 gap-8">
                    <div class="xl:col-span-2 space-y-4">
                        <div class="space-y-4">
                            @for (item of orderItems; track item.id) {
                                <div class="bg-white dark:bg-surface-800 rounded-xl p-4 flex gap-4">
                                    <img [src]="item.image" [alt]="item.name" class="w-28 h-36 rounded-lg object-cover" />

                                    <div class="flex-1 flex flex-col justify-between">
                                        <div>
                                            <h3 class="text-surface-950 dark:text-surface-0 text-base font-medium mb-1">{{ item.name }}</h3>
                                            <p class="text-surface-500 dark:text-surface-400 text-sm">{{ item.description }}</p>
                                        </div>

                                        <div class="flex flex-col sm:flex-row sm:justify-between sm:items-end gap-2">
                                            <div class="text-primary-600 dark:text-primary-400 text-xl sm:text-2xl font-medium">\${{ item.price.toFixed(2) }}</div>
                                            <div class="flex items-center gap-2 text-surface-500 dark:text-surface-400 text-xs sm:text-sm">
                                                <i class="pi pi-calendar text-sm"></i>
                                                <span>Estimated {{ item.estimatedDelivery }}</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>

                    <div class="xl:col-span-1">
                        <div class="bg-white dark:bg-surface-800 rounded-2xl shadow-lg p-6 space-y-6 xl:-mt-32">
                            <div class="space-y-2">
                                <h3 class="text-surface-900 dark:text-surface-100 text-base font-medium">Credit Card</h3>

                                <div class="flex items-center gap-4">
                                    <div class="w-[80px] h-12 relative bg-linear-to-br from-primary to-primary-400/80 rounded-sm overflow-hidden backdrop-blur-sm">
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

                                    <div class="flex-1 flex flex-col gap-0.5">
                                        <div class="text-surface-900 dark:text-surface-100 text-base font-medium">{{ paymentMethod.cardNumber }}</div>
                                        <div class="text-surface-500 dark:text-surface-400 text-base">Mastercard</div>
                                    </div>
                                </div>
                            </div>

                            <div class="w-full border-t border-surface-200 dark:border-surface-600"></div>

                            <div class="space-y-3">
                                <h4 class="text-surface-700 dark:text-surface-200 text-sm font-medium">Delivery Address</h4>
                                <div class="text-surface-600 dark:text-surface-300 text-sm space-y-1">
                                    <p>{{ shippingAddress.street }} {{ shippingAddress.city }}, {{ shippingAddress.state }} {{ shippingAddress.zip }} {{ shippingAddress.country }}</p>
                                    <p class="text-surface-500 dark:text-surface-400 mt-2">{{ shippingAddress.name }} {{ shippingAddress.phone }}</p>
                                </div>
                            </div>

                            <div class="w-full border-t border-surface-200 dark:border-surface-600"></div>

                            <div class="space-y-3">
                                <div class="flex justify-between items-center">
                                    <span class="text-surface-500 dark:text-surface-400 text-sm">Shipping</span>
                                    <div class="flex items-center gap-2">
                                        <span class="text-emerald-500 font-medium text-sm">Free</span>
                                        <span class="text-surface-500 dark:text-surface-400 text-sm line-through">\${{ shipping.toFixed(2) }}</span>
                                    </div>
                                </div>

                                <div class="flex justify-between items-center">
                                    <span class="text-surface-500 dark:text-surface-400 text-sm">Discount</span>
                                    <span class="text-surface-900 dark:text-surface-100 text-sm font-medium">\${{ discount.toFixed(2) }}</span>
                                </div>

                                <div class="flex justify-between items-center">
                                    <span class="text-surface-500 dark:text-surface-400 text-sm">VAT</span>
                                    <span class="text-surface-900 dark:text-surface-100 text-sm font-medium">\${{ vat.toFixed(2) }}</span>
                                </div>

                                <div class="w-full border-t border-surface-200 dark:border-surface-600 my-3"></div>

                                <div class="flex justify-between items-center">
                                    <span class="text-surface-700 dark:text-surface-200 text-sm font-medium">Total</span>
                                    <span class="text-emerald-500 font-semibold text-lg">\${{ total.toFixed(2) }}</span>
                                </div>
                            </div>

                            <p-button label="Download Invoice" styleClass="w-full py-2.5 rounded-lg bg-primary-600 hover:bg-primary-700 text-white" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class OrderSummary {
    orderItems: OrderItem[] = [
        {
            id: 1,
            name: 'AeroShield™ Storm Jacket',
            description: 'Storm-FIT Windproof & Water-Resistant Jacket',
            price: 279.99,
            estimatedDelivery: 'Saturday, January 18th',
            image: '/demo/images/ecommerce/shopping-cart/ecommerce-shoppingcart-1.jpg'
        },
        {
            id: 2,
            name: 'StormEdge™ Midnight Coat',
            description: 'Storm-FIT Windproof Coat Jacket',
            price: 289.99,
            estimatedDelivery: 'Saturday, January 18th',
            image: '/demo/images/ecommerce/shopping-cart/ecommerce-shoppingcart-2.jpg'
        },
        {
            id: 3,
            name: 'AeroFlex™ All-Weather Jacket',
            description: 'Storm-FIT Linen Jacket',
            price: 319.99,
            estimatedDelivery: 'Saturday, January 18th',
            image: '/demo/images/ecommerce/shopping-cart/ecommerce-shoppingcart-3.jpg'
        }
    ];

    paymentMethod: PaymentMethod = {
        type: 'Credit Card',
        last4: '1089',
        cardNumber: '5200 19****** 1089',
        brand: 'Visa'
    };

    shippingAddress: ShippingAddress = {
        name: 'Robert Fox',
        phone: '+1 (123) 456-7890',
        street: '1234 Elm Street, Apt 56',
        city: 'Springfield',
        state: 'IL',
        zip: '62704',
        country: 'USA'
    };

    shipping = 18.0;
    discount = 111.5;
    vat = 20.0;
    total = 909.97;
}
