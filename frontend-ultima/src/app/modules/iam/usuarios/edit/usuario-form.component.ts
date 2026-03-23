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
        <div class="flex flex-col xl:flex-row h-full card overflow-hidden !p-0">
            <!-- Menu Desktop -->
            <div class="hidden xl:flex w-80 bg-surface-0 dark:bg-surface-900 rounded-tl-3xl rounded-bl-3xl flex-col overflow-hidden border-r border-surface-200 dark:border-surface-700">
                <div class="px-6 py-5 border-b border-surface-200 dark:border-surface-700">
                    <h1 class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">{{ isEditMode ? 'Editar Usuário' : 'Novo Usuário' }}</h1>
                </div>

                <div class="p-6 flex flex-col gap-4">
                    <span class="text-surface-500 dark:text-surface-400 text-sm font-medium leading-tight">Navegação</span>
                    @for (item of menuItems; track item.id) {
                        <button (click)="scrollTo(item.id)" [class]="getMenuButtonClass(item.id)">
                            <i [class]="item.icon + ' text-base'"></i>
                            <span [class]="'flex-1 text-left text-base ' + (isActive(item.id) ? 'font-medium' : 'font-normal')">{{ item.label }}</span>
                        </button>
                    }
                </div>
            </div>

            <!-- Menu Mobile -->
            <div class="xl:hidden bg-surface-0 dark:bg-surface-900 border-b border-surface-200 dark:border-surface-700">
                <div class="px-4 py-3 border-b border-surface-200 dark:border-surface-700">
                    <h1 class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">{{ isEditMode ? 'Editar Usuário' : 'Novo Usuário' }}</h1>
                </div>

                <div class="overflow-x-auto">
                    <div class="flex gap-2 p-4 min-w-max">
                        @for (item of menuItems; track item.id) {
                            <button (click)="scrollTo(item.id)" [class]="getMobileMenuButtonClass(item.id)">
                                <i [class]="item.icon + ' text-sm'"></i>
                                <span [class]="'text-sm ' + (isActive(item.id) ? 'font-medium' : 'font-normal')">{{ item.label }}</span>
                            </button>
                        }
                    </div>
                </div>
            </div>

            <!-- Formulário / Área de Conteúdo -->
            <div class="flex-1 rounded-tr-3xl rounded-br-3xl bg-surface-0 dark:bg-surface-900 overflow-y-auto" style="max-height: 85vh;">
                <form [formGroup]="userForm" (ngSubmit)="saveUser()" class="flex flex-col pb-8">

                    <!-- SEÇÃO: PERFIL -->
                    <div id="perfil" class="section-container flex-1 self-stretch flex flex-col overflow-hidden">
                        <div class="self-stretch px-4 sm:px-6 xl:pl-8 xl:pr-6 pt-6 pb-4 flex items-center gap-4">
                            <div class="flex-1 text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">Informações de Perfil</div>
                        </div>

                        <div class="self-stretch px-4 sm:px-6 flex flex-col gap-[9.14px]">
                            <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>
                        </div>

                        <div class="self-stretch p-4 sm:p-6 xl:p-8 flex flex-col items-end gap-6">
                            <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                                <div class="w-full md:w-[283px] flex flex-col gap-2">
                                    <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Nome Completo</div>
                                    <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Seu nome e sobrenome</div>
                                </div>
                                <div class="flex-1 w-full flex flex-col gap-2">
                                    <input pInputText id="name" type="text" formControlName="name" class="w-full" />
                                </div>
                            </div>

                            <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                            <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                                <div class="w-full md:w-[283px] flex flex-col gap-2">
                                    <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Foto de Perfil</div>
                                    <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Carregue a imagem do avatar</div>
                                </div>
                                <div class="flex-1 w-full flex flex-col gap-2 items-start">
                                    <p-fileupload mode="basic" name="avatar" accept="image/*" [maxFileSize]="1000000" chooseLabel="Trocar Imagem" styleClass="w-unset text-surface-600! dark:text-surface-200! hover:text-primary! bg-surface-200/20! hover:bg-surface-200/30! dark:bg-surface-700/20! hover:dark-bg-surface-700/30! border border-surface-300! dark:border-surface-500! p-2!"></p-fileupload>
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SEÇÃO: CONTATO -->
                    <div id="contato" class="section-container flex-1 self-stretch flex flex-col overflow-hidden mt-2">
                        <div class="self-stretch px-4 sm:px-6 xl:pl-8 xl:pr-6 pt-6 pb-4 flex items-center gap-4">
                            <div class="flex-1 text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">Contato e Acesso</div>
                        </div>

                        <div class="self-stretch px-4 sm:px-6 flex flex-col gap-[9.14px]">
                            <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>
                        </div>

                        <div class="self-stretch p-4 sm:p-6 xl:p-8 flex flex-col items-end gap-6">
                            <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                                <div class="w-full md:w-[283px] flex flex-col gap-2">
                                    <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Login</div>
                                    <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Nome de usuário único</div>
                                </div>
                                <div class="flex-1 w-full flex flex-col gap-2">
                                    <input pInputText id="login" type="text" formControlName="login" class="w-full" />
                                </div>
                            </div>

                            <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                            <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                                <div class="w-full md:w-[283px] flex flex-col gap-2">
                                    <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">E-mail Corporativo</div>
                                    <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">E-mail para contatos</div>
                                </div>
                                <div class="flex-1 w-full flex flex-col gap-2">
                                    <input pInputText id="email" type="email" formControlName="email" class="w-full" />
                                </div>
                            </div>
                        </div>
                    </div>

                    <!-- SEÇÃO: STATUS DA CONTA -->
                    <div id="status" class="section-container flex-1 self-stretch flex flex-col overflow-hidden mt-2">
                        <div class="self-stretch px-4 sm:px-6 xl:pl-8 xl:pr-6 pt-6 pb-4 flex items-center gap-4">
                            <div class="flex-1 text-surface-950 dark:text-surface-0 text-xl font-medium leading-7">Situação da Conta</div>
                        </div>

                        <div class="self-stretch px-4 sm:px-6 flex flex-col gap-[9.14px]">
                            <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700"></div>
                        </div>

                        <div class="self-stretch p-4 sm:p-6 xl:p-8 flex flex-col items-end gap-6">
                            <div class="self-stretch flex flex-col md:flex-row items-start gap-4 md:gap-8">
                                <div class="w-full md:w-[283px] flex flex-col gap-2">
                                    <div class="self-stretch text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Ativação</div>
                                    <div class="self-stretch text-surface-500 dark:text-surface-400 text-base font-normal leading-normal">Define se o login está liberado</div>
                                </div>
                                <div class="flex-1 w-full flex flex-col gap-2 items-start">
                                    <p-select id="status" formControlName="status" [options]="statuses" placeholder="Selecione" class="w-full md:max-w-xs" appendTo="body" />
                                </div>
                            </div>

                            <div class="self-stretch h-0 border-t border-dashed border-surface-200 dark:border-surface-700 mt-4"></div>

                            <div class="flex flex-col sm:flex-row items-stretch sm:items-start justify-end gap-3 sm:gap-4 w-full sm:w-auto mt-4">
                                <p-button label="Cancelar" severity="secondary" [outlined]="true" (onClick)="cancel()" styleClass="cursor-pointer !rounded-xl w-full sm:w-auto" />
                                <p-button [label]="isEditMode ? 'Salvar Alterações' : 'Criar Usuário'" type="submit" [disabled]="userForm.invalid" styleClass="cursor-pointer !rounded-xl w-full sm:w-auto" />
                            </div>
                        </div>
                    </div>

                </form>
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

    // Scroll Spy & Menu properties
    menuItems = [
        { id: 'perfil', label: 'Perfil Básicos', icon: 'pi pi-user' },
        { id: 'contato', label: 'Contato e Acesso', icon: 'pi pi-envelope' },
        { id: 'status', label: 'Situação da Conta', icon: 'pi pi-shield' }
    ];

    activeSection = 'perfil';

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
                this.usuarioService.updateUser({
                    ...this.userForm.value,
                    id: this.currentId
                }).subscribe({
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

    // --- Métodos do Scroll Spy e Menu ---

    scrollTo(id: string) {
        this.activeSection = id;
        const el = document.getElementById(id);
        if (el) {
            el.scrollIntoView({ behavior: 'smooth', block: 'start' });
        }
    }

    isActive(id: string): boolean {
        return this.activeSection === id;
    }

    getMenuButtonClass(id: string): string {
        const baseClass = 'pl-3 pr-2 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer border-0 w-full text-left bg-transparent';
        if (this.isActive(id)) {
            return `${baseClass} bg-primary! text-surface-0! dark:text-surface-900 shadow-sm`;
        }
        return `${baseClass} text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700`;
    }

    getMobileMenuButtonClass(id: string): string {
        const baseClass = 'px-4 py-2 rounded-xl flex items-center gap-2 transition-colors cursor-pointer whitespace-nowrap border-0';
        if (this.isActive(id)) {
            return `${baseClass} bg-primary! text-surface-0! dark:text-surface-900 shadow-sm`;
        }
        return `${baseClass} bg-surface-100 dark:bg-surface-800 text-surface-500 dark:text-surface-400 hover:bg-surface-200 dark:hover:bg-surface-700`;
    }
}
