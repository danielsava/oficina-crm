import { CommonModule } from '@angular/common';
import { Component, ViewChildren, QueryList, signal, computed, model } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { MenuModule, Menu } from 'primeng/menu';
import { TabsModule } from 'primeng/tabs';
import { TagModule } from 'primeng/tag';

interface QAItem {
    question: string;
    questionDate: string;
    answer: string;
    answerDate: string;
}

interface Review {
    name: string;
    email: string;
    date: string;
    rating: number;
    comment: string;
    avatar: string;
}

interface Recommendation {
    id: number;
    image: string;
    active: boolean;
}

interface Size {
    label: string;
    disabled: boolean;
}

@Component({
    selector: 'app-product-overview',
    imports: [CommonModule, FormsModule, ButtonModule, TabsModule, TagModule, MenuModule],
    template: `
        <div class="md:p-6 card">
            <div class="flex flex-col xl:flex-row justify-start items-start gap-6">
                <div class="w-full xl:flex-1 grid grid-cols-1 sm:grid-cols-2 gap-6">
                    @for (image of images; track $index) {
                        <img class="w-full aspect-square object-cover rounded-3xl border border-surface-200 dark:border-surface-700" [src]="image" [alt]="'Product image ' + ($index + 1)" />
                    }
                </div>

                <div class="w-full xl:w-96 shrink-0 flex flex-col justify-start items-start gap-6">
                    <div class="w-full bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-3xl overflow-hidden">
                        <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex flex-col justify-start items-start gap-4">
                            <p-tag value="High Score" severity="warn" styleClass="bg-orange-100 text-orange-800 dark:bg-orange-900 dark:text-orange-200" />

                            <div class="w-full flex flex-col justify-start items-start">
                                <h1 class="text-surface-950 dark:text-surface-0 text-xl font-medium leading-7 mb-1">AeroShield™ Storm Jacket</h1>
                                <p class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Storm-FIT Windproof & Water-Resistant Jacket</p>
                            </div>

                            <div class="text-primary-600 dark:text-primary-400 text-2xl font-medium leading-loose">$279.99</div>
                            <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">More than 7,000 views in the last 30 days</div>
                        </div>

                        <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex flex-col justify-start items-start gap-4">
                            <div class="text-surface-900 dark:text-surface-0 text-base font-medium leading-normal">Recommendations</div>
                            <div class="w-full flex justify-start items-center gap-3">
                                @for (rec of recommendations; track rec.id; let i = $index) {
                                    <div
                                        class="flex-1 h-20 rounded-xl transition-all cursor-pointer"
                                        [ngClass]="{
                                            'ring-2 ring-primary-500 dark:ring-primary-400 ring-offset-2 ring-offset-surface-0 dark:ring-offset-surface-900': rec.active,
                                            'ring-1 ring-surface-200 dark:ring-surface-700': !rec.active
                                        }"
                                        (click)="setRecommendation(i)"
                                    >
                                        <img class="w-full h-full object-cover rounded-xl" [src]="rec.image" [alt]="'Recommendation ' + rec.id" />
                                    </div>
                                }
                            </div>
                        </div>

                        <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex flex-col justify-start items-start gap-4">
                            <div class="text-surface-900 dark:text-surface-0 text-base font-medium leading-normal">Select Number/Size</div>
                            <div class="w-full flex justify-start items-center gap-2">
                                @for (size of sizes; track size.label) {
                                    <div
                                        class="flex-1 h-8 p-1 rounded-xl transition-colors border flex items-center justify-center"
                                        [ngClass]="{
                                            'border-primary-500 dark:border-primary-400': selectedSize() === size.label && !size.disabled,
                                            'border-surface-200 dark:border-surface-700': selectedSize() !== size.label || size.disabled,
                                            'cursor-pointer': !size.disabled,
                                            'cursor-default': size.disabled
                                        }"
                                        (click)="setSize(size.label)"
                                    >
                                        <div
                                            class="relative w-full h-full flex justify-center items-center rounded-lg"
                                            [ngClass]="{
                                                'bg-primary-600 text-white': selectedSize() === size.label && !size.disabled,
                                                'bg-surface-200 dark:bg-surface-700': selectedSize() !== size.label || size.disabled
                                            }"
                                        >
                                            <span
                                                class="text-sm leading-px! font-medium"
                                                [ngClass]="{
                                                    'text-white': selectedSize() === size.label && !size.disabled,
                                                    'text-surface-500 dark:text-surface-400': size.disabled,
                                                    'text-surface-950 dark:text-surface-0': !size.disabled && selectedSize() !== size.label
                                                }"
                                            >
                                                {{ size.label }}
                                            </span>
                                            @if (size.disabled) {
                                                <div class="absolute inset-0 flex items-center justify-center">
                                                    <div class="w-6 h-0.5 bg-surface-500 dark:bg-surface-400"></div>
                                                </div>
                                            }
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>

                        <div class="p-6 flex justify-start items-center gap-2">
                            <p-button label="Add to cart" class="flex-1" styleClass="w-full self-stretch" />
                            <p-button icon="pi pi-heart" [outlined]="true" severity="secondary" styleClass="self-stretch" />
                            <p-button icon="pi pi-share-alt" [outlined]="true" severity="secondary" styleClass="self-stretch" />
                        </div>
                    </div>

                    <div class="w-full bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-3xl overflow-hidden">
                        <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex flex-col justify-start items-start gap-4">
                            <div class="w-full flex justify-start items-center gap-3">
                                <div class="flex-1 text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Delivery Options</div>
                                <div class="flex justify-center items-center gap-2">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="20" height="21" viewBox="0 0 20 21" fill="none">
                                        <g clip-path="url(#clip0_6568_19875)">
                                            <path
                                                fill-rule="evenodd"
                                                clip-rule="evenodd"
                                                d="M12.7779 5.97253C11.4254 5.06886 10 3.81127 10 2.18468V0.129883C11.9778 0.129883 13.9112 0.716373 15.5557 1.81519C17.2002 2.914 18.4819 4.47579 19.2388 6.30303C19.9956 8.13028 20.1937 10.141 19.8078 12.0808C19.422 14.0206 18.4696 15.8024 17.0711 17.2009C15.6726 18.5995 13.8907 19.5519 11.9509 19.9377C10.0111 20.3236 8.0004 20.1255 6.17315 19.3687C4.34591 18.6118 2.78411 17.3301 1.6853 15.6856C0.58649 14.0411 0 12.1077 0 10.1299H2.0548C3.68139 10.1299 4.93898 11.5553 5.84265 12.9077C6.39205 13.73 7.17295 14.3708 8.0866 14.7493C9.0002 15.1277 10.0055 15.2267 10.9754 15.0338C11.9453 14.8409 12.8363 14.3647 13.5356 13.6654C14.2348 12.9661 14.711 12.0752 14.9039 11.1053C15.0969 10.1354 14.9979 9.13008 14.6194 8.21648C14.2409 7.30283 13.6001 6.52193 12.7779 5.97253Z"
                                                class="fill-surface-800 dark:fill-surface-0"
                                            />
                                            <path
                                                fill-rule="evenodd"
                                                clip-rule="evenodd"
                                                d="M5.625 0.129885C5.27982 0.129885 5.00402 0.410779 4.96099 0.753263C4.90539 1.19568 4.79075 1.62962 4.6194 2.0433C4.36812 2.64993 3.99983 3.20112 3.53553 3.66542C3.07124 4.12971 2.52005 4.49801 1.91342 4.74928C1.49973 4.92064 1.0658 5.03528 0.623379 5.09087C0.280894 5.13391 2.06324e-07 5.40971 1.91236e-07 5.75488L0 10.1299C1.31322 10.1299 2.61358 9.87123 3.82684 9.36868C5.0401 8.86613 6.1425 8.12953 7.07105 7.20093C7.99965 6.27238 8.73625 5.16998 9.2388 3.95672C9.74135 2.74346 10 1.4431 10 0.129883L5.625 0.129885Z"
                                                class="fill-surface-800 dark:fill-surface-0"
                                            />
                                        </g>
                                        <defs>
                                            <clipPath id="clip0_6568_19875">
                                                <rect width="20" height="20" fill="white" transform="translate(0 0.129883)" />
                                            </clipPath>
                                        </defs>
                                    </svg>
                                    <div class="text-surface-500 dark:text-surface-400 text-base font-semibold leading-none tracking-tight">BriteMank</div>
                                </div>
                            </div>
                            <div class="flex justify-start items-center gap-2">
                                <i class="pi pi-calendar text-surface-500 dark:text-surface-400"></i>
                                <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Estimated Saturday, January 18th</div>
                            </div>
                        </div>
                        <div class="px-6 py-4">
                            <p-button label="Track the cargo" severity="secondary" [outlined]="true" styleClass="w-full rounded-full" />
                        </div>
                    </div>

                    <div class="w-full p-6 bg-surface-50 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-3xl">
                        <div class="flex justify-between items-center mb-4">
                            <div class="flex justify-center items-center gap-2">
                                <svg xmlns="http://www.w3.org/2000/svg" width="24" height="25" viewBox="0 0 24 25" fill="none">
                                    <path
                                        fill-rule="evenodd"
                                        clip-rule="evenodd"
                                        d="M12 24.1299C18.6274 24.1299 24 18.7573 24 12.1299C24 5.50247 18.6274 0.129883 12 0.129883C5.37258 0.129883 0 5.50247 0 12.1299C0 18.7573 5.37258 24.1299 12 24.1299ZM15.7436 5.71999C15.9258 5.07272 15.2977 4.68996 14.724 5.09867L6.71588 10.8036C6.09374 11.2469 6.1916 12.1299 6.86288 12.1299H8.97164V12.1136H13.0815L9.73274 13.2951L8.25644 18.5398C8.07422 19.1871 8.7023 19.5698 9.27602 19.1611L17.2842 13.4562C17.9063 13.013 17.8084 12.1299 17.1372 12.1299H13.9393L15.7436 5.71999Z"
                                        class="fill-surface-800 dark:fill-surface-0"
                                    />
                                </svg>
                                <div class="text-surface-950 dark:text-surface-0 text-base font-semibold leading-7 tracking-tight">ZenTrailMs</div>
                            </div>
                            <p-button label="Explore" [link]="true" styleClass="p-2 text-primary-600 dark:text-primary-400" iconPos="right" icon="pi pi-arrow-right" />
                        </div>
                        <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Buy Now with your Ready to Spend Limit, 6 after 60 Days Pay in installments</div>
                    </div>
                </div>
            </div>

            <div class="w-full p-6 bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-3xl grid grid-cols-1 md:grid-cols-2 xl:grid-cols-4 gap-4 mt-6">
                <div class="flex justify-center items-center gap-2">
                    <i class="pi pi-truck text-surface-500 dark:text-surface-400 text-xl"></i>
                    <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Free shipping on all orders</div>
                </div>
                <div class="flex justify-center items-center gap-2">
                    <i class="pi pi-shield text-surface-500 dark:text-surface-400 text-xl"></i>
                    <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Safe Shopping</div>
                </div>
                <div class="flex justify-center items-center gap-2">
                    <i class="pi pi-refresh text-surface-500 dark:text-surface-400 text-xl"></i>
                    <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Free returns up to 60 days</div>
                </div>
                <div class="flex justify-center items-center gap-2">
                    <i class="pi pi-star-fill text-surface-500 dark:text-surface-400 text-xl"></i>
                    <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">High Quality</div>
                </div>
            </div>

            <div class="w-full bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-3xl overflow-hidden mt-6">
                <p-tabs [(value)]="activeTab">
                    <p-tablist class="border-b border-surface-200 dark:border-surface-700">
                        <p-tab value="description" class="flex-1 p-4 text-center">
                            <span
                                class="text-base font-medium"
                                [ngClass]="{
                                    'text-primary-600 dark:text-primary-400': activeTab() === 'description',
                                    'text-surface-500 dark:text-surface-400': activeTab() !== 'description'
                                }"
                            >
                                Product Description
                            </span>
                        </p-tab>
                        <p-tab value="evaluations" class="flex-1 p-4 text-center">
                            <span
                                class="text-base font-normal"
                                [ngClass]="{
                                    'text-primary-600 dark:text-primary-400': activeTab() === 'evaluations',
                                    'text-surface-500 dark:text-surface-400': activeTab() !== 'evaluations'
                                }"
                            >
                                Evaluations
                            </span>
                        </p-tab>
                        <p-tab value="qa" class="flex-1 p-4 text-center">
                            <span
                                class="text-base font-normal"
                                [ngClass]="{
                                    'text-primary-600 dark:text-primary-400': activeTab() === 'qa',
                                    'text-surface-500 dark:text-surface-400': activeTab() !== 'qa'
                                }"
                            >
                                Question and Answer
                            </span>
                        </p-tab>
                    </p-tablist>

                    <p-tabpanels>
                        <p-tabpanel value="description" class="p-6">
                            <div class="flex flex-col justify-start items-start gap-8">
                                <div class="w-full flex justify-start items-center gap-4">
                                    <div class="w-18 h-18 rounded-3xl">
                                        <img class="w-full h-full object-cover rounded-2xl shadow-sm" src="/demo/images/ecommerce/productoverview/ecommerce-productoverview-5.jpg" alt="Product thumbnail" />
                                    </div>
                                    <div class="flex-1 flex flex-col justify-start items-start gap-1">
                                        <h3 class="text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">AeroShield™ Storm Jacket</h3>
                                        <p class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Storm-FIT Windproof & Water-Resistant Jacket</p>
                                    </div>
                                </div>

                                <div class="w-full flex flex-col justify-start items-start gap-4">
                                    <h2 class="text-surface-950 dark:text-surface-0 text-2xl font-medium leading-loose">AeroShield™ Storm Jacket</h2>
                                    <p class="text-surface-500 dark:text-surface-400 text-lg font-normal leading-7">
                                        Premium Performance for Every Adventure<br /><br />
                                        The AeroShield™ Storm Jacket is engineered with high-performance materials to keep you warm, dry, and comfortable in extreme weather conditions. Designed for outdoor enthusiasts and city commuters alike.
                                    </p>
                                </div>

                                <div class="w-full flex flex-col justify-start items-start gap-4">
                                    <h3 class="text-surface-950 dark:text-surface-0 text-2xl font-medium leading-loose">Key Features:</h3>
                                    <div class="flex flex-col gap-3">
                                        <p class="text-surface-500 dark:text-surface-400 text-lg font-normal leading-7"><strong>StormGuard™ Fabric</strong> – Advanced water-resistant coating to repel rain and snow.</p>
                                        <p class="text-surface-500 dark:text-surface-400 text-lg font-normal leading-7"><strong>FeatherLight Insulation</strong> – Provides warmth without bulk, ensuring all-day comfort.</p>
                                        <p class="text-surface-500 dark:text-surface-400 text-lg font-normal leading-7"><strong>Adjustable Fit & Hood</strong> – Customize your fit with an elastic drawcord and detachable hood.</p>
                                        <p class="text-surface-500 dark:text-surface-400 text-lg font-normal leading-7"><strong>Breathable & Moisture-Wicking Lining</strong> – Regulates body temperature and prevents overheating.</p>
                                        <p class="text-surface-500 dark:text-surface-400 text-lg font-normal leading-7"><strong>Ergonomic Slim-Fit Design</strong> – Tailored for a modern and stylish look without compromising flexibility.</p>
                                        <p class="text-surface-500 dark:text-surface-400 text-lg font-normal leading-7"><strong>Zippered Security Pockets</strong> – Keep your essentials safe and dry, even in harsh weather.</p>
                                    </div>
                                </div>

                                <div class="w-full flex flex-col justify-start items-start gap-4">
                                    <h3 class="text-surface-950 dark:text-surface-0 text-2xl font-medium leading-loose">Designed for Versatility</h3>
                                    <div class="flex flex-col gap-3">
                                        <p class="text-surface-500 dark:text-surface-400 text-lg font-normal leading-7">Perfect for hiking, traveling, and daily wear</p>
                                        <p class="text-surface-500 dark:text-surface-400 text-lg font-normal leading-7">Durable, lightweight, and packable for easy storage</p>
                                        <p class="text-surface-500 dark:text-surface-400 text-lg font-normal leading-7">Available in multiple colors and sizes</p>
                                    </div>
                                </div>
                            </div>
                        </p-tabpanel>

                        <p-tabpanel value="evaluations" class="p-0">
                            <div class="w-full flex flex-col">
                                <div class="w-full flex flex-col xl:flex-row">
                                    <div class="w-full xl:w-80 flex flex-col border-b border-surface-200 dark:border-surface-700">
                                        <div class="relative h-80">
                                            <div class="absolute left-5 top-4 text-surface-900 dark:text-surface-0 text-base font-medium leading-normal">Average Rating</div>

                                            <div class="absolute left-1/2 top-16 transform -translate-x-1/2 w-52 h-52">
                                                <svg class="w-52 h-52 transform -rotate-90" viewBox="0 0 100 100">
                                                    <circle cx="50" cy="50" r="35" stroke="rgb(229, 231, 235)" stroke-width="10" fill="none" class="dark:stroke-surface-700" />
                                                    <circle cx="50" cy="50" r="35" stroke="rgb(234, 179, 8)" stroke-width="10" fill="none" stroke-dasharray="183.2 36.8" stroke-dashoffset="0" stroke-linecap="round" />
                                                </svg>

                                                <div class="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 flex flex-col items-center gap-2">
                                                    <i class="pi pi-star-fill text-yellow-500 text-xl"></i>
                                                    <div class="text-center text-surface-900 dark:text-surface-0 text-2xl font-medium leading-loose">4.5 / 5</div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="border-t border-surface-200 dark:border-surface-700 flex min-h-[36px]">
                                            <div class="flex-1 p-2 flex justify-center items-center gap-2">
                                                <div class="w-3 h-3 bg-yellow-500 rounded-sm border border-surface-0 dark:border-surface-800"></div>
                                                <div class="text-center text-surface-900 dark:text-surface-0 text-base font-medium leading-normal">Positive (83%)</div>
                                            </div>
                                            <div class="w-px bg-surface-200 dark:bg-surface-700"></div>
                                            <div class="flex-1 p-2 flex justify-center items-center gap-2">
                                                <div class="w-3 h-3 bg-surface-200 dark:bg-surface-700 rounded-sm border border-surface-0 dark:border-surface-800"></div>
                                                <div class="text-center text-surface-900 dark:text-surface-0 text-base font-medium leading-normal">Negative (17%)</div>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="flex-1 flex flex-col border-b border-surface-200 dark:border-surface-700 xl:border-l">
                                        <div class="p-6 flex-1 flex flex-col">
                                            <div class="flex flex-col gap-4 mb-4">
                                                <div class="text-surface-950 dark:text-surface-0 text-base font-medium leading-normal">Our customer satisfaction</div>
                                                <div class="w-full h-px bg-surface-200 dark:bg-surface-700"></div>
                                            </div>

                                            <div class="flex-1 flex flex-col justify-between gap-4">
                                                <div class="flex items-center gap-2">
                                                    <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                                                    <span class="w-3 text-center text-surface-500 dark:text-surface-400 text-sm font-normal leading-tight">5</span>
                                                    <div class="flex-1 h-1 bg-surface-200 dark:bg-surface-700 rounded-full relative">
                                                        <div class="w-4/5 h-full bg-yellow-500 rounded-full"></div>
                                                    </div>
                                                </div>

                                                <div class="flex items-center gap-2">
                                                    <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                                                    <span class="w-3 text-center text-surface-500 dark:text-surface-400 text-sm font-normal leading-tight">4</span>
                                                    <div class="flex-1 h-1 bg-surface-200 dark:bg-surface-700 rounded-full relative">
                                                        <div class="w-3/5 h-full bg-yellow-500 rounded-full"></div>
                                                    </div>
                                                </div>

                                                <div class="flex items-center gap-2">
                                                    <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                                                    <span class="w-3 text-center text-surface-500 dark:text-surface-400 text-sm font-normal leading-tight">3</span>
                                                    <div class="flex-1 h-1 bg-surface-200 dark:bg-surface-700 rounded-full relative">
                                                        <div class="w-2/5 h-full bg-yellow-500 rounded-full"></div>
                                                    </div>
                                                </div>

                                                <div class="flex items-center gap-2">
                                                    <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                                                    <span class="w-3 text-center text-surface-500 dark:text-surface-400 text-sm font-normal leading-tight">2</span>
                                                    <div class="flex-1 h-1 bg-surface-200 dark:bg-surface-700 rounded-full relative">
                                                        <div class="w-1/5 h-full bg-yellow-500 rounded-full"></div>
                                                    </div>
                                                </div>

                                                <div class="flex items-center gap-2">
                                                    <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                                                    <span class="w-3 text-center text-surface-500 dark:text-surface-400 text-sm font-normal leading-tight">1</span>
                                                    <div class="flex-1 h-1 bg-surface-200 dark:bg-surface-700 rounded-full relative">
                                                        <div class="w-1/12 h-full bg-yellow-500 rounded-full"></div>
                                                    </div>
                                                </div>
                                            </div>
                                        </div>

                                        <div class="border-t border-surface-200 dark:border-surface-700 flex items-stretch min-h-[36px]">
                                            <div
                                                class="flex-1 flex justify-center items-center gap-2 p-2 cursor-pointer transition-colors"
                                                (click)="selectRating(5)"
                                                [ngClass]="{
                                                    'bg-surface-100 dark:bg-surface-700': selectedRating() === 5,
                                                    'hover:bg-surface-50 dark:hover:bg-surface-800': selectedRating() !== 5
                                                }"
                                            >
                                                <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                                                <span class="hidden sm:inline text-surface-950 dark:text-surface-0 text-base font-medium">5 (823)</span>
                                                <span class="sm:hidden text-surface-950 dark:text-surface-0 text-base font-medium">5</span>
                                            </div>
                                            <div class="w-px bg-surface-200 dark:bg-surface-700"></div>

                                            <div
                                                class="flex-1 flex justify-center items-center gap-2 p-2 cursor-pointer transition-colors"
                                                (click)="selectRating(4)"
                                                [ngClass]="{
                                                    'bg-surface-100 dark:bg-surface-700': selectedRating() === 4,
                                                    'hover:bg-surface-50 dark:hover:bg-surface-800': selectedRating() !== 4
                                                }"
                                            >
                                                <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                                                <span class="hidden sm:inline text-surface-950 dark:text-surface-0 text-base font-medium">4 (453)</span>
                                                <span class="sm:hidden text-surface-950 dark:text-surface-0 text-base font-medium">4</span>
                                            </div>
                                            <div class="w-px bg-surface-200 dark:bg-surface-700"></div>

                                            <div
                                                class="flex-1 flex justify-center items-center gap-2 p-2 cursor-pointer transition-colors"
                                                (click)="selectRating(3)"
                                                [ngClass]="{
                                                    'bg-surface-100 dark:bg-surface-700': selectedRating() === 3,
                                                    'hover:bg-surface-50 dark:hover:bg-surface-800': selectedRating() !== 3
                                                }"
                                            >
                                                <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                                                <span class="hidden sm:inline text-surface-950 dark:text-surface-0 text-base font-medium">3 (256)</span>
                                                <span class="sm:hidden text-surface-950 dark:text-surface-0 text-base font-medium">3</span>
                                            </div>
                                            <div class="w-px bg-surface-200 dark:bg-surface-700"></div>

                                            <div
                                                class="flex-1 flex justify-center items-center gap-2 p-2 cursor-pointer transition-colors"
                                                (click)="selectRating(2)"
                                                [ngClass]="{
                                                    'bg-surface-100 dark:bg-surface-700': selectedRating() === 2,
                                                    'hover:bg-surface-50 dark:hover:bg-surface-800': selectedRating() !== 2
                                                }"
                                            >
                                                <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                                                <span class="hidden sm:inline text-surface-950 dark:text-surface-0 text-base font-medium">2 (100)</span>
                                                <span class="sm:hidden text-surface-950 dark:text-surface-0 text-base font-medium">2</span>
                                            </div>
                                            <div class="w-px bg-surface-200 dark:bg-surface-700"></div>

                                            <div
                                                class="flex-1 flex justify-center items-center gap-2 p-2 cursor-pointer transition-colors"
                                                (click)="selectRating(1)"
                                                [ngClass]="{
                                                    'bg-surface-100 dark:bg-surface-700': selectedRating() === 1,
                                                    'hover:bg-surface-50 dark:hover:bg-surface-800': selectedRating() !== 1
                                                }"
                                            >
                                                <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                                                <span class="hidden sm:inline text-surface-950 dark:text-surface-0 text-base font-medium">1 (21)</span>
                                                <span class="sm:hidden text-surface-950 dark:text-surface-0 text-base font-medium">1</span>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <div class="w-full">
                                    @if (selectedRating() !== 'all') {
                                        <div class="px-6 pt-4 pb-2">
                                            <p-button label="Show All Reviews" [text]="true" (onClick)="selectRating('all')" styleClass="text-primary-600 dark:text-primary-400 hover:bg-surface-100 dark:hover:bg-surface-800" />
                                        </div>
                                    }

                                    @for (review of filteredReviews(); track $index; let last = $last) {
                                        <div class="px-6 pt-6 pb-8" [ngClass]="{ 'border-b border-surface-200 dark:border-surface-700': !last }">
                                            <div class="flex gap-3">
                                                <img class="w-8 h-8 mt-1 rounded-full shrink-0" [src]="'https://placehold.co/32x32/64748b/ffffff?text=' + review.avatar" [alt]="review.name" />
                                                <div class="flex-1 min-w-0">
                                                    <div class="flex items-center gap-2 mb-3">
                                                        <div class="flex-1 flex flex-col md:flex-row md:items-center gap-2 min-w-0">
                                                            <div class="flex items-center gap-2 flex-wrap">
                                                                <div class="text-surface-900 dark:text-surface-0 text-base font-medium leading-normal">{{ review.name }}</div>
                                                                <div class="text-surface-500 dark:text-surface-400 text-sm md:text-base font-normal leading-normal">({{ review.email }})</div>
                                                            </div>
                                                            <div class="flex items-center gap-2 md:gap-3 md:ml-auto shrink-0">
                                                                <div class="flex items-center gap-2">
                                                                    <div class="text-surface-500 dark:text-surface-400 text-sm md:text-base font-normal leading-normal whitespace-nowrap">{{ getDatePart(review.date) }}</div>
                                                                    <div class="hidden sm:block w-px h-2 bg-surface-200 dark:bg-surface-700"></div>
                                                                    <div class="text-surface-500 dark:text-surface-400 text-sm md:text-base font-normal leading-normal whitespace-nowrap">{{ getTimePart(review.date) }}</div>
                                                                </div>
                                                                <div class="hidden md:block w-px h-2 bg-surface-200 dark:bg-surface-700"></div>
                                                                <div class="flex items-center gap-2">
                                                                    <span class="text-surface-950 dark:text-surface-0 text-sm font-medium leading-tight">({{ review.rating }})</span>
                                                                    <i class="pi pi-star-fill text-yellow-500 text-sm"></i>
                                                                </div>
                                                            </div>
                                                        </div>
                                                        <div class="relative shrink-0">
                                                            <p-button icon="pi pi-ellipsis-v" [text]="true" size="small" severity="secondary" (onClick)="toggleReviewMenu($event, $index)" styleClass="p-2! h-auto!" />
                                                            <p-menu #reviewMenu [model]="reviewMenuItems" [popup]="true" styleClass="w-48!" appendTo="body" />
                                                        </div>
                                                    </div>
                                                    <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">"{{ review.comment }}"</div>
                                                </div>
                                            </div>
                                        </div>
                                    }

                                    @if (filteredReviews().length === 0) {
                                        <div class="px-6 py-12 text-center">
                                            <div class="text-surface-500 dark:text-surface-400 text-base font-normal">No reviews found for {{ selectedRating() }} star rating.</div>
                                        </div>
                                    }
                                </div>
                            </div>
                        </p-tabpanel>

                        <p-tabpanel value="qa" class="p-6">
                            <div class="flex flex-col gap-7">
                                @for (qa of qaItems; track $index) {
                                    <div class="flex flex-col gap-2">
                                        <div class="h-5 px-4 flex justify-between items-center gap-2">
                                            <div class="flex-1 text-surface-900 dark:text-surface-0 text-base font-medium leading-normal">Question</div>
                                            <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">{{ qa.questionDate }}</div>
                                        </div>
                                        <div class="p-4 bg-surface-50 dark:bg-surface-900 rounded-2xl border border-surface-100 dark:border-surface-700">
                                            <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">{{ qa.question }}</div>
                                        </div>
                                    </div>

                                    <div class="pl-16 flex flex-col gap-2">
                                        <div class="h-5 px-4 flex justify-between items-center gap-2">
                                            <div class="flex-1 text-surface-900 dark:text-surface-0 text-base font-medium leading-normal">Answer</div>
                                            <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">{{ qa.answerDate }}</div>
                                        </div>
                                        <div class="p-4 bg-surface-0 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700">
                                            <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">{{ qa.answer }}</div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </p-tabpanel>
                    </p-tabpanels>
                </p-tabs>
            </div>
        </div>
    `
})
export class ProductOverview {
    @ViewChildren('reviewMenu') reviewMenus!: QueryList<Menu>;

