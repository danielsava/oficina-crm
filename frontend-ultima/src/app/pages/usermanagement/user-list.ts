import { Component, computed, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { ConfirmationService } from 'primeng/api';
import { Table, TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { DialogModule } from 'primeng/dialog';
import { SelectModule } from 'primeng/select';
import { Menu, MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';

interface User {
    id: number;
    name: string;
    avatar: string;
    role: string;
    department: string;
    joinDate: string;
    authorizationLevel: string;
    status: string;
}

@Component({
    selector: 'app-user-list',
    standalone: true,
    imports: [CommonModule, FormsModule, TableModule, ButtonModule, InputTextModule, IconFieldModule, InputIconModule, TagModule, DialogModule, SelectModule, MenuModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    template: `
        <div class="flex flex-col bg-surface-0 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
            <!-- Header -->
            <div class="px-6 py-5 border-b border-surface-200 dark:border-surface-700 flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
                <h1 class="text-surface-950 dark:text-surface-0 text-lg font-medium leading-7">User List</h1>

                <div class="flex flex-col sm:flex-row items-stretch sm:items-center gap-3 w-full sm:w-auto">
                    <p-iconfield class="w-full sm:w-[217px]">
                        <p-inputicon styleClass="pi pi-search" />
                        <input pInputText [(ngModel)]="searchValue" (input)="onGlobalFilter(dt, $event)" placeholder="Search" class="w-full! py-2!" />
                    </p-iconfield>

                    <p-button icon="pi pi-plus" label="Add New" severity="primary" [rounded]="true" class="w-full sm:w-auto cursor-pointer" (onClick)="addNewUser()" />
                </div>
            </div>

            <!-- Table -->
            <div class="flex-1 px-6 py-5">
                <p-table
                    #dt
                    [value]="users()"
                    [(selection)]="selectedUsers"
                    [paginator]="true"
                    [rows]="rows"
                    [first]="first"
                    sortMode="multiple"
                    [tableStyle]="{ width: '100%' }"
                    paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                    currentPageReportTemplate="Shows {first} to {last} of {totalRecords} results"
                    [globalFilterFields]="['name', 'role', 'department', 'joinDate', 'authorizationLevel', 'status']"
                    class="bg-surface-0 dark:bg-surface-800 overflow-hidden"
                    [pt]="{ pcPaginator: { root: { class: 'rounded-none!' } } }"
                >
                    <ng-template #header>
                        <tr>
                            <th style="width: 3rem">
                                <p-tableHeaderCheckbox />
                            </th>
                            <th pSortableColumn="name" class="flex-1">
                                <span class="flex items-center gap-2">Name <p-sortIcon field="name" /></span>
                            </th>
                            <th pSortableColumn="role" class="flex-1">
                                <span class="flex items-center gap-2">Role / Position <p-sortIcon field="role" /></span>
                            </th>
                            <th pSortableColumn="department" class="flex-1">
                                <span class="flex items-center gap-2">Department <p-sortIcon field="department" /></span>
                            </th>
                            <th pSortableColumn="joinDate" class="flex-1">
                                <span class="flex items-center gap-2">Join Date <p-sortIcon field="joinDate" /></span>
                            </th>
                            <th pSortableColumn="authorizationLevel" class="flex-1">
                                <span class="flex items-center gap-2">Authorization Level <p-sortIcon field="authorizationLevel" /></span>
                            </th>
                            <th pSortableColumn="status" class="flex-1">
                                <span class="flex items-center gap-2">Employment Status <p-sortIcon field="status" /></span>
                            </th>
                            <th style="width: 6rem">Actions</th>
                        </tr>
                    </ng-template>
                    <ng-template #body let-user>
                        <tr>
                            <td style="width: 3rem">
                                <p-tableCheckbox [value]="user" />
                            </td>
                            <td>
                                <div class="flex items-center gap-2">
                                    <img [src]="user.avatar" alt="" class="w-8 h-8 rounded-full" />
                                    <span class="text-surface-950 dark:text-surface-0 text-sm font-medium leading-tight">{{ user.name }}</span>
                                </div>
                            </td>
                            <td>
                                <span class="text-surface-500 dark:text-surface-400 text-sm font-normal leading-tight">{{ user.role }}</span>
                            </td>
                            <td>
                                <span class="text-surface-500 dark:text-surface-400 text-sm font-normal leading-tight">{{ user.department }}</span>
                            </td>
                            <td>
                                <span class="text-surface-500 dark:text-surface-400 text-sm font-normal leading-tight">{{ user.joinDate }}</span>
                            </td>
                            <td>
                                <span class="text-surface-500 dark:text-surface-400 text-sm font-normal leading-tight">{{ user.authorizationLevel }}</span>
                            </td>
                            <td>
                                <p-tag [value]="user.status" [severity]="getStatusSeverity(user.status)" class="px-2 py-1 rounded-[6px]" />
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

            <!-- Edit User Dialog -->
            <p-dialog [(visible)]="editDialogVisible" [modal]="true" header="Edit User" [style]="{ width: '30rem' }" styleClass="p-fluid">
                <div class="flex flex-col gap-4 py-4">
                    <div class="flex flex-col gap-2">
                        <label for="name" class="text-surface-900 dark:text-surface-0 font-medium">Name</label>
                        <input pInputText id="name" [(ngModel)]="editForm.name" class="w-full" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="role" class="text-surface-900 dark:text-surface-0 font-medium">Role / Position</label>
                        <p-select id="role" [(ngModel)]="editForm.role" [options]="roleOptions" placeholder="Select a role" class="w-full" appendTo="body" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="department" class="text-surface-900 dark:text-surface-0 font-medium">Department</label>
                        <p-select id="department" [(ngModel)]="editForm.department" [options]="departmentOptions" placeholder="Select a department" class="w-full" appendTo="body" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="joinDate" class="text-surface-900 dark:text-surface-0 font-medium">Join Date</label>
                        <input pInputText id="joinDate" [(ngModel)]="editForm.joinDate" class="w-full" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="authorizationLevel" class="text-surface-900 dark:text-surface-0 font-medium">Authorization Level</label>
                        <p-select id="authorizationLevel" [(ngModel)]="editForm.authorizationLevel" [options]="authorizationLevelOptions" placeholder="Select authorization level" class="w-full" appendTo="body" />
                    </div>

                    <div class="flex flex-col gap-2">
                        <label for="status" class="text-surface-900 dark:text-surface-0 font-medium">Employment Status</label>
                        <p-select id="status" [(ngModel)]="editForm.status" [options]="statusOptions" placeholder="Select status" class="w-full" appendTo="body" />
                    </div>
                </div>

                <ng-template #footer>
                    <div class="flex justify-end gap-2">
                        <p-button label="Cancel" severity="secondary" [outlined]="true" (onClick)="closeEditDialog()" />
                        <p-button label="Save" (onClick)="saveUser()" />
                    </div>
                </ng-template>
            </p-dialog>

            <!-- Delete Confirmation Dialog -->
            <p-confirmdialog [style]="{ width: '450px' }" />
        </div>
    `
})
export class UserList {
    @ViewChild('dt') dt!: Table;
    @ViewChild('actionMenu') actionMenu!: Menu;

    users = signal<User[]>([
        {
            id: 1,
            name: 'Brook Simmons',
            avatar: '/demo/images/avatar/avatar-f-3.png',
            role: 'Admin',
            department: 'Sales',
            joinDate: 'Feb 5th, 2025',
            authorizationLevel: 'Full Access',
            status: 'Active'
        },
        {
            id: 2,
            name: 'Dianne Russell',
            avatar: '/demo/images/avatar/avatar-f-5.png',
            role: 'Manager',
            department: 'HR',
            joinDate: 'Feb 24th, 2025',
            authorizationLevel: 'Viewing Only',
            status: 'Deactive'
        },
        {
            id: 3,
            name: 'Amy Elsner',
            avatar: '/demo/images/avatar/amyelsner.png',
            role: 'Admin',
            department: 'Marketing',
            joinDate: 'Feb 24th, 2025',
            authorizationLevel: 'Restricted',
            status: 'Active'
        },
        {
            id: 4,
            name: 'Guy Hawkins',
            avatar: '/demo/images/avatar/avatar-m-2.png',
            role: 'Admin',
            department: 'Marketing',
            joinDate: 'Jan 28th, 2025',
            authorizationLevel: 'Restricted',
            status: 'Active'
        },
        {
            id: 5,
            name: 'Darrell Steward',
            avatar: '/demo/images/avatar/avatar-m-4.png',
            role: 'Employee',
            department: 'Sales',
            joinDate: 'Jan 21th, 2025',
            authorizationLevel: 'Viewing Only',
            status: 'Deactive'
        },
        {
            id: 6,
            name: 'Onyama Limba',
            avatar: '/demo/images/avatar/onyamalimba.png',
            role: 'Manager',
            department: 'HR',
            joinDate: 'Jan 21th, 2025',
            authorizationLevel: 'Full Access',
            status: 'Deactive'
        },
        {
            id: 7,
            name: 'Arlene McCoy',
            avatar: '/demo/images/avatar/avatar-f-7.png',
            role: 'Manager',
            department: 'HR',
            joinDate: 'Jan 21th, 2025',
            authorizationLevel: 'Full Access',
            status: 'Deactive'
        },
        {
            id: 8,
            name: 'Annette Black',
            avatar: '/demo/images/avatar/annafali.png',
            role: 'Employee',
            department: 'Marketing',
            joinDate: 'Jan 28th, 2025',
            authorizationLevel: 'Full Access',
            status: 'Active'
        }
    ]);

    selectedUsers: User[] = [];
    searchValue = '';
    first = 0;
    rows = 8;
    selectedUserId = signal<number | null>(null);

    menuItems = computed(() => {
        const userId = this.selectedUserId();
        if (!userId) return [];
        return [
            {
                label: 'Edit',
                icon: 'pi pi-pencil',
                command: () => this.openEditDialog(userId)
            },
            {
                label: 'Delete',
                icon: 'pi pi-trash',
                command: () => this.confirmDelete(userId)
            }
        ];
    });

    editDialogVisible = false;
    editingUser: User | null = null;
    editForm = {
        name: '',
        role: '',
        department: '',
        joinDate: '',
        authorizationLevel: '',
        status: ''
    };

    roleOptions = ['Admin', 'Manager', 'Employee'];
    departmentOptions = ['Sales', 'HR', 'Marketing'];
    authorizationLevelOptions = ['Full Access', 'Viewing Only', 'Restricted'];
    statusOptions = ['Active', 'Deactive'];

    constructor(
        private router: Router,
        private confirmationService: ConfirmationService
    ) {}

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

    openEditDialog(userId: number) {
        const user = this.users().find((u) => u.id === userId);
        if (user) {
            this.editingUser = user;
            this.editForm = {
                name: user.name,
                role: user.role,
                department: user.department,
                joinDate: user.joinDate,
                authorizationLevel: user.authorizationLevel,
                status: user.status
            };
            this.editDialogVisible = true;
        }
    }

    saveUser() {
        if (this.editingUser) {
            const users = this.users();
            const index = users.findIndex((u) => u.id === this.editingUser!.id);
            if (index !== -1) {
                users[index] = {
                    ...users[index],
                    name: this.editForm.name,
                    role: this.editForm.role,
                    department: this.editForm.department,
                    joinDate: this.editForm.joinDate,
                    authorizationLevel: this.editForm.authorizationLevel,
                    status: this.editForm.status
                };
                this.users.set([...users]);
            }
            this.editDialogVisible = false;
            this.editingUser = null;
        }
    }

    closeEditDialog() {
        this.editDialogVisible = false;
        this.editingUser = null;
    }

    addNewUser() {
        this.router.navigate(['/profile/create/basic-information']);
    }

    confirmDelete(userId: number) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this user?',
            header: 'Confirm Deletion',
            icon: 'pi pi-exclamation-triangle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Delete',
                severity: 'danger'
            },
            accept: () => {
                this.deleteUser(userId);
            }
        });
    }

    deleteUser(userId: number) {
        this.users.set(this.users().filter((u) => u.id !== userId));
    }
}
