import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FormStateService } from './form-state.service';

@Component({
    selector: 'app-location-information',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, SelectModule],
    template: `
        <div class="flex-1 self-stretch xl:rounded-tr-3xl xl:rounded-br-3xl flex flex-col overflow-hidden">
            <div class="self-stretch px-4 sm:px-6 xl:pl-8 xl:pr-6 pt-6 pb-4 flex items-center gap-4">
                <div class="flex-1 text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">Location Information</div>
            </div>

            <div class="self-stretch px-4 sm:px-6 flex flex-col gap-[9.14px]">
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>
            </div>

            <div class="self-stretch p-4 sm:p-6 xl:p-8 flex flex-col items-end gap-6">
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Country</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">The country you are in</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-2">
                        <p-select [ngModel]="formState().country" (ngModelChange)="updateField('country', $event)" [options]="countryOptions" placeholder="" styleClass="w-full" />
                    </div>
                </div>

                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">City</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">The city you are in</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-2">
                        <input pInputText [ngModel]="formState().city" (ngModelChange)="updateField('city', $event)" placeholder="" class="w-full" />
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- Region/Location -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Region/Location</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Your regional location</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-2">
                        <input pInputText [ngModel]="formState().region" (ngModelChange)="updateField('region', $event)" placeholder="" class="w-full" />
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 w-full sm:w-auto">
                    <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="cancel()" styleClass="cursor-pointer !rounded-xl w-full sm:w-auto" />
                    <p-button label="Continue" severity="primary" (onClick)="next()" styleClass="cursor-pointer !rounded-xl w-full sm:w-auto" />
                </div>
            </div>
        </div>
    `
})
export class LocationInformation {
    countryOptions = ['United States', 'United Kingdom', 'Canada', 'Australia', 'Germany', 'France', 'Japan', 'China', 'India', 'Brazil'];

    constructor(
        private router: Router,
        private formStateService: FormStateService
    ) {}

    get formState() {
        return this.formStateService.formState;
    }

    updateField<K extends keyof ReturnType<typeof this.formState>>(field: K, value: ReturnType<typeof this.formState>[K]) {
        this.formStateService.updateField(field, value);
    }

    cancel() {
        this.router.navigate(['/profile/list']);
    }

    next() {
        this.router.navigate(['/profile/create/authorization']);
    }
}
