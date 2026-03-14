import { afterNextRender, Component, computed, effect, inject, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { MenuModule } from 'primeng/menu';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    selector: 'order-graph-widget',
    standalone: true,
    imports: [ButtonModule, RippleModule, ChartModule, MenuModule],
    template: `<div class="card h-full">
        <div class="flex items-center justify-between mb-4">
            <span class="font-semibold text-xl m-0">Order Graph</span>
            <div>
                <button pButton pRipple icon="pi pi-ellipsis-h" rounded text (click)="menu.toggle($event)"></button>
                <p-menu #menu popup [model]="items"> </p-menu>
            </div>
        </div>
        <p-chart type="line" [data]="ordersChart()" [options]="ordersOptions()" height="375" width="300"></p-chart>
    </div>`
})
export class OrderGraphWidget {
    layoutService = inject(LayoutService);

    items = [
        { label: 'Update', icon: 'pi pi-fw pi-refresh' },
        { label: 'Edit', icon: 'pi pi-fw pi-pencil' }
    ];

    ordersChart = signal<any>(null);

    ordersOptions = signal<any>(null);

    private initialized = false;

    constructor() {
        afterNextRender(() => {
            setTimeout(() => {
                this.initChart();
                this.initialized = true;
            }, 150);
        });

        effect(() => {
            this.layoutService.isDarkTheme();
            if (this.initialized) {
                setTimeout(() => {
                    this.initChart();
                }, 150);
            }
        });
    }

    initChart() {
        const documentStyle = getComputedStyle(document.documentElement);
        const textColor = documentStyle.getPropertyValue('--text-color') || 'rgba(0, 0, 0, 0.87)';
        const gridLinesColor = documentStyle.getPropertyValue('--surface-border') || 'rgba(160, 167, 181, .3)';
        const fontFamily = documentStyle.getPropertyValue('--font-family');

        this.ordersChart.set({
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'],
            datasets: [
                {
                    label: 'New Orders',
                    data: [31, 23, 69, 29, 62, 25, 59, 26, 46],
                    borderColor: ['#4DD0E1'],
                    backgroundColor: ['rgba(77, 208, 225, 0.2)'],
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                },
                {
                    label: 'Completed Orders',
                    data: [57, 48, 27, 88, 38, 3, 22, 60, 56],
                    borderColor: ['#3F51B5'],
                    backgroundColor: ['rgba(63, 81, 181, 0.4)'],
                    borderWidth: 2,
                    fill: false,
                    tension: 0.4
                }
            ]
        });

        this.ordersOptions.set({
            plugins: {
                legend: {
                    display: true,
                    labels: {
                        font: {
                            family: fontFamily
                        },
                        color: textColor
                    }
                }
            },
            maintainAspectRatio: false,
            responsive: true,
            scales: {
                y: {
                    ticks: {
                        font: {
                            family: fontFamily
                        },
                        color: textColor
                    },
                    grid: {
                        color: gridLinesColor
                    }
                },
                x: {
                    ticks: {
                        font: {
                            family: fontFamily
                        },
                        color: textColor
                    },
                    grid: {
                        color: gridLinesColor
                    }
                }
            }
        });
    }
}
