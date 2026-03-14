import { Component, EventEmitter, Input, OnChanges, Output, SimpleChanges } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { SelectModule } from 'primeng/select';
import { DatePickerModule } from 'primeng/datepicker';
import { AutoCompleteModule, AutoCompleteCompleteEvent } from 'primeng/autocomplete';
import { DividerModule } from 'primeng/divider';

interface Member {
    name?: string;
    image: string;
}

interface Task {
    id: number | null;
    title: string;
    description: string | null;
    status: string;
    completed: boolean;
    startDate: string | null;
    endDate: string | null;
    members: Member[];
}

interface FormData {
    id: number | null;
    title: string;
    description: string;
    status: string;
    completed: boolean;
    startDate: Date | null;
    endDate: Date | null;
    members: Member[];
}

interface StatusOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-task-drawer',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, DrawerModule, InputTextModule, TextareaModule, SelectModule, DatePickerModule, AutoCompleteModule, DividerModule],
    template: `
        <p-drawer [(visible)]="visible" position="right" styleClass="w-full! md:w-[420px]!" (onHide)="onHide()" appendTo="body">
            <ng-template #header>
                <div class="flex items-center gap-3">
                    <i class="pi pi-list-check text-xl text-primary-500"></i>
                    <span class="text-surface-900 dark:text-surface-0 font-semibold text-lg">{{ drawerTitle }}</span>
                </div>
            </ng-template>

            <div class="flex flex-col gap-6 p-1">
                <div class="flex flex-col gap-2">
                    <label for="task-title" class="text-surface-900 dark:text-surface-0 font-medium text-sm">Task Title</label>
                    <input pInputText id="task-title" [(ngModel)]="formData.title" placeholder="Enter task title..." class="w-full" />
                </div>

                <div class="flex flex-col gap-2">
                    <label for="task-description" class="text-surface-900 dark:text-surface-0 font-medium text-sm">Description</label>
                    <textarea pTextarea id="task-description" [(ngModel)]="formData.description" placeholder="Enter task description..." [rows]="4" class="w-full"></textarea>
                </div>

                <div class="flex flex-col gap-2">
                    <label for="task-status" class="text-surface-900 dark:text-surface-0 font-medium text-sm">Status</label>
                    <p-select id="task-status" [(ngModel)]="formData.status" [options]="statusOptions" optionLabel="label" optionValue="value" placeholder="Select status" styleClass="w-full" />
                </div>

                <p-divider styleClass="my-2" />

                <div class="flex flex-col gap-2">
                    <label for="start-date" class="text-surface-900 dark:text-surface-0 font-medium text-sm">Start Date</label>
                    <p-datepicker id="start-date" [(ngModel)]="formData.startDate" dateFormat="dd.mm.yy" placeholder="Select start date" inputStyleClass="w-full" />
                </div>

                <div class="flex flex-col gap-2">
                    <label for="end-date" class="text-surface-900 dark:text-surface-0 font-medium text-sm">End Date</label>
                    <p-datepicker id="end-date" [(ngModel)]="formData.endDate" dateFormat="dd.mm.yy" placeholder="Select end date" inputStyleClass="w-full" />
                </div>

                <p-divider styleClass="my-2" />

                <div class="flex flex-col gap-2">
                    <label for="team-members" class="text-surface-900 dark:text-surface-0 font-medium text-sm">Team Members</label>
                    <p-autocomplete
                        id="team-members"
                        [(ngModel)]="formData.members"
                        [suggestions]="filteredMembers"
                        optionLabel="name"
                        [multiple]="true"
                        placeholder="Search team members..."
                        (completeMethod)="filterMembers($event)"
                        styleClass="w-full"
                    >
                        <ng-template #selecteditem let-value>
                            <div class="flex items-center gap-2 bg-surface-50 dark:bg-surface-900 px-2 py-1 rounded">
                                <img [src]="'/demo/images/avatar/' + value.image" [alt]="value.name" class="w-5 h-5 rounded-full border border-surface-200 dark:border-surface-700" />
                            </div>
                        </ng-template>
                        <ng-template #item let-option>
                            <div class="flex items-center gap-3">
                                <img [src]="'/demo/images/avatar/' + option.image" [alt]="option.name" class="w-8 h-8 rounded-full border border-surface-200 dark:border-surface-700" />
                                <span class="text-surface-900 dark:text-surface-0 font-medium">{{ option.name }}</span>
                            </div>
                        </ng-template>
                    </p-autocomplete>
                </div>
            </div>

            <ng-template #footer>
                <div class="flex justify-end gap-3 pt-4 border-t border-surface-200 dark:border-surface-700">
                    <p-button label="Cancel" icon="pi pi-times" [outlined]="true" severity="secondary" (onClick)="handleCancel()" styleClass="flex-1" />
                    <p-button [label]="mode === 'create' ? 'Create Task' : 'Update Task'" [icon]="mode === 'create' ? 'pi pi-plus' : 'pi pi-check'" (onClick)="handleSave()" styleClass="flex-1" />
                </div>
            </ng-template>
        </p-drawer>
    `
})
export class TaskDrawer implements OnChanges {
    @Input() visible = false;
    @Input() task: Task | null = null;
    @Input() mode: 'create' | 'edit' = 'create';
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() save = new EventEmitter<Task>();
    @Output() cancel = new EventEmitter<void>();

