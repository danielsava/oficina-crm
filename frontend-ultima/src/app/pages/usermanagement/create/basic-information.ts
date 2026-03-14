import { Component, ElementRef, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { FormStateService } from './form-state.service';

@Component({
    selector: 'app-basic-information',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule],
    template: `
        <div class="flex-1 self-stretch xl:rounded-tr-3xl xl:rounded-br-3xl flex flex-col overflow-hidden">
            <div class="self-stretch px-4 sm:px-6 xl:pl-8 xl:pr-6 pt-6 pb-4 flex items-center gap-4">
                <div class="flex-1 text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">Basic Information</div>
            </div>

            <div class="self-stretch px-4 sm:px-6 flex flex-col gap-[9.14px]">
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>
            </div>

            <div class="self-stretch p-4 sm:p-6 xl:p-8 flex flex-col items-end gap-6">
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Profile Photo</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Upload your profile image</div>
                    </div>

                    <div class="w-full md:w-[296px] flex items-center gap-4">
                        <div class="w-[46px] h-[46px] bg-surface-0 dark:bg-surface-900 rounded-full border-[1.5px] border-surface-200 dark:border-surface-700 flex items-center justify-center overflow-hidden shrink-0">
                            @if (!formState().profilePhotoUrl) {
                                <i class="pi pi-user text-surface-500 dark:text-surface-400 text-sm"></i>
                            } @else {
                                <img [src]="formState().profilePhotoUrl" alt="Profile" class="w-full h-full object-cover" />
                            }
                        </div>

                        <div class="flex-1 flex flex-col justify-center gap-2">
                            <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Drop or select a cover image</div>
                            <button (click)="triggerFileUpload()" class="text-primary-600 dark:text-primary-400 text-sm font-medium underline leading-4 text-left cursor-pointer bg-transparent border-0 p-0">Upload Image</button>
                            <input #fileInput type="file" (change)="handleFileUpload($event)" accept="image/*" class="hidden" />
                        </div>
                    </div>
                </div>

                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Name and Surname</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Your full legal name and last name</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-2">
                        <input pInputText [ngModel]="formState().name" (ngModelChange)="updateField('name', $event)" placeholder="" class="w-full" />
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- Email Address -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Email Address</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Provide a valid email</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-2">
                        <input pInputText [ngModel]="formState().email" (ngModelChange)="updateField('email', $event)" type="email" placeholder="" class="w-full" />
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- Phone Number -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Phone Number</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Include country code</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-2">
                        <input pInputText [ngModel]="formState().phone" (ngModelChange)="updateField('phone', $event)" type="tel" placeholder="" class="w-full" />
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- Biography -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Biography</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Short personal description</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-2">
                        <textarea pTextarea [ngModel]="formState().biography" (ngModelChange)="updateField('biography', $event)" [rows]="5" placeholder="" class="w-full"></textarea>
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
export class BasicInformation {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

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

    triggerFileUpload() {
        this.fileInput.nativeElement.click();
    }

    handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            this.formStateService.updateField('profilePhoto', file);
            this.formStateService.updateField('profilePhotoUrl', URL.createObjectURL(file));
        }
    }

    cancel() {
        this.router.navigate(['/profile/list']);
    }

    next() {
        this.router.navigate(['/profile/create/business-information']);
    }
}
