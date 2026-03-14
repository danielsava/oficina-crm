import { Component, computed, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { InputNumberModule } from 'primeng/inputnumber';
import { InputTextModule } from 'primeng/inputtext';

interface CartItem {
    id: number;
    name: string;
    description: string;
    originalPrice: number;
    currentPrice: number;
    earnings: number;
    quantity: number;
    deliveryDate: string;
    image: string;
}

interface RecommendedProduct {
    id: number;
    name: string;
    price: string;
    rating: number;
    image: string;
}

@Component({
    selector: 'app-shopping-cart',
    imports: [FormsModule, ButtonModule, DividerModule, InputNumberModule, InputTextModule],
    template: `
        <div class="flex flex-col card">
            <div class="flex flex-col xl:flex-row">
                <div class="flex-1 xl:border-r border-surface-200 dark:border-surface-700 flex flex-col overflow-hidden">
                    @for (item of cartItems(); track item.id; let i = $index) {
                        <div class="p-4 sm:p-6 bg-surface-0 dark:bg-surface-900 flex flex-col sm:flex-row items-start sm:items-center gap-4">
                            <img [src]="item.image" [alt]="item.name" class="w-full! sm:max-w-32! md:max-w-40! h-48! sm:h-full! rounded-xl! sm:flex-1 object-cover! self-stretch" />

                            <div class="flex-1 w-full flex flex-col gap-3 sm:gap-4">
                                <div class="flex flex-col gap-1">
                                    <div class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">{{ item.name }}</div>
                                    <div class="text-surface-500 dark:text-surface-400 text-sm leading-tight">{{ item.description }}</div>
                                </div>

                                <div class="flex flex-col">
                                    <div class="text-surface-500 dark:text-surface-400 text-base line-through leading-7">\${{ item.originalPrice.toFixed(2) }}</div>
                                    <div class="text-blue-600 dark:text-blue-400 text-2xl font-medium leading-loose">\${{ item.currentPrice.toFixed(2) }}</div>
                                </div>

                                <div class="flex items-center gap-1">
                                    <div class="text-green-600 dark:text-green-400 text-base font-medium">Your earnings</div>
                                    <div class="text-green-600 dark:text-green-400 text-base font-medium">-</div>
                                    <div class="text-green-600 dark:text-green-400 text-base font-medium">(\${{ item.earnings.toFixed(2) }})</div>
                                </div>

                                <div class="flex items-center gap-2">
                                    <i class="pi pi-clock text-surface-500 dark:text-surface-400"></i>
                                    <div class="text-surface-500 dark:text-surface-400 text-base">Estimated {{ item.deliveryDate }}</div>
                                </div>
                            </div>

                            <div class="flex flex-col sm:flex-row items-start sm:items-center gap-3 sm:gap-4">
                                <p-inputNumber [ngModel]="item.quantity" (ngModelChange)="updateQuantity(item.id, $event)" [showButtons]="true" buttonLayout="horizontal" [min]="1" [max]="10" inputStyleClass="w-12!" />
                                <p-button icon="pi pi-trash" severity="danger" [outlined]="true" (onClick)="removeItem(item.id)" />
                            </div>
                        </div>

                        @if (i < cartItems().length - 1) {
                            <div class="px-6 py-2">
                                <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                            </div>
                        }
                    }
                </div>

                <div class="w-full xl:w-96 bg-surface-50 dark:bg-surface-800 flex flex-col">
                    <div class="p-6 flex flex-col gap-4">
                        <div class="flex flex-col gap-2">
                            <div class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Summary</div>
                            <div class="py-2">
                                <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                            </div>
                        </div>

                        <div class="flex flex-col gap-3">
                            <div class="flex justify-between items-center">
                                <div class="text-surface-500 dark:text-surface-400 text-base">Subtotal</div>
                                <div class="text-surface-950 dark:text-surface-0 text-base font-medium">\${{ subtotal().toFixed(2) }}</div>
                            </div>

                            <div class="flex justify-between items-center">
                                <div class="text-green-600 dark:text-green-400 text-base">Your earnings</div>
                                <div class="text-green-600 dark:text-green-400 text-base font-medium">\${{ totalEarnings().toFixed(2) }}</div>
                            </div>

                            <div class="flex justify-between items-center">
                                <div class="text-surface-500 dark:text-surface-400 text-base">Shipping</div>
                                <div class="flex items-center gap-2">
                                    <div class="text-green-500 dark:text-green-400 text-base font-medium">Free</div>
                                    <div class="text-surface-950 dark:text-surface-0 text-base font-medium line-through">$18.00</div>
                                </div>
                            </div>

                            <div class="flex justify-between items-center">
                                <div class="text-surface-500 dark:text-surface-400 text-base">VAT</div>
                                <div class="text-surface-950 dark:text-surface-0 text-base font-medium">\${{ vat().toFixed(2) }}</div>
                            </div>
                        </div>

                        <div class="py-2">
                            <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                        </div>

                        <div class="flex justify-between items-center">
                            <div class="text-surface-500 dark:text-surface-400 text-base">Total</div>
                            <div class="text-surface-950 dark:text-surface-0 text-base font-medium">\${{ total().toFixed(2) }}</div>
                        </div>

                        <p-button label="Check Out" styleClass="w-full px-3 py-2 rounded-xl text-base font-medium" (onClick)="checkout()" />

                        <div class="py-2">
                            <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                        </div>

                        <div class="flex flex-col sm:flex-row items-stretch sm:items-end gap-2">
                            <div class="flex-1 flex flex-col gap-2">
                                <label class="text-surface-900 dark:text-surface-0 text-base">Promotion Code</label>
                                <input type="text" pInputText [(ngModel)]="promoCode" placeholder="Enter Coupon" class="w-full" />
                            </div>
                            <p-button label="Apply" severity="contrast" styleClass="w-full sm:w-auto" (onClick)="applyPromoCode()" />
                        </div>
                    </div>

                    <div class="py-2 bg-surface-50 dark:bg-surface-800">
                        <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                    </div>

                    <div class="flex-1 p-6 bg-surface-50 dark:bg-surface-800 flex flex-col gap-3 overflow-hidden">
                        <div class="flex justify-between items-center">
                            <div class="flex items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                    <g clip-path="url(#clip0_6568_23593)">
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M12.7779 6.34265C11.4254 5.43898 10 4.18139 10 2.5548V0.5C11.9778 0.5 13.9112 1.08649 15.5557 2.1853C17.2002 3.28411 18.4819 4.84591 19.2388 6.67315C19.9956 8.5004 20.1937 10.5111 19.8078 12.4509C19.422 14.3907 18.4696 16.1726 17.0711 17.5711C15.6726 18.9696 13.8907 19.922 11.9509 20.3078C10.0111 20.6937 8.0004 20.4956 6.17315 19.7388C4.34591 18.9819 2.78411 17.7002 1.6853 16.0557C0.58649 14.4112 0 12.4778 0 10.5H2.0548C3.68139 10.5 4.93898 11.9254 5.84265 13.2779C6.39205 14.1001 7.17295 14.7409 8.0866 15.1194C9.0002 15.4979 10.0055 15.5969 10.9754 15.4039C11.9453 15.211 12.8363 14.7348 13.5356 14.0356C14.2348 13.3363 14.711 12.4453 14.9039 11.4754C15.0969 10.5055 14.9979 9.5002 14.6194 8.5866C14.2409 7.67295 13.6001 6.89205 12.7779 6.34265Z"
                                            class="fill-surface-900 dark:fill-surface-0"
                                        />
                                        <path
                                            fill-rule="evenodd"
                                            clip-rule="evenodd"
                                            d="M5.625 0.500002C5.27982 0.500002 5.00402 0.780896 4.96099 1.12338C4.90539 1.5658 4.79075 1.99974 4.6194 2.41342C4.36812 3.02005 3.99983 3.57124 3.53553 4.03554C3.07124 4.49983 2.52005 4.86813 1.91342 5.1194C1.49973 5.29075 1.0658 5.4054 0.623379 5.46099C0.280894 5.50403 2.06324e-07 5.77982 1.91236e-07 6.125L0 10.5C1.31322 10.5 2.61358 10.2414 3.82684 9.7388C5.0401 9.23625 6.1425 8.49965 7.07105 7.57105C7.99965 6.6425 8.73625 5.5401 9.2388 4.32684C9.74135 3.11358 10 1.81322 10 0.5L5.625 0.500002Z"
                                            class="fill-surface-900 dark:fill-surface-0"
                                        />
                                    </g>
                                    <defs>
                                        <clipPath id="clip0_6568_23593">
                                            <rect width="20" height="20" fill="white" transform="translate(0 0.5)" />
                                        </clipPath>
                                    </defs>
                                </svg>
                                <div class="text-surface-950 dark:text-surface-0 text-base font-semibold">BriteMank</div>
                            </div>
                            <p-button label="Change" [link]="true" styleClass="px-3 py-2 rounded-full" icon="pi pi-chevron-right" iconPos="right" />
                        </div>

                        <div class="text-surface-500 dark:text-surface-400 text-base">Estimated delivery of your selected products varies between Saturday, January 18 and Thursday, January 23.</div>
                    </div>
                </div>
            </div>

            <div class="p-4 sm:p-6 border-t border-surface-200 dark:border-surface-700 flex flex-col gap-6">
                <div class="text-surface-950 dark:text-surface-0 text-lg sm:text-xl font-medium leading-7">Recommended For You</div>

                <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-4 sm:gap-6">
                    @for (product of recommendedProducts; track product.id) {
                        <div class="h-96 sm:h-120 p-4 rounded-3xl flex flex-col justify-end items-start gap-2 overflow-hidden relative group cursor-pointer">
                            <div class="absolute inset-0 rounded-3xl overflow-hidden">
                                <img [src]="product.image" class="w-full h-full object-cover" [alt]="product.name" />
                                <div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                            </div>

                            <div class="relative z-10 w-full p-4 bg-surface-0 dark:bg-surface-900 rounded-2xl shadow-xl flex flex-col justify-start items-start gap-2 overflow-hidden">
                                <div class="w-full flex flex-col gap-2">
                                    <div class="w-full flex flex-col sm:flex-row justify-between items-start sm:items-center gap-2">
                                        <div class="flex-1 text-surface-500 dark:text-surface-400 text-base sm:text-lg font-medium leading-6 sm:leading-7">{{ product.name }}</div>
                                        <div class="flex justify-start items-center gap-2 ml-auto">
                                            <div class="p-2 rounded-lg border border-surface-200 dark:border-surface-700 flex justify-center items-center cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                                                <i class="pi pi-heart text-surface-500 dark:text-surface-400 text-sm sm:text-base"></i>
                                            </div>
                                            <div class="p-2 rounded-lg border border-surface-200 dark:border-surface-700 flex justify-center items-center cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                                                <i class="pi pi-shopping-cart text-surface-500 dark:text-surface-400 text-sm sm:text-base"></i>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="w-full flex justify-between items-center">
                                        <div class="text-surface-950 dark:text-surface-0 text-xl sm:text-2xl font-medium leading-8 sm:leading-loose">{{ product.price }}</div>
                                        <div class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-md flex justify-start items-center gap-1">
                                            <i class="pi pi-star-fill text-yellow-600 dark:text-yellow-400 text-xs"></i>
                                            <div class="text-yellow-600 dark:text-yellow-400 text-sm font-semibold leading-tight">{{ product.rating }}</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }
                </div>
            </div>
        </div>
    `
})
export class ShoppingCart {
    cartItems = signal<CartItem[]>([
        {
            id: 1,
            name: 'AeroShield™ Storm Jacket',
            description: 'Storm-FIT Windproof & Water-Resistant Jacket',
            originalPrice: 330.99,
            currentPrice: 279.99,
            earnings: 51.0,
            quantity: 1,
            deliveryDate: 'Saturday, January 18th',
            image: '/demo/images/ecommerce/shopping-cart/ecommerce-shoppingcart-1.jpg'
        },
        {
            id: 2,
            name: 'StormEdge™ Midnight Coat',
            description: 'Storm-FIT Windproof Coat Jacket',
            originalPrice: 320.49,
            currentPrice: 289.99,
            earnings: 30.5,
            quantity: 1,
            deliveryDate: 'Saturday, January 18th',
            image: '/demo/images/ecommerce/shopping-cart/ecommerce-shoppingcart-2.jpg'
        },
        {
            id: 3,
            name: 'AeroFlex™ All-Weather Jacket',
            description: 'Storm-FIT Linen Jacket',
            originalPrice: 349.99,
            currentPrice: 319.99,
            earnings: 30.0,
            quantity: 1,
            deliveryDate: 'Saturday, January 18th',
            image: '/demo/images/ecommerce/shopping-cart/ecommerce-shoppingcart-3.jpg'
        }
    ]);

    recommendedProducts: RecommendedProduct[] = [
        {
            id: 1,
            name: 'SkyLum™ Urban Trench Coat',
            price: '$249.99',
            rating: 4.7,
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-1.jpg'
        },
        {
            id: 5,
            name: 'BreGD™ Lightweight Jacket',
            price: '$199.99',
            rating: 4.5,
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-5.jpg'
        },
        {
            id: 6,
            name: 'FlowMotion™ Cape Jacket',
            price: '$349.99',
            rating: 4.7,
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-6.jpg'
        }
    ];

    promoCode = '';

    subtotal = computed(() => {
        return this.cartItems().reduce((sum, item) => sum + item.currentPrice * item.quantity, 0);
    });

    totalEarnings = computed(() => {
        return this.cartItems().reduce((sum, item) => sum + item.earnings * item.quantity, 0);
    });

    vat = computed(() => 20.0);

    total = computed(() => {
        return this.subtotal() + this.vat();
    });

    updateQuantity(itemId: number, newQuantity: number) {
        const items = this.cartItems();
        const item = items.find((i) => i.id === itemId);
        if (item && newQuantity > 0) {
            item.quantity = newQuantity;
            this.cartItems.set([...items]);
        }
    }

    removeItem(itemId: number) {
        const items = this.cartItems();
        const index = items.findIndex((i) => i.id === itemId);
        if (index > -1) {
            items.splice(index, 1);
            this.cartItems.set([...items]);
        }
    }

    applyPromoCode() {}

    checkout() {}
}