    formData: FormData = {
        id: null,
        title: '',
        description: '',
        status: 'pending',
        completed: false,
        startDate: null,
        endDate: null,
        members: []
    };

    statusOptions: StatusOption[] = [
        { label: 'Pending', value: 'pending' },
        { label: 'In Progress', value: 'in-progress' },
        { label: 'Completed', value: 'completed' }
    ];

    filteredMembers: Member[] = [];

    availableMembers: Member[] = [
        { name: 'Amy Elsner', image: 'amyelsner.png' },
        { name: 'Anna Fali', image: 'annafali.png' },
        { name: 'Asiya Javayant', image: 'asiyajavayant.png' },
        { name: 'Bernardo Dominic', image: 'bernardodominic.png' }
    ];

    get drawerTitle(): string {
        return this.mode === 'create' ? 'Create New Task' : 'Edit Task';
    }

    ngOnChanges(changes: SimpleChanges) {
        if (changes['task']) {
            const newTask = changes['task'].currentValue;
            if (newTask) {
                this.formData = {
                    id: newTask.id,
                    title: newTask.title || '',
                    description: newTask.description || '',
                    status: newTask.status || 'pending',
                    completed: newTask.completed || false,
                    startDate: newTask.startDate ? this.parseDate(newTask.startDate) : null,
                    endDate: newTask.endDate ? this.parseDate(newTask.endDate) : null,
                    members: newTask.members || []
                };
            } else {
                this.resetForm();
            }
        }
    }

    parseDate(dateStr: string): Date | null {
        if (!dateStr) return null;
        const parts = dateStr.split('.');
        if (parts.length === 3) {
            return new Date(parseInt(parts[2]), parseInt(parts[1]) - 1, parseInt(parts[0]));
        }
        return null;
    }

    resetForm() {
        this.formData = {
            id: null,
            title: '',
            description: '',
            status: 'pending',
            completed: false,
            startDate: null,
            endDate: null,
            members: []
        };
    }

    filterMembers(event: AutoCompleteCompleteEvent) {
        if (!event.query) {
            this.filteredMembers = this.availableMembers;
            return;
        }

        this.filteredMembers = this.availableMembers.filter((member) => member.name?.toLowerCase().includes(event.query.toLowerCase()));
    }

    formatDateForSave(date: Date | null): string | null {
        if (!date) return null;
        const d = new Date(date);
        return `${String(d.getDate()).padStart(2, '0')}.${String(d.getMonth() + 1).padStart(2, '0')}.${d.getFullYear()}`;
    }

    handleSave() {
        const taskData: Task = {
            id: this.formData.id,
            title: this.formData.title,
            description: this.formData.description || null,
            status: this.formData.status,
            completed: this.formData.status === 'completed',
            startDate: this.formatDateForSave(this.formData.startDate),
            endDate: this.formatDateForSave(this.formData.endDate),
            members: this.formData.members
        };

        this.save.emit(taskData);
        this.handleCancel();
    }

    handleCancel() {
        this.resetForm();
        this.cancel.emit();
        this.visible = false;
        this.visibleChange.emit(false);
    }

    onHide() {
        this.handleCancel();
    }
}
