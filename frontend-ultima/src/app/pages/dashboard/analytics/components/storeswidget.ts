import { afterNextRender, Component, DestroyRef, effect, inject, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ChartModule, UIChart } from 'primeng/chart';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    selector: 'stores-widget',
    standalone: true,
    imports: [CommonModule, ChartModule],
    template: `<div class="card grid grid-cols-12 gap-4 grid-nogutter flex-wrap">
        <div class="lg:col-span-3 md:col-span-6 sm:col-span-12 col-span-12 p-0">
            <div class="flex flex-col p-6">
                <div class="text-muted-color mb-2">Store A Sales</div>
                <div class="flex items-center mb-3">
                    @if (storeADiff() !== 0) {
                        <i class="font-bold text-2xl! pi pr-1" [ngClass]="{ 'pi-arrow-up text-green-500': storeADiff() > 0, 'pi-arrow-down text-red-500': storeADiff() < 0 }"></i>
                    }
                    <div class="text-2xl">{{ storeATotalValue() }}</div>
                    @if (storeADiff() !== 0) {
                        <span class="font-medium text-base ml-2" [ngClass]="{ 'text-green-500': storeADiff() > 0, 'text-red-500': storeADiff() < 0 }"> {{ storeADiff() > 0 ? '+' : '' }}{{ storeADiff() }} </span>
                    }
                </div>
            </div>
            <p-chart #storeA type="line" [data]="storeAData()" [options]="chartOptions" [responsive]="true"></p-chart>
        </div>

        <div class="lg:col-span-3 md:col-span-6 sm:col-span-12 col-span-12 p-0">
            <div class="flex flex-col p-6">
                <span class="text-muted-color mb-2">Store B Sales</span>
                <span class="flex items-center mb-3">
                    @if (storeBDiff() !== 0) {
                        <i class="font-bold text-2xl! pi pr-1" [ngClass]="{ 'pi-arrow-up text-green-500': storeBDiff() > 0, 'pi-arrow-down text-red-500': storeBDiff() < 0 }"></i>
                    }
                    <div class="text-2xl">{{ storeBTotalValue() }}</div>
                    @if (storeBDiff() !== 0) {
                        <span class="font-medium text-base ml-2" [ngClass]="{ 'text-green-500': storeBDiff() > 0, 'text-red-500': storeBDiff() < 0 }"> {{ storeBDiff() > 0 ? '+' : '' }}{{ storeBDiff() }} </span>
                    }
                </span>
            </div>
            <p-chart #storeB type="line" [data]="storeBData()" [options]="chartOptions" [responsive]="true"></p-chart>
        </div>
        <div class="lg:col-span-3 md:col-span-6 sm:col-span-12 col-span-12 p-0">
            <div class="flex flex-col p-6">
                <span class="text-muted-color mb-2">Store C Sales</span>
                <span class="flex items-center mb-3">
                    @if (storeCDiff() !== 0) {
                        <i class="font-bold text-2xl! pi pr-1" [ngClass]="{ 'pi-arrow-up text-green-500': storeCDiff() > 0, 'pi-arrow-down text-red-500': storeCDiff() < 0 }"></i>
                    }
                    <div class="text-2xl">{{ storeCTotalValue() }}</div>
                    @if (storeCDiff() !== 0) {
                        <span class="font-medium text-base ml-2" [ngClass]="{ 'text-green-500': storeCDiff() > 0, 'text-red-500': storeCDiff() < 0 }"> {{ storeCDiff() > 0 ? '+' : '' }}{{ storeCDiff() }} </span>
                    }
                </span>
            </div>
            <p-chart #storeC type="line" [data]="storeCData()" [options]="chartOptions" [responsive]="true"></p-chart>
        </div>
        <div class="lg:col-span-3 md:col-span-6 sm:col-span-12 col-span-12 p-0">
            <div class="flex flex-col p-6">
                <span class="text-muted-color mb-2">Store D Sales</span>
                <span class="flex items-center mb-3">
                    @if (storeDDiff() !== 0) {
                        <i class="font-bold text-2xl! pi pr-1" [ngClass]="{ 'pi-arrow-up text-green-500': storeDDiff() > 0, 'pi-arrow-down text-red-500': storeDDiff() < 0 }"></i>
                    }
                    <div class="text-2xl">{{ storeDTotalValue() }}</div>
                    @if (storeDDiff() !== 0) {
                        <span class="font-medium text-base ml-2" [ngClass]="{ 'text-green-500': storeDDiff() > 0, 'text-red-500': storeDDiff() < 0 }"> {{ storeDDiff() > 0 ? '+' : '' }}{{ storeDDiff() }} </span>
                    }
                </span>
            </div>
            <p-chart #storeD type="line" [data]="storeDData()" [options]="chartOptions" [responsive]="true"></p-chart>
        </div>
    </div> `
})
export class StoresWidget {
    layoutService = inject(LayoutService);

