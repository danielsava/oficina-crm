import { Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DividerModule } from 'primeng/divider';
import { IconFieldModule } from 'primeng/iconfield';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { MenuModule } from 'primeng/menu';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';
import { Menu } from 'primeng/menu';
import { NgClass } from '@angular/common';

interface Product {
    name: string;
    code: string;
    category: string | null;
    brand: string;
    gender: string;
    price: string;
    sizes: string[];
    cargoCompany: string[] | null;
}

interface SelectOption {
    label: string;
    value: string;
}

interface Size {
    label: string;
}

interface ColorOption {
    name: string;
    value: string;
    class: string;
}

@Component({
    selector: 'app-new-product',
    imports: [NgClass, FormsModule, ButtonModule, DividerModule, IconFieldModule, InputGroupModule, InputGroupAddonModule, InputIconModule, InputTextModule, MenuModule, MultiSelectModule, RadioButtonModule, SelectModule],
    template: `
        <div class="flex flex-col xl:flex-row card">
            <div class="w-full xl:w-[65%] flex flex-col overflow-hidden">
                <div class="px-6 py-4 flex justify-start items-start gap-4">
                    <div class="text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">Add Product</div>
                </div>

                <!-- Divider -->
                <div class="px-6 py-2">
                    <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                </div>

                <div class="p-6 flex flex-col lg:flex-row justify-start items-start gap-4">
                    <div class="flex-1 flex flex-col justify-start items-start gap-2">
                        <div class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Product name</div>
                        <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Code will be generated automatically</div>
                    </div>
                    <div class="flex-1 flex flex-col justify-start items-start gap-3 w-full lg:w-auto">
                        <input type="text" pInputText [(ngModel)]="product.name" placeholder="Enter product name" class="w-full" />
                        <p-inputGroup>
                            <input type="text" pInputText [(ngModel)]="product.code" placeholder="158692" readonly />
                            <p-inputGroupAddon>
                                <i class="pi pi-copy cursor-pointer text-surface-500 dark:text-surface-400 hover:text-surface-700 dark:hover:text-surface-200 transition-colors"></i>
                            </p-inputGroupAddon>
                        </p-inputGroup>
                    </div>
                </div>

                <div class="px-6 py-2">
                    <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                </div>

                <div class="p-6 flex flex-col lg:flex-row justify-start items-start gap-4">
                    <div class="flex-1 flex flex-col justify-start items-start gap-2">
                        <div class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Category & Brand</div>
                        <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">It will help customer to find the product</div>
                    </div>
                    <div class="flex-1 flex flex-col justify-start items-start gap-3 w-full lg:w-auto">
                        <p-select [(ngModel)]="product.category" [options]="categories" optionLabel="label" optionValue="value" placeholder="Select category" styleClass="w-full" />
                        <input type="text" pInputText [(ngModel)]="product.brand" placeholder="Enter brand name" class="w-full" />
                    </div>
                </div>

                <div class="px-6 py-2">
                    <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                </div>

                <div class="p-6 flex flex-col lg:flex-row justify-start items-start lg:items-center gap-4">
                    <div class="w-full lg:w-[337px] text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Gender</div>
                    <div class="w-full flex-1 flex flex-col sm:flex-row justify-start lg:justify-end items-start sm:items-center gap-4">
                        <div class="flex justify-start items-center gap-2">
                            <p-radioButton [(ngModel)]="product.gender" inputId="women" value="women" />
                            <label for="women" class="text-surface-900 dark:text-surface-0 text-base font-normal">Women</label>
                        </div>
                        <div class="flex justify-start items-center gap-2">
                            <p-radioButton [(ngModel)]="product.gender" inputId="men" value="men" />
                            <label for="men" class="text-surface-900 dark:text-surface-0 text-base font-normal">Men</label>
                        </div>
                        <div class="flex justify-start items-center gap-2">
                            <p-radioButton [(ngModel)]="product.gender" inputId="unisex" value="unisex" />
                            <label for="unisex" class="text-surface-900 dark:text-surface-0 text-base font-normal">Unisex</label>
                        </div>
                    </div>
                </div>

                <div class="px-6 py-2">
                    <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                </div>

                <div class="p-6 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div class="w-full lg:w-96 text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Price</div>
                    <div class="w-full lg:w-96">
                        <p-iconfield iconPosition="left">
                            <p-inputicon class="pi pi-dollar" />
                            <input type="text" pInputText [(ngModel)]="product.price" placeholder="Enter price" class="w-full" />
                        </p-iconfield>
                    </div>
                </div>

                <div class="px-6 py-2">
                    <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                </div>

                <div class="p-6 flex flex-col lg:flex-row justify-start items-start gap-4">
                    <div class="flex-1 flex flex-col justify-start items-start gap-2">
                        <div class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Size</div>
                        <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Pick available sizes</div>
                    </div>
                    <div class="flex-1 flex justify-start lg:justify-end items-center gap-2 flex-wrap">
                        @for (size of sizes; track size.label) {
                            <div
                                class="flex-1 min-w-[60px] max-w-[60px] p-1 rounded-xl transition-colors cursor-pointer border"
                                [ngClass]="{
                                    'border-primary-500 dark:border-primary-400': selectedSizes().includes(size.label),
                                    'border-surface-200 dark:border-surface-700': !selectedSizes().includes(size.label)
                                }"
                                (click)="toggleSize(size.label)"
                            >
                                <div
                                    class="w-full h-full flex justify-center items-center rounded-lg"
                                    [ngClass]="{
                                        'bg-primary-600': selectedSizes().includes(size.label),
                                        'bg-surface-200 dark:bg-surface-700': !selectedSizes().includes(size.label)
                                    }"
                                >
                                    <span
                                        class="text-sm font-medium"
                                        [ngClass]="{
                                            'text-white': selectedSizes().includes(size.label),
                                            'text-surface-950 dark:text-surface-0': !selectedSizes().includes(size.label)
                                        }"
                                    >
                                        {{ size.label }}
                                    </span>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <div class="px-6 py-2">
                    <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                </div>

                <div class="p-6 flex flex-col lg:flex-row justify-start items-start gap-4">
                    <div class="w-full lg:w-96 flex flex-col justify-start items-start gap-2">
                        <div class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Color Variants</div>
                        <div class="text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Upload pictures with your colors</div>
                    </div>
                    <div class="flex-1 flex justify-end items-center gap-2 flex-wrap">
                        @for (color of selectedColors(); track color) {
                            <div class="relative w-8 h-8 rounded-full border border-surface-200 dark:border-surface-700 cursor-pointer group" [ngClass]="getColorClass(color)" (click)="removeColor(color)">
                                <div class="absolute inset-0 flex justify-center items-center opacity-0 group-hover:opacity-100 transition-opacity bg-black/30 rounded-full">
                                    <i class="pi pi-times text-white text-xs"></i>
                                </div>
                            </div>
                        }

                        <div
                            class="w-8 h-8 bg-surface-100 dark:bg-surface-700 rounded-full border border-surface-200 dark:border-surface-700 flex justify-center items-center cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-600 transition-colors"
                            (click)="showColorMenu($event)"
                        >
                            <i class="pi pi-plus text-surface-600 dark:text-surface-300 text-xs"></i>
                        </div>

                        <p-menu #colorMenu [model]="menuItems()" [popup]="true" />
                    </div>
                </div>

                <div class="px-6 py-2">
                    <p-divider styleClass="border-surface-200 dark:border-surface-700" />
                </div>

                <div class="p-6 flex flex-col lg:flex-row justify-between items-center gap-4">
                    <div class="w-full lg:w-96 text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Cargo Company</div>
                    <div class="w-full lg:w-96">
                        <p-multiSelect [(ngModel)]="product.cargoCompany" [options]="cargoCompanies" optionLabel="label" optionValue="value" placeholder="Select cargo companies" styleClass="w-full" appendTo="body" />
                    </div>
                </div>
            </div>

            <div class="w-full xl:w-[35%] bg-surface-50 dark:bg-surface-800 flex flex-col overflow-hidden rounded-2xl border border-surface-200 dark:border-surface-700">
                <div class="px-6 py-4 flex justify-start items-start gap-4">
                    <div class="text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">Product Preview</div>
                </div>

                <div class="px-6 py-2">
                    <p-divider styleClass="border-surface-300 dark:border-surface-600" />
                </div>

                <div class="p-6 flex flex-col justify-start items-start gap-4">
                    @if (!coverImage()) {
                        <div
                            class="w-full h-96 p-2 bg-surface-50 dark:bg-surface-700 rounded-xl border border-surface-300 dark:border-surface-600 flex flex-col justify-center items-center gap-6 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-600 transition-colors"
                            (click)="triggerFileUpload('cover')"
                        >
                            <div class="flex flex-col justify-center items-center gap-4">
                                <div class="w-12 h-12">
                                    <i class="pi pi-cloud-upload text-surface-500 dark:text-surface-400 !text-4xl"></i>
                                </div>
                                <div class="text-center text-surface-500 dark:text-surface-400 text-xl font-medium leading-7">Drop or select a cover image</div>
                                <div class="text-primary-600 dark:text-primary-400 text-lg font-medium underline leading-7">Upload</div>
                            </div>
                        </div>
                    } @else {
                        <div class="w-full h-96 p-4 rounded-3xl flex flex-col justify-end items-start gap-2 overflow-hidden relative group cursor-pointer">
                            <div class="absolute inset-0 rounded-3xl overflow-hidden">
                                <img [src]="coverImage()" class="w-full h-full object-cover" [alt]="product.name || 'Product preview'" />
                                <div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                                <p-button icon="pi pi-trash" severity="danger" size="small" [rounded]="true" styleClass="!absolute top-2 right-2 w-8 h-8 p-0 shadow-lg z-20" (onClick)="removeCoverImage($event)" />
                            </div>

                            <div class="relative z-10 w-full p-4 bg-surface-0 dark:bg-surface-900 rounded-2xl shadow-xl flex flex-col justify-start items-start gap-2 overflow-hidden">
                                <div class="w-full flex flex-col gap-2">
                                    <div class="w-full flex justify-between items-start gap-2">
                                        <div class="flex-1 text-surface-500 dark:text-surface-400 text-base sm:text-lg font-medium leading-6 sm:leading-7 line-clamp-2 min-w-0">{{ product.name || 'Product Name' }}</div>
                                        <div class="flex justify-start items-center gap-2 shrink-0">
                                            <div class="p-2 rounded-lg border border-surface-200 dark:border-surface-700 flex justify-center items-center cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                                                <i class="pi pi-heart text-surface-500 dark:text-surface-400 text-sm sm:text-base"></i>
                                            </div>
                                            <div class="p-2 rounded-lg border border-surface-200 dark:border-surface-700 flex justify-center items-center cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                                                <i class="pi pi-shopping-cart text-surface-500 dark:text-surface-400 text-sm sm:text-base"></i>
                                            </div>
                                        </div>
                                    </div>

                                    <div class="w-full flex justify-between items-center">
                                        <div class="text-surface-950 dark:text-surface-0 text-xl sm:text-2xl font-medium leading-8 sm:leading-loose break-all">\${{ product.price || '0.00' }}</div>
                                        <div class="px-2 py-1 bg-yellow-100 dark:bg-yellow-900 rounded-md flex justify-start items-center gap-1">
                                            <i class="pi pi-star-fill text-yellow-600 dark:text-yellow-400 text-xs"></i>
                                            <div class="text-yellow-600 dark:text-yellow-400 text-sm font-semibold leading-tight">0.0</div>
                                        </div>
                                    </div>
                                </div>
                            </div>
                        </div>
                    }

                    <div class="w-full flex justify-start items-start gap-4">
                        @for (image of additionalImages(); track $index; let index = $index) {
                            <div
                                class="flex-1 aspect-square p-2 bg-surface-50 dark:bg-surface-700 rounded-xl border border-surface-300 dark:border-surface-600 flex flex-col justify-center items-center gap-6 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-600 transition-colors"
                                (click)="triggerFileUpload('image' + (index + 1))"
                            >
                                @if (image) {
                                    <div class="relative w-full h-full">
                                        <img [src]="image" alt="Additional image" class="w-full h-full object-cover rounded-lg" />
                                        <p-button icon="pi pi-trash" severity="danger" size="small" [rounded]="true" styleClass="!absolute top-2 right-2 w-6 h-6 p-0 shadow-lg z-20" (onClick)="removeAdditionalImage($event, index)" />
                                    </div>
                                } @else {
                                    <div class="flex flex-col justify-center items-center gap-2">
                                        <i class="pi pi-cloud-upload text-surface-500 dark:text-surface-400 !text-lg"></i>
                                        <div class="text-primary-600 dark:text-primary-400 text-sm font-medium underline leading-tight">Upload</div>
                                    </div>
                                }
                            </div>
                        }
                    </div>
                </div>
            </div>

            <input #coverInput type="file" accept="image/*" class="hidden" (change)="handleCoverUpload($event)" />
            <input #image1Input type="file" accept="image/*" class="hidden" (change)="handleImageUpload($event, 0)" />
            <input #image2Input type="file" accept="image/*" class="hidden" (change)="handleImageUpload($event, 1)" />
            <input #image3Input type="file" accept="image/*" class="hidden" (change)="handleImageUpload($event, 2)" />
        </div>

        <div class="p-6">
            <div class="flex justify-end">
                <p-button label="Add Product" styleClass="px-6 py-3 rounded-xl text-base font-medium" (onClick)="addProduct()" />
            </div>
        </div>
    `
})
export class NewProduct {
    @ViewChild('colorMenu') colorMenu!: Menu;
    @ViewChild('coverInput') coverInput!: ElementRef<HTMLInputElement>;
    @ViewChild('image1Input') image1Input!: ElementRef<HTMLInputElement>;
    @ViewChild('image2Input') image2Input!: ElementRef<HTMLInputElement>;
    @ViewChild('image3Input') image3Input!: ElementRef<HTMLInputElement>;

