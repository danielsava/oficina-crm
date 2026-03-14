import { Component, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { InputGroupModule } from 'primeng/inputgroup';
import { InputGroupAddonModule } from 'primeng/inputgroupaddon';

interface Country {
    name: string;
    code: string;
}

@Component({
    selector: 'app-user-create',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, InputTextModule, TextareaModule, SelectModule, FileUploadModule, InputGroupModule, InputGroupAddonModule],
    template: `
        <div class="card">
            <span class="text-surface-900 dark:text-surface-0 text-xl font-bold mb-6 block">Create User</span>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 lg:col-span-2">
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl mb-4">Profile</div>
                    <p class="m-0 p-0 text-surface-600 dark:text-surface-200 leading-normal mr-4">Odio euismod lacinia at quis risus sed vulputate odio.</p>
                </div>
                <div class="col-span-12 lg:col-span-10">
                    <div class="grid grid-cols-12 gap-4">
                        <div class="mb-6 col-span-12 space-y-2">
                            <label for="nickname" class="font-medium text-surface-900 dark:text-surface-0">Nickname</label>
                            <input pInputText id="nickname" type="text" [(ngModel)]="nickname" class="w-full" />
                        </div>
                        <div class="mb-6 col-span-12 flex flex-col items-start space-y-2">
                            <label for="avatar" class="font-medium text-surface-900 dark:text-surface-0">Avatar</label>
                            <p-fileupload
                                mode="basic"
                                name="avatar"
                                accept="image/*"
                                [maxFileSize]="1000000"
                                chooseLabel="Upload Image"
                                styleClass="w-unset text-surface-600! dark:text-surface-200! hover:text-primary! bg-surface-200/20! hover:bg-surface-200/30! dark:bg-surface-700/20! hover:dark-bg-surface-700/30! border border-surface-300! dark:border-surface-500! p-2!"
                            />
                        </div>
                        <div class="mb-6 col-span-12 space-y-2">
                            <label for="bio" class="font-medium text-surface-900 dark:text-surface-0">Bio</label>
                            <textarea pTextarea id="bio" [(ngModel)]="bio" [rows]="5" [autoResize]="true" class="w-full"></textarea>
                        </div>
                        <div class="mb-6 col-span-12 md:col-span-6 space-y-2">
                            <label for="email" class="font-medium text-surface-900 dark:text-surface-0">Email</label>
                            <input pInputText id="email" type="text" [(ngModel)]="email" class="w-full" />
                        </div>
                        <div class="mb-6 col-span-12 md:col-span-6 space-y-2">
                            <label for="country" class="font-medium text-surface-900 dark:text-surface-0">Country</label>
                            <p-select [(ngModel)]="selectedCountry" [options]="countries" optionLabel="name" [filter]="true" placeholder="Select a Country" [showClear]="true" class="w-full">
                                <ng-template #selectedItem let-selected>
                                    @if (selected) {
                                        <div class="flex items-center">
                                            <span [class]="'mr-2 flag flag-' + selected.code.toLowerCase()" style="width: 18px; height: 12px"></span>
                                            <div>{{ selected.name }}</div>
                                        </div>
                                    }
                                </ng-template>
                                <ng-template #item let-country>
                                    <div class="flex items-center">
                                        <span [class]="'mr-2 flag flag-' + country.code.toLowerCase()" style="width: 18px; height: 12px"></span>
                                        <div>{{ country.name }}</div>
                                    </div>
                                </ng-template>
                            </p-select>
                        </div>
                        <div class="mb-6 col-span-12 md:col-span-6 space-y-2">
                            <label for="city" class="font-medium text-surface-900 dark:text-surface-0">City</label>
                            <input pInputText id="city" type="text" [(ngModel)]="city" class="w-full" />
                        </div>
                        <div class="mb-6 col-span-12 md:col-span-6 space-y-2">
                            <label for="state" class="font-medium text-surface-900 dark:text-surface-0">State</label>
                            <input pInputText id="state" type="text" [(ngModel)]="state" class="w-full" />
                        </div>
                        <div class="mb-6 col-span-12 space-y-2">
                            <label for="website" class="font-medium text-surface-900 dark:text-surface-0">Website</label>
                            <p-inputgroup>
                                <p-inputGroupAddon>www</p-inputGroupAddon>
                                <input pInputText id="website" type="text" [(ngModel)]="website" class="w-full" />
                            </p-inputgroup>
                        </div>
                        <div class="col-span-12">
                            <p-button label="Create User" class="w-auto mt-4" />
                        </div>
                    </div>
                </div>
            </div>
        </div>
    `
})
export class UserCreate {
    nickname = '';
    bio = '';
    email = '';
    city = '';
    state = '';
    website = '';
    selectedCountry: Country | null = null;

    countries: Country[] = [
        { name: 'Australia', code: 'AU' },
        { name: 'Brazil', code: 'BR' },
        { name: 'China', code: 'CN' },
        { name: 'Egypt', code: 'EG' },
        { name: 'France', code: 'FR' },
        { name: 'Germany', code: 'DE' },
        { name: 'India', code: 'IN' },
        { name: 'Japan', code: 'JP' },
        { name: 'Spain', code: 'ES' },
        { name: 'United States', code: 'US' }
    ];
}
