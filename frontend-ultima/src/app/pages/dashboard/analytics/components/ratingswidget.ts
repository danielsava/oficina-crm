import { afterNextRender, Component, effect, inject, signal } from '@angular/core';
import { SelectButton } from 'primeng/selectbutton';
import { ChartModule } from 'primeng/chart';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    selector: 'ratings-widget',
    standalone: true,
    imports: [CommonModule, SelectButton, ChartModule, RouterModule, FormsModule],
    template: `<div class="card h-full">
        <div class="flex flex-col gap-4">
            <div class="flex flex-col p-4 gap-4 w-full justify-between rounded-md">
                <div class="flex justify-between items-center">
                    <span class="text-xl font-semibold m-0">Ratings</span>
                    <p-select-button [(ngModel)]="optionValue" [options]="stateOptions" optionLabel="label"></p-select-button>
                </div>
                <div>
                    <p-chart type="line" [data]="expensesData()" [options]="expensesOptions()"></p-chart>
                </div>
            </div>
            <div class="flex flex-col lg:flex-row gap-4 justify-between flex-1">
                @for (rating of ratings; track rating.title) {
                    <div class="flex flex-col p-4 w-full border border-surface rounded-xl gap-4">
                        <div class="flex justify-between">
                            <div class="flex flex-col gap-1">
                                <span class="text-surface-900 dark:text-surface-0 text-4xl">{{ rating.value }}</span>
                                <span class="text-surface-700 dark:text-surface-100">{{ rating.title }}</span>
                            </div>
                            <a [routerLink]="['/dashboard-analytics']">
                                <i [ngClass]="[rating.icon, 'text-surface-900 dark:text-surface-0 text-2xl']"></i>
                            </a>
                        </div>
                        <div class="flex flex-col gap-2">
                            @for (item of rating.items; track item.title) {
                                <div class="flex gap-2 p-2 bg-surface-0 dark:bg-surface-900 shadow-sm rounded-md">
                                    <img [src]="item.image" class="w-8 h-8 rounded-full" />
                                    <div class="flex flex-col gap-1">
                                        <span class="text-sm font-medium text-surface-900 dark:text-surface-0">{{ item.title }}</span>
                                        <span class="text-sm text-surface-900 dark:text-surface-0">{{ item.description }}</span>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                }
            </div>
        </div>
    </div>`
})
export class RatingsWidget {
    layoutService = inject(LayoutService);

    optionValue = { label: 'Weekly', value: 'weekly' };

    expensesData = signal<any>(null);

    expensesOptions = signal<any>(null);

    stateOptions = [
        { label: 'Weekly', value: 'weekly' },
        { label: 'Monthly', value: 'monthly' }
    ];

    ratings = [
        {
            title: 'Product Questions',
            value: '23',
            icon: 'pi pi-arrow-up-right',
            items: [
                {
                    image: '/demo/images/product/black-watch.jpg',
                    title: 'Black Watch',
                    description: 'Is the Black Watch product water-resistant?'
                },
                {
                    image: '/demo/images/product/blue-t-shirt.jpg',
                    title: 'Blue T-Shirt',
                    description: 'Can I return or exchange the blue t-shirt if I am not satisfied with it?'
                }
            ]
        },
        {
            title: 'Product Reviews',
            value: '54',
            icon: 'pi pi-arrow-up-right',
            items: [
                {
                    image: '/demo/images/product/blue-band.jpg',
                    title: 'Blue Band',
                    description: 'Loved the blue band from this e-commerce site!'
                },
                {
                    image: '/demo/images/product/bamboo-watch.jpg',
                    title: 'Bamboo Watch',
                    description: "I purchased the bamboo watch and I'm really happy with it."
                }
            ]
        },
        {
            title: 'Shipping Orders',
            value: '99+',
            icon: 'pi pi-arrow-up-right',
            items: [
                {
                    image: '/demo/images/product/black-watch.jpg',
                    title: 'Black Watch',
                    description: 'Last Shipping Date'
                },
                {
                    image: '/demo/images/product/bamboo-watch.jpg',
                    title: 'Blue T-Shirt',
                    description: 'Last Shipping Date'
                }
            ]
        }
    ];

    private initialized = false;

    constructor() {
        afterNextRender(() => {
            setTimeout(() => {
                this.initChart();
                this.initialized = true;
            }, 150);
        });

        effect(() => {
            this.layoutService.layoutConfig().darkTheme;
            if (this.initialized) {
                setTimeout(() => {
                    this.initChart();
                }, 150);
            }
        });
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const primaryColor = documentStyle.getPropertyValue('--p-primary-color');
        const primary50 = documentStyle.getPropertyValue('--p-primary-50');
        const primary200 = documentStyle.getPropertyValue('--p-primary-200');
        const primary800 = documentStyle.getPropertyValue('--p-primary-800');

        this.expensesData.set({
            labels: ['January', 'February', 'March', 'April', 'May', 'June'],
            datasets: [
                {
                    data: [30, 10, 32, 15, 20, 40],
                    borderColor: [primaryColor],
                    backgroundColor: [this.layoutService.isDarkTheme() ? `color-mix(in srgb, ${primary200}, transparent 84%)` : primary50],
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        });

        this.expensesOptions.set({
            plugins: {
                legend: {
                    display: false
                }
            },
            maintainAspectRatio: false,
            responsive: true,
            aspectRatio: 4,
            scales: {
                y: {
                    display: false,
                    beginAtZero: true
                },
                x: {
                    display: false
                }
            },
            tooltips: {
                enabled: false
            },
            elements: {
                point: {
                    radius: 5,
                    pointBackgroundColor: [primary800]
                }
            }
        });
    }
}