    product: Product = {
        name: '',
        code: '158692',
        category: null,
        brand: '',
        gender: 'women',
        price: '',
        sizes: ['XS', 'S', 'M', 'L', 'XL', 'XXL'],
        cargoCompany: null
    };

    categories: SelectOption[] = [
        { label: 'Jackets', value: 'jackets' },
        { label: 'Coats', value: 'coats' },
        { label: 'Dresses', value: 'dresses' },
        { label: 'Suits', value: 'suits' }
    ];

    cargoCompanies: SelectOption[] = [
        { label: 'FedEx', value: 'fedex' },
        { label: 'DHL', value: 'dhl' },
        { label: 'UPS', value: 'ups' },
        { label: 'USPS', value: 'usps' }
    ];

    sizes: Size[] = [{ label: 'XS' }, { label: 'S' }, { label: 'M' }, { label: 'L' }, { label: 'XL' }, { label: 'XXL' }];

    selectedSizes = signal<string[]>([]);
    selectedColors = signal<string[]>(['blue', 'red']);
    coverImage = signal<string | null>(null);
    additionalImages = signal<(string | null)[]>([null, null, null]);

    colorOptions: ColorOption[] = [
        { name: 'Red', value: 'red', class: 'bg-red-500' },
        { name: 'Blue', value: 'blue', class: 'bg-blue-500' },
        { name: 'Green', value: 'green', class: 'bg-green-500' },
        { name: 'Yellow', value: 'yellow', class: 'bg-yellow-500' },
        { name: 'Purple', value: 'purple', class: 'bg-purple-500' },
        { name: 'Pink', value: 'pink', class: 'bg-pink-500' },
        { name: 'Indigo', value: 'indigo', class: 'bg-indigo-500' },
        { name: 'Gray', value: 'gray', class: 'bg-gray-500' },
        { name: 'Black', value: 'black', class: 'bg-black' },
        { name: 'White', value: 'white', class: 'bg-white border border-gray-300' }
    ];

