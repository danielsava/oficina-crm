import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { SelectButtonModule } from 'primeng/selectbutton';
import { SliderModule } from 'primeng/slider';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormStateService } from './form-state.service';

interface Department {
    name: string;
    code: string;
}

@Component({
    selector: 'app-business-information',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, MultiSelectModule, SelectButtonModule, SliderModule, ToggleSwitchModule],
    template: `
        <div class="flex-1 self-stretch xl:rounded-tr-3xl xl:rounded-br-3xl flex flex-col overflow-hidden">
            <div class="self-stretch px-4 sm:px-6 xl:pl-8 xl:pr-6 pt-6 pb-4 flex items-center gap-4">
                <div class="flex-1 text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">Business Information</div>
            </div>

            <div class="self-stretch px-4 sm:px-6 flex flex-col gap-[9.14px]">
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>
            </div>

            <div class="self-stretch p-4 sm:p-6 xl:p-8 flex flex-col items-end gap-6">
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Department Selection</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">The department you work in</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-2">
                        <p-multiselect [ngModel]="formState().department" (ngModelChange)="updateField('department', $event)" [options]="departmentOptions" optionLabel="name" placeholder="" styleClass="w-full" />
                    </div>
                </div>

                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Position/Role</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Your current job title</div>
                    </div>

                    <div class="flex-1 w-full">
                        <p-selectbutton [ngModel]="formState().position" (ngModelChange)="updateField('position', $event)" [options]="positionOptions" />
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- Employed -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Employed</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Your work status</div>
                    </div>

                    <div class="flex-1 w-full">
                        <p-toggleswitch [ngModel]="formState().employed" (ngModelChange)="updateField('employed', $event)" />
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- Hybrid Work -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Does the hybrid work?</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Whether hybrid work is available</div>
                    </div>

                    <div class="flex-1 w-full">
                        <p-toggleswitch [ngModel]="formState().hybridWork" (ngModelChange)="updateField('hybridWork', $event)" />
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- Office Location -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Office Location</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Office address or location</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-2">
                        <input pInputText [ngModel]="formState().officeLocation" (ngModelChange)="updateField('officeLocation', $event)" placeholder="" class="w-full" />
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- Salary Range -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Salary Range</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Your salary range</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-4">
                        <input pInputText [value]="getSalaryRangeDisplay()" [readonly]="true" class="w-full" />
                        <p-slider [ngModel]="formState().salaryRange" (ngModelChange)="updateField('salaryRange', $event)" [min]="0" [max]="50000" [step]="1000" [range]="true" styleClass="w-full" />
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
export class BusinessInformation {
    departmentOptions: Department[] = [
        { name: 'Sales', code: 'sales' },
        { name: 'HR', code: 'hr' },
        { name: 'Marketing', code: 'marketing' },
        { name: 'Engineering', code: 'engineering' },
        { name: 'Finance', code: 'finance' }
    ];

    positionOptions = ['Admin', 'Manager', 'Employee'];

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

    getSalaryRangeDisplay(): string {
        const range = this.formState().salaryRange;
        return `${range[0].toLocaleString()}-${range[1].toLocaleString()}`;
    }

    cancel() {
        this.router.navigate(['/profile/list']);
    }

    next() {
        this.router.navigate(['/profile/create/location-information']);
    }
}