    selectedSize = signal('S');

    selectedRecommendation = signal(0);

    activeTab = model<string>('description');

    selectedRating = signal<number | 'all'>('all');

    filteredReviews = computed(() => {
        const rating = this.selectedRating();
        if (rating === 'all') {
            return Object.values(this.reviews).flat();
        }
        return this.reviews[rating] || [];
    });

    qaItems: QAItem[] = [
        {
            question: 'Is this jacket suitable for heavy rain?',
            questionDate: 'January 12, 2025 | 18:40',
            answer: 'Yes, the AeroShield™ Storm Jacket features StormGuard™ Fabric, which is water-resistant and repels rain effectively. However, for extreme downpours, we recommend using an additional waterproof layer.',
            answerDate: 'January 12, 2025 | 18:45'
        },
        {
            question: 'Does the jacket run true to size?',
            questionDate: 'January 20, 2025 | 02:35',
            answer: 'Yes, the jacket is designed with a standard slim-fit cut. If you prefer a looser fit, we recommend sizing up. Please refer to our size guide for exact measurements.',
            answerDate: 'January 20, 2025 | 02:40'
        }
    ];

    reviews: { [key: number]: Review[] } = {
        5: [
            {
                name: 'Liam Carter',
                email: 'liam.carter92@email.com',
                date: 'January 18, 2025 | 16:45',
                rating: 5,
                comment: 'Absolutely fantastic jacket! The material feels premium, and it keeps me warm even in freezing temperatures. The fit is perfect, and I love the secure zippered pockets. Would definitely recommend!',
                avatar: 'LC'
            },
            {
                name: 'Emma Wilson',
                email: 'emma.wilson@email.com',
                date: 'January 16, 2025 | 14:20',
                rating: 5,
                comment: 'Outstanding quality! This jacket exceeded my expectations. Perfect for outdoor activities and looks great too. The waterproof feature really works!',
                avatar: 'EW'
            }
        ],
        4: [
            {
                name: 'Sophie Bennett',
                email: 'sophie.bennett@email.com',
                date: 'January 15, 2025 | 12:30',
                rating: 4,
                comment: "Great quality and stylish design. The jacket is very comfortable, but I wish the hood was slightly larger. Other than that, it's a solid purchase for winter wear.",
                avatar: 'SB'
            },
            {
                name: 'Michael Davis',
                email: 'michael.davis@email.com',
                date: 'January 12, 2025 | 10:15',
                rating: 4,
                comment: "Very good jacket overall. Keeps me warm and dry. Only complaint is that it's a bit bulky, but the quality makes up for it.",
                avatar: 'MD'
            }
        ],
        3: [
            {
                name: 'James Holland',
                email: 'jamesholland23@email.com',
                date: 'January 10, 2025 | 09:15',
                rating: 3,
                comment: 'Decent jacket, but not as warm as I expected. Works well for mild winter conditions, but in extreme cold, you might need an extra layer. The build quality is good, though.',
                avatar: 'JH'
            }
        ],
        2: [
            {
                name: 'Sarah Johnson',
                email: 'sarah.johnson@email.com',
                date: 'January 8, 2025 | 16:45',
                rating: 2,
                comment: 'The jacket looks nice but the sizing was off. Ordered a large but it fits more like a medium. The material is okay but not worth the price.',
                avatar: 'SJ'
            }
        ],
        1: [
            {
                name: 'David Brown',
                email: 'david.brown@email.com',
                date: 'January 5, 2025 | 11:30',
                rating: 1,
                comment: 'Very disappointed with this purchase. The jacket started showing wear after just a few uses. The zipper broke within a week. Would not recommend.',
                avatar: 'DB'
            }
        ]
    };

