import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { TagModule } from 'primeng/tag';

interface Product {
    id: number;
    name: string;
    price: string;
    priceNumber: number;
    rating: number;
    category: string;
    dateAdded: Date;
    image: string;
}

interface SelectOption {
    label: string;
    value: string | null;
}

@Component({
    selector: 'app-product-list',
    imports: [FormsModule, IconFieldModule, InputIconModule, InputTextModule, SelectModule, TagModule],
    template: `
        <div class="p-6 card">
            <div class="flex flex-col xl:flex-row justify-between items-start xl:items-center gap-7 mb-7">
                <div class="flex flex-col sm:flex-row justify-end items-stretch sm:items-center gap-4 w-full ml-auto">
                    <div class="w-full sm:w-[217px]">
                        <p-iconfield iconPosition="left">
                            <p-inputicon class="pi pi-search" />
                            <input type="text" pInputText [(ngModel)]="searchQuery" placeholder="Search" class="w-full" />
                        </p-iconfield>
                    </div>

                    <div class="w-full sm:w-[148px]">
                        <p-select [(ngModel)]="selectedCategory" [options]="categories" optionLabel="label" optionValue="value" placeholder="Category" styleClass="w-full rounded-xl border border-surface-200 dark:border-surface-700" />
                    </div>

                    <div class="w-full sm:w-[148px]">
                        <p-select [(ngModel)]="selectedSort" [options]="sortOptions" optionLabel="label" optionValue="value" placeholder="Sort By" styleClass="w-full rounded-xl border border-surface-200 dark:border-surface-700" />
                    </div>
                </div>
            </div>

            <div class="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
                @for (product of filteredAndSortedProducts; track product.id) {
                    <div class="h-120 p-4 rounded-3xl flex flex-col justify-end items-start gap-2 overflow-hidden relative group cursor-pointer">
                        <div class="absolute inset-0 rounded-3xl overflow-hidden">
                            <img [src]="product.image" class="w-full h-full object-cover" [alt]="product.name" />
                            <div class="absolute inset-0 bg-linear-to-t from-black/60 via-transparent to-transparent"></div>
                        </div>

                        <div class="relative z-10 w-full p-4 bg-surface-0 dark:bg-surface-900 rounded-2xl shadow-xl flex flex-col justify-start items-start gap-2 overflow-hidden">
                            <div class="w-full flex justify-between items-center gap-2">
                                <p-tag [value]="getCategoryLabel(product.category)" severity="secondary" styleClass="text-xs font-medium" />
                                <div class="flex justify-start items-center gap-2">
                                    <div class="p-2 rounded-lg border border-surface-200 dark:border-surface-700 flex justify-center items-center cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                                        <i class="pi pi-heart text-surface-500 dark:text-surface-400 text-sm sm:text-base"></i>
                                    </div>
                                    <div class="p-2 rounded-lg border border-surface-200 dark:border-surface-700 flex justify-center items-center cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors">
                                        <i class="pi pi-shopping-cart text-surface-500 dark:text-surface-400 text-sm sm:text-base"></i>
                                    </div>
                                </div>
                            </div>

                            <div class="w-full flex flex-col gap-2">
                                <div class="w-full text-surface-500 dark:text-surface-400 text-base sm:text-lg font-medium leading-6 sm:leading-7">{{ product.name }}</div>

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

            @if (filteredAndSortedProducts.length === 0) {
                <div class="w-full text-center py-12">
                    <div class="text-surface-500 dark:text-surface-400 text-lg font-medium mb-2">No products found</div>
                    <div class="text-surface-400 dark:text-surface-500 text-base">Try adjusting your filters or search terms</div>
                </div>
            }
        </div>
    `
})
export class ProductList {
    products: Product[] = [
        {
            id: 1,
            name: 'SkyLum™ Urban Trench Coat',
            price: '$249.99',
            priceNumber: 249.99,
            rating: 4.7,
            category: 'new',
            dateAdded: new Date('2024-01-15'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-1.jpg'
        },
        {
            id: 2,
            name: 'AeroFX™ All-Weather Jacket',
            price: '$319.99',
            priceNumber: 319.99,
            rating: 4.8,
            category: 'featured',
            dateAdded: new Date('2024-01-10'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-2.jpg'
        },
        {
            id: 3,
            name: 'AeroShield™ Storm Jacket',
            price: '$279.99',
            priceNumber: 279.99,
            rating: 4.6,
            category: 'sale',
            dateAdded: new Date('2024-01-12'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-3.jpg'
        },
        {
            id: 4,
            name: 'Nukie Windrunner PrimaLoft®',
            price: '$299.99',
            priceNumber: 299.99,
            rating: 4.9,
            category: 'featured',
            dateAdded: new Date('2024-01-08'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-4.jpg'
        },
        {
            id: 5,
            name: 'BreGD™ Lightweight Jacket',
            price: '$199.99',
            priceNumber: 199.99,
            rating: 4.5,
            category: 'sale',
            dateAdded: new Date('2024-01-14'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-5.jpg'
        },
        {
            id: 6,
            name: 'FlowMotion™ Cape Jacket',
            price: '$349.99',
            priceNumber: 349.99,
            rating: 4.7,
            category: 'new',
            dateAdded: new Date('2024-01-16'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-6.jpg'
        },
        {
            id: 7,
            name: 'Windianer® (Yellow Edition)',
            price: '$269.99',
            priceNumber: 269.99,
            rating: 4.4,
            category: 'featured',
            dateAdded: new Date('2024-01-09'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-7.jpg'
        },
        {
            id: 8,
            name: 'Stratos™ Monochrome Suit',
            price: '$399.99',
            priceNumber: 399.99,
            rating: 4.8,
            category: 'new',
            dateAdded: new Date('2024-01-17'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-8.jpg'
        },
        {
            id: 9,
            name: 'PueLoft® Summer White',
            price: '$229.99',
            priceNumber: 229.99,
            rating: 4.3,
            category: 'sale',
            dateAdded: new Date('2024-01-11'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-9.jpg'
        },
        {
            id: 10,
            name: 'LuxeBreeze™ Pink Dress',
            price: '$189.99',
            priceNumber: 189.99,
            rating: 4.6,
            category: 'featured',
            dateAdded: new Date('2024-01-13'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-10.jpg'
        },
        {
            id: 11,
            name: 'StormEdge™ Midnight Coat',
            price: '$289.99',
            priceNumber: 289.99,
            rating: 4.7,
            category: 'new',
            dateAdded: new Date('2024-01-18'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-11.jpg'
        },
        {
            id: 12,
            name: 'DieCR™ Classic Blue Jacket',
            price: '$219.99',
            priceNumber: 219.99,
            rating: 4.2,
            category: 'sale',
            dateAdded: new Date('2024-01-07'),
            image: '/demo/images/ecommerce/product-list/ecommerce-productlist-12.jpg'
        }
    ];

    searchQuery = '';
    selectedCategory: string | null = null;
    selectedSort: string | null = null;

    categories: SelectOption[] = [
        { label: 'All Products', value: null },
        { label: 'New Product', value: 'new' },
        { label: 'Sale', value: 'sale' },
        { label: 'Featured', value: 'featured' }
    ];

    sortOptions: SelectOption[] = [
        { label: 'Default', value: null },
        { label: 'Price: Low to High', value: 'price_asc' },
        { label: 'Price: High to Low', value: 'price_desc' },
        { label: 'Newest First', value: 'newest' },
        { label: 'Rating: High to Low', value: 'rating' }
    ];

    get filteredAndSortedProducts(): Product[] {
        let filtered = this.products;

        if (this.searchQuery.trim()) {
            const query = this.searchQuery.toLowerCase();
            filtered = filtered.filter((product) => product.name.toLowerCase().includes(query));
        }

        if (this.selectedCategory) {
            filtered = filtered.filter((product) => product.category === this.selectedCategory);
        }

        if (this.selectedSort) {
            switch (this.selectedSort) {
                case 'price_asc':
                    filtered = [...filtered].sort((a, b) => a.priceNumber - b.priceNumber);
                    break;
                case 'price_desc':
                    filtered = [...filtered].sort((a, b) => b.priceNumber - a.priceNumber);
                    break;
                case 'newest':
                    filtered = [...filtered].sort((a, b) => new Date(b.dateAdded).getTime() - new Date(a.dateAdded).getTime());
                    break;
                case 'rating':
                    filtered = [...filtered].sort((a, b) => b.rating - a.rating);
                    break;
            }
        }

        return filtered;
    }

    getCategoryLabel(category: string): string {
        switch (category) {
            case 'new':
                return 'New';
            case 'sale':
                return 'Sale';
            case 'featured':
                return 'Featured';
            default:
                return category;
        }
    }
}
