import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { RadioButtonModule } from 'primeng/radiobutton';
import { ToggleSwitchModule } from 'primeng/toggleswitch';
import { FormStateService } from './form-state.service';

@Component({
    selector: 'app-authorization',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule, RadioButtonModule, ToggleSwitchModule],
    template: `
        <div class="flex-1 self-stretch xl:rounded-tr-3xl xl:rounded-br-3xl flex flex-col overflow-hidden">
            <div class="self-stretch px-4 sm:px-6 xl:pl-8 xl:pr-6 pt-6 pb-4 flex items-center gap-4">
                <div class="flex-1 text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">Authorization and Access</div>
            </div>

            <div class="self-stretch px-4 sm:px-6 flex flex-col gap-2">
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>
            </div>

            <div class="self-stretch p-4 sm:p-6 xl:p-8 flex flex-col items-end gap-6">
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Authorization Level</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Select user's access permission level</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col sm:flex-row items-start gap-4">
                        <div class="flex items-center gap-2">
                            <p-radiobutton [ngModel]="formState().authorizationLevel" (ngModelChange)="updateField('authorizationLevel', $event)" inputId="full-access" value="Full Access" />
                            <label for="full-access" class="text-surface-900 dark:text-surface-0 text-base font-normal">Full Access</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <p-radiobutton [ngModel]="formState().authorizationLevel" (ngModelChange)="updateField('authorizationLevel', $event)" inputId="restricted-access" value="Restricted Access" />
                            <label for="restricted-access" class="text-surface-900 dark:text-surface-0 text-base font-normal">Restricted Access</label>
                        </div>
                        <div class="flex items-center gap-2">
                            <p-radiobutton [ngModel]="formState().authorizationLevel" (ngModelChange)="updateField('authorizationLevel', $event)" inputId="viewing-only" value="Viewing Only" />
                            <label for="viewing-only" class="text-surface-900 dark:text-surface-0 text-base font-normal">Viewing Only</label>
                        </div>
                    </div>
                </div>

                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Authorizations</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Select specific permissions and capabilities</div>
                    </div>

                    <div class="flex-1 w-full flex flex-col gap-4">
                        @for (option of authorizationOptions; track option) {
                            <div class="flex items-center gap-2">
                                <p-checkbox [ngModel]="formState().authorizations" (ngModelChange)="updateField('authorizations', $event)" [inputId]="option" [value]="option" />
                                <label [for]="option" class="text-surface-900 dark:text-surface-0 text-base font-normal">{{ option }}</label>
                            </div>
                        }
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- User Management -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">User Management</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Enable or disable user management access</div>
                    </div>

                    <div class="flex-1 w-full">
                        <p-toggleswitch [ngModel]="formState().userManagement" (ngModelChange)="updateField('userManagement', $event)" />
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- Sales Management -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Sales Management</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Enable or disable sales management access</div>
                    </div>

                    <div class="flex-1 w-full">
                        <p-toggleswitch [ngModel]="formState().salesManagement" (ngModelChange)="updateField('salesManagement', $event)" />
                    </div>
                </div>

                <!-- Divider -->
                <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                <!-- Finance Display -->
                <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                    <div class="w-full md:w-[283px] flex flex-col gap-2">
                        <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Finance Display</div>
                        <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Enable or disable finance information visibility</div>
                    </div>

                    <div class="flex-1 w-full">
                        <p-toggleswitch [ngModel]="formState().financeDisplay" (ngModelChange)="updateField('financeDisplay', $event)" />
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
export class Authorization {
    authorizationOptions = ['Download Reports', 'Export Data', 'Edit Users', 'Access Custom Reports', 'Use API'];

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
        this.router.navigate(['/profile/create/account-status']);
    }
}