    images: string[] = [
        '/demo/images/ecommerce/productoverview/ecommerce-productoverview-1.jpg',
        '/demo/images/ecommerce/productoverview/ecommerce-productoverview-2.jpg',
        '/demo/images/ecommerce/productoverview/ecommerce-productoverview-3.jpg',
        '/demo/images/ecommerce/productoverview/ecommerce-productoverview-4.jpg'
    ];

    recommendations: Recommendation[] = [
        { id: 1, image: '/demo/images/ecommerce/productoverview/ecommerce-productoverview-5.jpg', active: true },
        { id: 2, image: '/demo/images/ecommerce/productoverview/ecommerce-productoverview-6.jpg', active: false },
        { id: 3, image: '/demo/images/ecommerce/productoverview/ecommerce-productoverview-7.jpg', active: false },
        { id: 4, image: '/demo/images/ecommerce/productoverview/ecommerce-productoverview-8.jpg', active: false }
    ];

    sizes: Size[] = [
        { label: 'XS', disabled: true },
        { label: 'S', disabled: false },
        { label: 'M', disabled: false },
        { label: 'L', disabled: false },
        { label: 'XL', disabled: true },
        { label: 'XXL', disabled: false }
    ];

    reviewMenuItems = [
        {
            label: 'Report Review',
            icon: 'pi pi-flag',
            command: () => {}
        },
        {
            label: 'Share Review',
            icon: 'pi pi-share-alt',
            command: () => {}
        },
        {
            separator: true
        },
        {
            label: 'Mark as Helpful',
            icon: 'pi pi-thumbs-up',
            command: () => {}
        }
    ];

    selectRating(rating: number | 'all') {
        this.selectedRating.set(rating);
    }

    setSize(size: string) {
        const sizeItem = this.sizes.find((s) => s.label === size);
        if (sizeItem && !sizeItem.disabled) {
            this.selectedSize.set(size);
        }
    }

    setRecommendation(index: number) {
        this.selectedRecommendation.set(index);
        this.recommendations.forEach((rec, i) => {
            rec.active = i === index;
        });
    }

    toggleReviewMenu(event: Event, index: number) {
        const menuArray = this.reviewMenus.toArray();
        if (menuArray[index]) {
            menuArray[index].toggle(event);
        }
    }

    getDatePart(dateStr: string): string {
        return dateStr.split(' | ')[0];
    }

    getTimePart(dateStr: string): string {
        return dateStr.split(' | ')[1];
    }
}
