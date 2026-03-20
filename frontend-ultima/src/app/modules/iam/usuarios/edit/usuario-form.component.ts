import { Component, inject, OnInit } from '@angular/core';
import { CommonModule, Location } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { SelectModule } from 'primeng/select';
import { FileUploadModule } from 'primeng/fileupload';
import { UsuarioService } from '../usuario.service';

@Component({
    selector: 'app-usuario-form',
    standalone: true,
    imports: [CommonModule, ReactiveFormsModule, ButtonModule, InputTextModule, SelectModule, FileUploadModule],
    template: `
        <div class="card">
            <span class="text-surface-900 dark:text-surface-0 text-xl font-bold mb-6 block">
                {{ isEditMode ? 'Editar Usuário' : 'Novo Usuário' }}
            </span>
            <div class="grid grid-cols-12 gap-4">
                <div class="col-span-12 lg:col-span-2">
                    <div class="text-surface-900 dark:text-surface-0 font-medium text-xl mb-4">Perfil</div>
                    <p class="m-0 p-0 text-surface-600 dark:text-surface-200 leading-normal mr-4">
                        Preencha os dados básicos e o nível de acesso do usuário no sistema.
                    </p>
                </div>
                <div class="col-span-12 lg:col-span-10">
                    <form [formGroup]="userForm" (ngSubmit)="saveUser()" class="grid grid-cols-12 gap-4">
                        <div class="mb-6 col-span-12 space-y-2">
                            <label for="name" class="font-medium text-surface-900 dark:text-surface-0">Nome Completo</label>
                            <input pInputText id="name" type="text" formControlName="name" class="w-full" />
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
                        <div class="mb-6 col-span-12 md:col-span-6 space-y-2">
                            <label for="login" class="font-medium text-surface-900 dark:text-surface-0">Login</label>
                            <input pInputText id="login" type="text" formControlName="login" class="w-full" />
                        </div>
                        <div class="mb-6 col-span-12 md:col-span-6 space-y-2">
                            <label for="email" class="font-medium text-surface-900 dark:text-surface-0">E-mail</label>
                            <input pInputText id="email" type="email" formControlName="email" class="w-full" />
                        </div>
                        <div class="mb-6 col-span-12 md:col-span-6 space-y-2">
                            <label for="status" class="font-medium text-surface-900 dark:text-surface-0">Status</label>
                            <p-select id="status" formControlName="status" [options]="statuses" placeholder="Selecione" class="w-full" appendTo="body" />
                        </div>

                        <div class="col-span-12 flex justify-end gap-3 mt-4">
                            <p-button label="Cancelar" severity="secondary" [outlined]="true" (onClick)="cancel()" />
                            <p-button [label]="isEditMode ? 'Salvar Alterações' : 'Criar Usuário'" type="submit" [disabled]="userForm.invalid" />
                        </div>
                    </form>
                </div>
            </div>
        </div>
    `
})
export class UsuarioFormComponent implements OnInit {

    private fb = inject(FormBuilder);

    private usuarioService = inject(UsuarioService);

    private route = inject(ActivatedRoute);

    private router = inject(Router);

    private location = inject(Location);

    userForm!: FormGroup;
    isEditMode = false;
    currentId: number | null = null;

    statuses = ['Active', 'Deactive'];

    ngOnInit() {

        this.initForm();

        const idParam = this.route.snapshot.paramMap.get('id');

        if (idParam && idParam !== 'new') {
            this.isEditMode = true;
            this.currentId = Number(idParam);
            const user = this.usuarioService.getUserById(this.currentId);
            if (user) {
                this.userForm.patchValue(user);
            }
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

                this.usuarioService.updateUser({
                    ...this.userForm.value,
                    id: this.currentId
                });

            } else {

                this.usuarioService.addUser(this.userForm.value);

            }

            this.router.navigate(['/iam/usuarios/list']);

        }

    }

    cancel() {
        this.location.back();
    }

}
