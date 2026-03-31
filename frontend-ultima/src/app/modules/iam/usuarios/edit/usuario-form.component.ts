import { Component, inject, OnInit, ChangeDetectionStrategy, ElementRef, ViewChild } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { UsuarioService } from '../usuario.service';
import {Usuario} from "@/app/modules/iam/usuarios/usuario.model";
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
    selector: 'app-usuario-form',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, FileUploadModule, IconFieldModule, InputIconModule],
    template: `
        <div class="flex flex-col xl:flex-row h-full card overflow-hidden p-0!">

            <div class="px-6 py-5 dark:border-surface-700 flex items-center gap-4">
                <i class="pi pi-user-edit text-surface-950 dark:text-surface-0 text-xl"></i>
                <h1 class="text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">{{ isEditMode ? 'Editar Usuário' : 'Novo Usuário' }}</h1>
            </div>

        </div>

        <div [formGroup]="userForm" class="flex flex-col xl:flex-row h-full card overflow-hidden p-0!">
            <div class="flex-1 self-stretch xl:rounded-tr-3xl xl:rounded-br-3xl flex flex-col overflow-hidden">
                <div class="self-stretch p-4 sm:p-6 xl:p-8 flex flex-col items-end gap-6">
                    <!-- Avatar -->
                    <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                        <div class="w-full md:w-[283px] flex flex-col gap-2">
                            <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Avatar</div>
                            <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Upload sua foto do perfil</div>
                        </div>

                        <div class="w-full md:w-[296px] flex items-center gap-4">
                            <div class="w-[46px] h-[46px] bg-surface-0 dark:bg-surface-900 rounded-full border-[1.5px] border-surface-200 dark:border-surface-700 flex items-center justify-center overflow-hidden shrink-0">
                                @if (!form.avatar) {
                                    <i class="pi pi-user text-surface-500 dark:text-surface-400 text-sm"></i>
                                } @else {
                                    <img [src]="form.avatar" alt="Profile" class="w-full h-full object-cover" />
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

                    <!-- nome -->
                    <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                        <div class="w-full md:w-[283px] flex flex-col gap-2">
                            <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Nome</div>
                            <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Seu nome completo</div>
                        </div>

                        <div class="flex-1 w-full flex flex-col gap-2">
                            <p-iconfield iconPosition="left" class="w-full">
                                <p-inputicon class="pi pi-user" />
                                <input pInputText id="name" formControlName="name" type="text" placeholder="Nome completo" class="w-full" />
                            </p-iconfield>
                        </div>
                    </div>

                    <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                    <!-- login -->
                    <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                        <div class="w-full md:w-[283px] flex flex-col gap-2">
                            <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Login</div>
                            <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Seu usuário de login</div>
                        </div>

                        <div class="flex-1 w-full flex flex-col gap-2">
                            <p-iconfield iconPosition="left" class="w-full">
                                <p-inputicon class="pi pi-user" />
                                <input pInputText id="login" formControlName="login" type="text" placeholder="Login" class="w-full" />
                            </p-iconfield>
                        </div>
                    </div>

                    <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                    <!-- email -->
                    <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                        <div class="w-full md:w-[283px] flex flex-col gap-2">
                            <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Email</div>
                            <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Endereço de mail para contato</div>
                        </div>

                        <div class="flex-1 w-full flex flex-col gap-2">
                            <p-iconfield iconPosition="left" class="w-full">
                                <p-inputicon class="pi pi-envelope" />
                                <input pInputText id="email" formControlName="email" type="email" placeholder="E-mail" class="w-full" />
                            </p-iconfield>
                        </div>
                    </div>
                </div>
            </div>
        </div>

        <div class="flex flex-col xl:flex-row h-full card overflow-hidden p-0!">
            <div class="flex-1 self-stretch xl:rounded-tr-3xl xl:rounded-br-3xl flex flex-col overflow-hidden">
                <div class="self-stretch p-4 sm:p-6 xl:p-8 flex flex-col items-end gap-6 pt-5! pb-5!">
                    <div class="flex flex-col sm:flex-row items-stretch sm:items-start justify-end gap-3 sm:gap-4 w-full sm:w-auto">
                        <p-button label="Cancelar" icon="pi pi-times" severity="secondary" [outlined]="true" (onClick)="cancel()" styleClass="cursor-pointer !rounded-xl w-full sm:w-36" />
                        <p-button [label]="isEditMode ? 'Salvar' : 'Incluir'" [icon]="isEditMode ? 'pi pi-check' : 'pi pi-save'" (click)="saveUser()" [disabled]="userForm.invalid" styleClass="cursor-pointer !rounded-xl w-full sm:w-36" />
                    </div>
                </div>
            </div>
        </div>
    `
})
export class UsuarioFormComponent implements OnInit {

    @ViewChild('fileInput')
    fileInput!: ElementRef<HTMLInputElement>;

    private fb = inject(FormBuilder);

    private usuarioService = inject(UsuarioService);

    private route = inject(ActivatedRoute);

    private router = inject(Router);

    private location = inject(Location);

    userForm!: FormGroup;

    isEditMode = false;

    currentId: number | null = null;

    ngOnInit() {
        this.initForm();
        const idParam = this.route.snapshot.paramMap.get('id');
        if (idParam && idParam !== 'new') {
            this.isEditMode = true;
            this.currentId = Number(idParam);
            this.usuarioService.getUserById(this.currentId).subscribe({
                next: (user) => {
                    if (user) {
                        this.userForm.patchValue(user);
                    }
                },
                error: (err) => console.error('Erro ao buscar usuário', err)
            });
        }
    }

    private initForm() {
        this.userForm = this.fb.group({
            name: ['', Validators.required],
            login: ['', Validators.required],
            email: ['', [Validators.required, Validators.email]],
            avatar: ['/demo/images/avatar/avatar-f-1.png'],
            status: ['Active', Validators.required]
        });
    }

    saveUser() {
        if (this.userForm.valid) {
            if (this.isEditMode && this.currentId) {
                this.usuarioService
                    .updateUser({
                        ...this.userForm.value,
                        id: this.currentId
                    })
                    .subscribe({
                        next: () => this.router.navigate(['/iam/usuarios/list']),
                        error: (err) => console.error('Erro ao editar usuário', err)
                    });
            } else {
                this.usuarioService.addUser(this.userForm.value).subscribe({
                    next: () => this.router.navigate(['/iam/usuarios/list']),
                    error: (err) => console.error('Erro ao criar usuário', err)
                });
            }
        }
    }

    cancel() {
        this.location.back();
    }

    triggerFileUpload() {
        this.fileInput.nativeElement.click();
    }

    handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;

        const file = input.files?.[0];

        if (file) this.userForm.patchValue({ avatar: URL.createObjectURL(file) });
    }

    get form(): Usuario {
        return this.userForm.value;
    }

    // FormGroup
    // this.userForm.get(campo)?.value
    // this.userForm.patchValue({ avatar: file.name });

    // --- Métodos do Scroll Spy e Menu ---

    scrollTo(id: string) {
        const el = document.getElementById(id);

        if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
    }
}