    destroyRef = inject(DestroyRef);

    @ViewChild('storeA') storeAViewChild!: UIChart;

    @ViewChild('storeB') storeBViewChild!: UIChart;

    @ViewChild('storeC') storeCViewChild!: UIChart;

    @ViewChild('storeD') storeDViewChild!: UIChart;

    storeATotalValue = signal(100);
    storeADiff = signal(0);
    storeAData = signal<any>(null);

    storeBTotalValue = signal(120);
    storeBDiff = signal(0);
    storeBData = signal<any>(null);

    storeCTotalValue = signal(150);
    storeCDiff = signal(0);
    storeCData = signal<any>(null);

    storeDTotalValue = signal(80);
    storeDDiff = signal(0);
    storeDData = signal<any>(null);

    chartOptions = {
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
                display: false
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
                radius: 0
            }
        }
    };

    storeInterval: any;

    private initialized = false;

    constructor() {
        afterNextRender(() => {
            setTimeout(() => {
                this.initCharts();
                this.startInterval();
                this.initialized = true;
            }, 150);
        });

        effect(() => {
            this.layoutService.layoutConfig().darkTheme;
            if (this.initialized) {
                setTimeout(() => {
                    this.initCharts();
                }, 150);
            }
        });

        this.destroyRef.onDestroy(() => {
            clearInterval(this.storeInterval);
        });
    }

    startInterval() {
        const calculateStore = (storeData: any, totalValue: number) => {
            let randomNumber = +(Math.random() * 500).toFixed(2);
            let data = [...storeData.datasets[0].data];
            let length = data.length;
            data.push(randomNumber);
            data.shift();
            storeData.datasets[0].data = data;

            let diff = +(data[length - 1] - data[length - 2]).toFixed(2);
            totalValue = +(totalValue + diff).toFixed(2);

            return { diff, totalValue, storeData };
        };

        this.storeInterval = setInterval(() => {
            requestAnimationFrame(() => {
                const storeAResult = calculateStore(this.storeAData(), this.storeATotalValue());
                this.storeADiff.set(storeAResult.diff);
                this.storeATotalValue.set(storeAResult.totalValue);
                this.storeAData.set({ ...storeAResult.storeData });
                this.storeAViewChild?.refresh();

                const storeBResult = calculateStore(this.storeBData(), this.storeBTotalValue());
                this.storeBDiff.set(storeBResult.diff);
                this.storeBTotalValue.set(storeBResult.totalValue);
                this.storeBData.set({ ...storeBResult.storeData });
                this.storeBViewChild?.refresh();

                const storeCResult = calculateStore(this.storeCData(), this.storeCTotalValue());
                this.storeCDiff.set(storeCResult.diff);
                this.storeCTotalValue.set(storeCResult.totalValue);
                this.storeCData.set({ ...storeCResult.storeData });
                this.storeCViewChild?.refresh();

                const storeDResult = calculateStore(this.storeDData(), this.storeDTotalValue());
                this.storeDDiff.set(storeDResult.diff);
                this.storeDTotalValue.set(storeDResult.totalValue);
                this.storeDData.set({ ...storeDResult.storeData });
                this.storeDViewChild?.refresh();
            });
        }, 2000);
    }

    initCharts() {
        this.storeAData.set({
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'],
            datasets: [
                {
                    data: [55, 3, 45, 6, 44, 58, 84, 68, 64],
                    borderColor: ['#4DD0E1'],
                    backgroundColor: ['rgba(77, 208, 225, 0.8)'],
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        });

        this.storeBData.set({
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'],
            datasets: [
                {
                    data: [81, 75, 63, 100, 69, 79, 38, 37, 76],
                    borderColor: ['#4DD0E1'],
                    backgroundColor: ['rgba(77, 208, 225, 0.8)'],
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        });

        this.storeCData.set({
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'],
            datasets: [
                {
                    data: [99, 55, 22, 72, 24, 79, 35, 91, 48],
                    borderColor: ['#4DD0E1'],
                    backgroundColor: ['rgba(77, 208, 225, 0.8)'],
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        });

        this.storeDData.set({
            labels: ['January', 'February', 'March', 'April', 'May', 'June', 'July', 'August', 'September'],
            datasets: [
                {
                    data: [5, 51, 68, 82, 28, 21, 29, 45, 44],
                    borderColor: ['#4DD0E1'],
                    backgroundColor: ['rgba(77, 208, 225, 0.8)'],
                    borderWidth: 2,
                    fill: true,
                    tension: 0.4
                }
            ]
        });
    }
}
