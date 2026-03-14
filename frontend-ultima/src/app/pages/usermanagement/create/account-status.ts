import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { FormStateService } from './form-state.service';

@Component({
    selector: 'app-account-status',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule, TagModule, TextareaModule],
    template: `
        <div class="flex-1 self-stretch xl:rounded-tr-3xl xl:rounded-br-3xl flex flex-col overflow-hidden">
            <div class="self-stretch px-4 sm:px-6 xl:pl-8 xl:pr-6 pt-6 pb-4 flex items-center gap-4">
                <div class="flex-1 text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">Account Status</div>
            </div>

            <div class="self-stretch px-4 sm:px-6 flex flex-col gap-[9.14px]">
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>
            </div>

            <div class="self-stretch p-4 sm:p-6 xl:p-8 flex flex-col items-end gap-6">
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Account Status</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Current status of the user account</div>
                    </div>

                    <div class="flex-1 w-full">
                        <p-tag [value]="formState().status" severity="success" styleClass="!rounded-[6px]" />
                    </div>
                </div>

                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Send Invitation</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Send invitation email to the user</div>
                    </div>

                    <div class="flex-1 w-full flex items-center gap-2">
                        <p-checkbox [ngModel]="formState().sendInvitation" (ngModelChange)="updateField('sendInvitation', $event)" inputId="send-invitation" [binary]="true" />
                        <label for="send-invitation" class="text-surface-900 dark:text-surface-0 text-base font-normal">Should an invitation be sent by e-mail?</label>
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- User Notes -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">User Notes</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Additional notes or comments about the user</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-2">
                        <textarea pTextarea [ngModel]="formState().notes" (ngModelChange)="updateField('notes', $event)" [rows]="5" placeholder="" class="w-full"></textarea>
                    </div>
                </div>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-start gap-3 sm:gap-4 w-full sm:w-auto">
                    <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="cancel()" styleClass="cursor-pointer !rounded-xl w-full sm:w-auto" />
                    <p-button label="Save" severity="primary" (onClick)="save()" styleClass="cursor-pointer !rounded-xl w-full sm:w-20" />
                </div>
            </div>
        </div>
    `
})
export class AccountStatus {
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

    save() {
        this.router.navigate(['/profile/list']);
    }
}
