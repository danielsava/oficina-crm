import { afterNextRender, Component, effect, inject, signal } from '@angular/core';
import { ChartModule } from 'primeng/chart';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    selector: 'performance-widget',
    standalone: true,
    imports: [ChartModule],
    template: `<div class="flex flex-col gap-4 rounded-md border h-full border-surface p-6">
        <div class="flex justify-between items-center">
            <div class="flex items-center gap-4">
                <div>
                    <i class="pi pi-chart-bar text-primary text-3xl"></i>
                </div>
                <div class="flex flex-col justify-between gap-1">
                    <span class="font-bold text-surface-900 dark:text-surface-0">My Performance</span>
                </div>
            </div>
            <div class="flex items-center gap-1">
                <div class="flex items-center justify-center gap-1 rounded-md p-2 bg-red-100 text-red-400">
                    <i class="pi pi-arrow-down-right"></i>
                    <span>-13%</span>
                </div>
            </div>
        </div>
        <div class="flex flex-col gap-2 h-84 -mb-6 relative">
            <p-chart height="300" type="line" [data]="basicData()" [options]="basicOptions()"></p-chart>
        </div>
    </div>`,
    host: {
        class: 'col-span-12 md:col-span-4'
    }
})
export class PerformanceWidget {
    layoutService = inject(LayoutService);

    basicData = signal<any>(null);

    basicOptions = signal<any>(null);

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
        const textColor = documentStyle.getPropertyValue('--text-color');
        const surfaceBorder = documentStyle.getPropertyValue('--surface-border');

        this.basicData.set({
            labels: ['January', 'February', 'March', 'April', 'May'],
            datasets: [
                {
                    label: 'Previous Month',
                    borderColor: '#E0E0E0',
                    tension: 0.5,
                    data: [22, 36, 11, 33, 2]
                },
                {
                    label: 'Current Month',
                    borderColor: '#6366F1',
                    tension: 0.5,
                    data: [22, 16, 31, 11, 38]
                }
            ]
        });

        this.basicOptions.set({
            plugins: {
                legend: {
                    labels: {
                        color: textColor,
                        boxWidth: 12,
                        boxHeight: 4
                    },
                    position: 'bottom'
                }
            },
            maintainAspectRatio: false,
            elements: { point: { radius: 0 } },
            scales: {
                x: {
                    ticks: {
                        color: textColor
                    },
                    grid: {
                        color: surfaceBorder
                    }
                },
                y: {
                    ticks: {
                        color: textColor,
                        stepSize: 10
                    },
                    grid: {
                        color: surfaceBorder
                    }
                }
            }
        });
    }
}
