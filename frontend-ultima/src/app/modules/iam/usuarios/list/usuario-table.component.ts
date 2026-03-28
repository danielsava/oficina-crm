import { Component, computed, signal, ViewChild, inject, OnInit, ChangeDetectionStrategy } from '@angular/core';
import { CommonModule, NgOptimizedImage } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { Menu, MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { UsuarioService } from '../usuario.service';
import { Usuario } from '../usuario.model';

@Component({
    selector: 'app-usuario-table',
    changeDetection: ChangeDetectionStrategy.OnPush,
    imports: [CommonModule, NgOptimizedImage, FormsModule, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule, MenuModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    template: `
        <div class="flex flex-col bg-surface-0 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-5 border-b border-surface-200 dark:border-surface-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">Lista de Usuários</h1>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <p-iconfield class="w-full sm:w-[217px]">
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText [(ngModel)]="searchValue" (input)="onGlobalFilter(dt, $event)" placeholder="Pesquisar..." class="w-full! py-2!" />
                    </p-iconfield>

                    <p-button icon="pi pi-plus" label="Novo Usuário" severity="primary" [rounded]="true" class="w-full sm:w-auto cursor-pointer" (onClick)="addNewUser()" />
                </div>
            </div>

            <!-- Table -->
            <div class="flex-1 px-6 py-5">
                <p-table
                    #dt
                    [value]="usuarioService.users()"
                    [(selection)]="selectedUsers"
                    rowHover="true"
                    dataKey="id"
                    [paginator]="true"
                    [rows]="8"
                    [first]="first"
                    sortMode="multiple"
                    [tableStyle]="{ width: '100%' }"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                    currentPageReportTemplate="Mostrando {first} até {last} de {totalRecords} usuários"
                    [globalFilterFields]="['name', 'login', 'email', 'status']"
                    class="bg-surface-0 dark:bg-surface-800 overflow-hidden"
                    [pt]="{ pcPaginator: { root: { class: 'rounded-none!' } } }"
                >
                    <ng-template #header>
                        <tr>
                            <th style="width: 3rem">
                                <p-tableHeaderCheckbox />
                            </th>
                            <th pSortableColumn="name" class="flex-1">
                                <span class="flex items-center gap-2">Nome <p-sortIcon field="name" /></span>
                            </th>
                            <th pSortableColumn="login" class="flex-1">
                                <span class="flex items-center gap-2">Login <p-sortIcon field="login" /></span>
                            </th>
                            <th pSortableColumn="email" class="flex-1">
                                <span class="flex items-center gap-2">E-mail <p-sortIcon field="email" /></span>
                            </th>
                            <th pSortableColumn="status" class="flex-1">
                                <span class="flex items-center gap-2">Status <p-sortIcon field="status" /></span>
                            </th>
                            <th style="width: 6rem">Ações</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-user>
                        <tr>
                            <td style="width: 3rem">
                                <p-tableCheckbox [value]="user" />
                            </td>
                            <td>
                                <div class="flex items-center gap-2">
                                    <img [ngSrc]="user.avatar" alt="" width="32" height="32" class="rounded-full" />
                                    <span class="text-surface-950 dark:text-surface-0 text-sm font-medium leading-tight">{{ user.name }}</span>
                                </div>
                            </td>
                            <td>
                                <span class="text-surface-500 dark:text-surface-400 text-sm font-normal leading-tight">{{ user.login }}</span>
                            </td>
                            <td>
                                <span class="text-surface-500 dark:text-surface-400 text-sm font-normal leading-tight">{{ user.email }}</span>
                            </td>
                            <td>
                                <p-tag [value]="user.status === 'Active' ? 'Ativo' : 'Inativo'" [severity]="getStatusSeverity(user.status)" class="px-2 py-1 rounded-[6px]" />
                            </td>
                            <td>
                                <div class="flex items-center gap-1">
                                    <p-button (onClick)="toggleMenu($event, user.id)" [rounded]="true" [text]="true" icon="pi pi-ellipsis-h" size="small" severity="secondary" class="cursor-pointer" />
                                </div>
                            </td>
                        </tr>
                    </ng-template>
                </p-table>
                <p-menu #actionMenu [model]="menuItems()" [popup]="true" styleClass="w-48!" appendTo="body" />
            </div>

            <!-- Delete Confirmation Dialog -->
            <p-confirmdialog [style]="{ width: '450px' }" />
        </div>
    `
})
export class UsuarioTableComponent implements OnInit {

    @ViewChild('dt') dt!: Table;
    @ViewChild('actionMenu') actionMenu!: Menu;

    usuarioService = inject(UsuarioService);
    router = inject(Router);
    confirmationService = inject(ConfirmationService);

    selectedUsers: Usuario[] = [];
    searchValue = '';
    first = 0;
    selectedUserId = signal<number | null>(null);

    ngOnInit() {
        this.usuarioService.loadUsers();
    }

    menuItems = computed(() => {
        const userId = this.selectedUserId();
        if (!userId) return [];
        return [
            {
                label: 'Editar',
                icon: 'pi pi-pencil',
                command: () => this.editUser(userId)
            },
            {
                label: 'Excluir',
                icon: 'pi pi-trash',
                command: () => this.confirmDelete(userId)
            }
        ];
    });

    toggleMenu(event: Event, userId: number) {
        this.selectedUserId.set(userId);
        this.actionMenu.toggle(event);
    }

    onGlobalFilter(table: Table, event: Event) {
        table.filterGlobal((event.target as HTMLInputElement).value, 'contains');
    }

    getStatusSeverity(status: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        return status === 'Active' ? 'success' : 'danger';
    }

    editUser(userId: number) {
        this.router.navigate(['/iam/usuarios/edit', userId]);
    }

    addNewUser() {
        this.router.navigate(['/iam/usuarios/edit', 'new']);
    }

    confirmDelete(userId: number) {
        this.confirmationService.confirm({
            message: 'Tem certeza que deseja excluir este usuário?',
            header: 'Confirmar Exclusão',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancelar',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Excluir',
                severity: 'danger'
            },
            accept: () => {
                this.usuarioService.deleteUser(userId).subscribe({
                    next: () => this.usuarioService.loadUsers(),
                    error: (err) => console.error('Erro ao excluir usuário', err)
                });
            }
        });
    }
}