    menuItems = computed(() =>
        this.colorOptions
            .filter((color) => !this.selectedColors().includes(color.value))
            .map((color) => ({
                label: color.name,
                command: () => this.addColor(color.value)
            }))
    );

    triggerFileUpload(type: string) {
        switch (type) {
            case 'cover':
                this.coverInput?.nativeElement.click();
                break;
            case 'image1':
                this.image1Input?.nativeElement.click();
                break;
            case 'image2':
                this.image2Input?.nativeElement.click();
                break;
            case 'image3':
                this.image3Input?.nativeElement.click();
                break;
        }
    }

    handleCoverUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.coverImage.set(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
        input.value = '';
    }

    handleImageUpload(event: Event, index: number) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                const images = [...this.additionalImages()];
                images[index] = e.target?.result as string;
                this.additionalImages.set(images);
            };
            reader.readAsDataURL(file);
        }
        input.value = '';
    }

    toggleSize(sizeLabel: string) {
        const sizes = [...this.selectedSizes()];
        const index = sizes.indexOf(sizeLabel);
        if (index > -1) {
            sizes.splice(index, 1);
        } else {
            sizes.push(sizeLabel);
        }
        this.selectedSizes.set(sizes);
    }

    addColor(colorValue: string) {
        if (!this.selectedColors().includes(colorValue)) {
            this.selectedColors.set([...this.selectedColors(), colorValue]);
        }
    }

    removeColor(colorValue: string) {
        this.selectedColors.set(this.selectedColors().filter((c) => c !== colorValue));
    }

    showColorMenu(event: Event) {
        this.colorMenu.toggle(event);
    }

    getColorClass(colorValue: string): string {
        const color = this.colorOptions.find((c) => c.value === colorValue);
        return color ? color.class : 'bg-gray-500';
    }

    removeCoverImage(event: Event) {
        event.stopPropagation();
        this.coverImage.set(null);
    }

    removeAdditionalImage(event: Event, index: number) {
        event.stopPropagation();
        const images = [...this.additionalImages()];
        images[index] = null;
        this.additionalImages.set(images);
    }

    addProduct() {
        // Implementation for adding product
    }
}
