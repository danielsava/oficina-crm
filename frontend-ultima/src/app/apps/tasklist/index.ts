import { Component, computed, model, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { TagModule } from 'primeng/tag';
import { DividerModule } from 'primeng/divider';
import { AvatarModule } from 'primeng/avatar';
import { AvatarGroupModule } from 'primeng/avatargroup';
import { AccordionModule } from 'primeng/accordion';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService } from 'primeng/api';
import { TaskDrawer } from './task-drawer';

interface Member {
    name?: string;
    image: string;
}

interface Task {
    id: number;
    title: string;
    description: string | null;
    status: string;
    completed: boolean;
    startDate: string | null;
    endDate: string | null;
    members: Member[];
}

@Component({
    selector: 'app-tasklist',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, CheckboxModule, InputTextModule, IconFieldModule, InputIconModule, TagModule, DividerModule, AvatarModule, AvatarGroupModule, AccordionModule, ConfirmDialogModule, TaskDrawer],
    providers: [ConfirmationService],
    template: `
        <div class="flex flex-col lg:flex-row h-full bg-surface-0 dark:bg-surface-900 card">
            <!-- Mobile Header -->
            <div class="lg:hidden flex flex-col gap-4 p-4 border-b border-surface-200 dark:border-surface-700">
                <div class="flex items-center justify-between">
                    <h1 class="text-surface-900 dark:text-surface-0 text-lg font-semibold">Tasks</h1>
                    <p-button icon="pi pi-plus" label="New Task" severity="secondary" [outlined]="true" size="small" (onClick)="openNewTaskDrawer()" />
                </div>

                <div class="flex gap-2 overflow-x-auto">
                    @for (filter of filterOptions; track filter.key) {
                        <button
                            (click)="activeFilter.set(filter.key)"
                            class="px-4 py-2 rounded-lg flex items-center gap-2 whitespace-nowrap transition-colors cursor-pointer shrink-0"
                            [ngClass]="activeFilter() === filter.key ? 'bg-primary text-surface-0 dark:text-surface-900 shadow-sm' : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'"
                        >
                            <i [class]="filter.icon + ' text-sm'"></i>
                            <span class="text-sm font-medium">{{ filter.label }}</span>
                            @if (taskCounts()[filter.countKey] > 0) {
                                <div class="px-2 py-1 rounded-sm text-sm font-semibold text-xs" [ngClass]="activeFilter() === filter.key ? 'bg-white text-primary-600' : 'bg-surface-200 dark:bg-surface-600 text-surface-900 dark:text-surface-100'">
                                    {{ taskCounts()[filter.countKey] }}
                                </div>
                            }
                        </button>
                    }
                </div>
            </div>

            <!-- Desktop Sidebar -->
            <div class="hidden lg:flex w-[237px] bg-surface-0 dark:bg-surface-900 border-r border-surface-200 dark:border-surface-700 flex-col overflow-hidden">
                <div class="p-6 flex flex-col gap-5">
                    <p-button icon="pi pi-plus" label="New Task" severity="secondary" [outlined]="true" styleClass="w-full cursor-pointer" (onClick)="openNewTaskDrawer()" />

                    <p-divider styleClass="my-1!" />

                    <div class="flex flex-col gap-3">
                        <div class="text-surface-500 text-sm font-medium">Task</div>

                        @for (filter of filterOptions; track filter.key) {
                            <button
                                (click)="activeFilter.set(filter.key)"
                                class="w-full px-4 py-2 rounded-lg flex items-center gap-3 transition-colors cursor-pointer"
                                [ngClass]="activeFilter() === filter.key ? 'bg-primary text-surface-0 dark:text-surface-900 shadow-sm' : 'text-surface-500 dark:text-surface-400 hover:bg-surface-100 dark:hover:bg-surface-700'"
                            >
                                <i [class]="filter.icon + ' text-base'"></i>
                                <span class="flex-1 text-left text-base font-medium">{{ filter.fullLabel }}</span>
                                @if (taskCounts()[filter.countKey] > 0) {
                                    <div class="px-2 py-1 rounded-sm text-sm font-semibold text-xs" [ngClass]="activeFilter() === filter.key ? 'bg-white text-primary-600' : 'bg-surface-200 dark:bg-surface-600 text-surface-900 dark:text-surface-100'">
                                        {{ taskCounts()[filter.countKey] }}
                                    </div>
                                }
                            </button>
                        }
                    </div>
                </div>
            </div>

            <!-- Main Content -->
            <div class="flex-1 flex flex-col overflow-hidden">
                <!-- Desktop Search -->
                <div class="hidden lg:flex p-6 border-b border-surface-200 dark:border-surface-700 items-center gap-4 px-8">
                    <div class="flex-1">
                        <p-iconfield>
                            <p-inputicon class="pi pi-search" />
                            <input pInputText [(ngModel)]="searchQuery" placeholder="Search" class="w-full" />
                        </p-iconfield>
                    </div>
                </div>

                <!-- Mobile Search -->
                <div class="lg:hidden p-4 border-b border-surface-200 dark:border-surface-700">
                    <p-iconfield>
                        <p-inputicon class="pi pi-search" />
                        <input pInputText [(ngModel)]="searchQuery" placeholder="Search tasks..." class="w-full" />
                    </p-iconfield>
                </div>

                <!-- Tasks List -->
                <div class="flex-1">
                    <p-accordion
                        [value]="openPanels"
                        [multiple]="true"
                        styleClass="w-full"
                        [pt]="{
                            root: { class: 'border-none!' }
                        }"
                    >
                        <!-- Pending Tasks -->
                        @if (pendingTasks().length > 0) {
                            <p-accordionpanel value="0" [pt]="{ root: { class: 'border-none!' } }">
                                <p-accordionheader>
                                    <div class="flex items-center gap-4 px-4 lg:px-6">
                                        <h2 class="text-surface-900 dark:text-surface-0 text-lg font-semibold">{{ pendingTasks().length }} Tasks Pending</h2>
                                    </div>
                                </p-accordionheader>
                                <p-accordioncontent [pt]="{'root': { class: 'overflow-hidden' } }">
                                    <div class="flex flex-col">
                                        @for (task of pendingTasks(); track task.id; let i = $index; let last = $last) {
                                            <ng-container *ngTemplateOutlet="taskItem; context: { task: task, isLast: last }"></ng-container>
                                        }
                                    </div>
                                </p-accordioncontent>
                            </p-accordionpanel>
                        }

                        <!-- In Progress Tasks -->
                        @if (inProgressTasks().length > 0) {
                            <p-accordionpanel value="1" [pt]="{ root: { class: 'border-none!' } }">
                                <p-accordionheader>
                                    <div class="flex items-center gap-4 px-4 lg:px-6">
                                        <h2 class="text-surface-900 dark:text-surface-0 text-lg font-semibold">{{ inProgressTasks().length }} Tasks In Progress</h2>
                                    </div>
                                </p-accordionheader>
                                <p-accordioncontent [pt]="{'root': { class: 'overflow-hidden' } }">
                                    <div class="flex flex-col">
                                        @for (task of inProgressTasks(); track task.id; let i = $index; let last = $last) {
                                            <ng-container *ngTemplateOutlet="taskItem; context: { task: task, isLast: last }"></ng-container>
                                        }
                                    </div>
                                </p-accordioncontent>
                            </p-accordionpanel>
                        }

                        <!-- Completed Tasks -->
                        @if (completedTasks().length > 0) {
                            <p-accordionpanel value="2" [pt]="{ root: { class: 'border-none!' } }">
                                <p-accordionheader>
                                    <div class="flex items-center gap-4 px-4 lg:px-6">
                                        <h2 class="text-surface-900 dark:text-surface-0 text-lg font-semibold">{{ completedTasks().length }} Tasks Completed</h2>
                                    </div>
                                </p-accordionheader>
                                <p-accordioncontent [pt]="{'root': { class: 'overflow-hidden' } }">
                                    <div class="flex flex-col">
                                        @for (task of completedTasks(); track task.id; let i = $index; let last = $last) {
                                            <ng-container *ngTemplateOutlet="taskItemCompleted; context: { task: task, isLast: last }"></ng-container>
                                        }
                                    </div>
                                </p-accordioncontent>
                            </p-accordionpanel>
                        }
                    </p-accordion>

                    <!-- Add New Task Button -->
                    <div class="px-4 lg:px-14 py-3 flex items-center gap-3 cursor-pointer hover:bg-surface-50 dark:hover:bg-surface-800 transition-colors" (click)="openNewTaskDrawer()">
                        <i class="pi pi-plus text-xs text-surface-500"></i>
                        <span class="text-surface-500 text-base font-medium">Add New Task</span>
                    </div>
                </div>
            </div>

            <p-confirmdialog />

            <app-task-drawer [(visible)]="isDrawerVisible" [task]="selectedTask" [mode]="drawerMode" (save)="handleDrawerSave($event)" (cancel)="handleDrawerCancel()" />
        </div>

        <!-- Task Item Template -->
        <ng-template #taskItem let-task="task" let-isLast="isLast">
            <div class="flex flex-col">
                <div class="px-4 lg:px-8 pt-4 pb-2">
                    <div class="flex items-center gap-3">
                        <p-checkbox [(ngModel)]="task.completed" [binary]="true" [inputId]="'task-' + task.id" (onChange)="toggleTaskCompletion(task, task.completed)" />
                        <div class="text-base font-medium leading-normal transition-all duration-300 flex-1" [ngClass]="task.completed ? 'text-surface-500 line-through' : 'text-surface-900 dark:text-surface-0'">
                            {{ task.title }}
                        </div>
                    </div>
                    @if (task.description) {
                        <div class="text-surface-500 text-sm leading-tight line-clamp-3 pl-8 pt-1">
                            {{ task.description }}
                        </div>
                    }
                </div>

                <div class="pl-8 lg:pl-16 pr-4 lg:pr-14 pt-2 pb-4 flex flex-col lg:flex-row lg:items-center gap-3">
                    <!-- Desktop View -->
                    <div class="hidden lg:flex items-center gap-2 flex-1">
                        @if (task.startDate || task.endDate) {
                            @if (task.startDate) {
                                <div class="flex items-center gap-2">
                                    <span class="text-surface-500 text-base">Start</span>
                                    <p-tag [value]="task.startDate" severity="secondary" />
                                </div>
                            }

                            @if (task.startDate && task.endDate) {
                                <div class="w-px h-2.5 bg-surface-200 dark:bg-surface-700"></div>
                            }

                            @if (task.endDate) {
                                <div class="flex items-center gap-2">
                                    <span class="text-surface-500 text-base">End</span>
                                    <p-tag [value]="task.endDate" severity="secondary" />
                                </div>
                            }

                            @if (task.members?.length > 0) {
                                <div class="w-px h-2.5 bg-surface-200 dark:bg-surface-700"></div>
                            }
                        }

                        <div class="flex-1 flex items-start">
                            @if (task.members?.length > 0) {
                                <p-avatargroup>
                                    @for (member of task.members.slice(0, 5); track member.image) {
                                        <p-avatar [image]="'/demo/images/avatar/' + member.image" shape="circle" styleClass="border border-surface-0 dark:border-surface-900 w-6 h-6" />
                                    }
                                    @if (task.members.length > 5) {
                                        <p-avatar [label]="'+' + (task.members.length - 5)" shape="circle" styleClass="bg-primary-500 text-surface-0 border border-surface-0 dark:border-surface-900 w-6 h-6" />
                                    }
                                </p-avatargroup>
                            }
                        </div>
                    </div>

                    <!-- Mobile View -->
                    <div class="flex lg:hidden items-center justify-between">
                        <div class="flex items-center gap-2 flex-wrap">
                            @if (task.startDate) {
                                <div class="flex items-center gap-1">
                                    <i class="pi pi-calendar text-xs text-surface-500"></i>
                                    <p-tag [value]="task.startDate" severity="secondary" size="small" />
                                </div>
                            }

                            @if (task.startDate && task.endDate) {
                                <div class="text-surface-500 text-sm">-</div>
                            }

                            @if (task.endDate) {
                                <div class="flex items-center gap-1">
                                    <p-tag [value]="task.endDate" severity="secondary" size="small" />
                                </div>
                            }

                            @if ((task.startDate || task.endDate) && task.members?.length > 0) {
                                <div class="w-px h-3 bg-surface-200 dark:bg-surface-700"></div>
                            }

                            @if (task.members?.length > 0) {
                                <p-avatargroup>
                                    @for (member of task.members.slice(0, 3); track member.image) {
                                        <p-avatar [image]="'/demo/images/avatar/' + member.image" shape="circle" styleClass="border border-surface-0 dark:border-surface-900 w-6 h-6" />
                                    }
                                    @if (task.members.length > 3) {
                                        <p-avatar [label]="'+' + (task.members.length - 3)" shape="circle" styleClass="bg-primary-500 text-surface-0 border border-surface-0 dark:border-surface-900 w-6 h-6" />
                                    }
                                </p-avatargroup>
                            }
                        </div>
                    </div>

                    <div class="flex items-center gap-2 lg:ml-auto">
                        <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" styleClass="cursor-pointer" (onClick)="openEditTaskDrawer(task)" />
                        <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="secondary" styleClass="cursor-pointer" (onClick)="deleteTask(task.id)" />
                    </div>
                </div>

                @if (!isLast) {
                    <div class="px-4 lg:px-14 py-2">
                        <div class="border-t border-dashed border-surface-200 dark:border-surface-700"></div>
                    </div>
                }
            </div>
        </ng-template>

        <!-- Completed Task Item Template -->
        <ng-template #taskItemCompleted let-task="task" let-isLast="isLast">
            <div class="flex flex-col">
                <div class="px-4 lg:px-8 pt-4 pb-2">
                    <div class="flex items-center gap-3">
                        <p-checkbox [(ngModel)]="task.completed" [binary]="true" [inputId]="'task-' + task.id" (onChange)="toggleTaskCompletion(task, task.completed)" />
                        <div class="text-surface-500 text-base font-medium leading-normal line-through flex-1">
                            {{ task.title }}
                        </div>
                    </div>
                    @if (task.description) {
                        <div class="text-surface-500 text-sm leading-tight line-clamp-3 pl-8 pt-1">
                            {{ task.description }}
                        </div>
                    }
                </div>

                <div class="pl-8 lg:pl-16 pr-4 lg:pr-14 pt-2 pb-4 flex flex-col lg:flex-row lg:items-center gap-3">
                    <!-- Desktop View -->
                    <div class="hidden lg:flex items-center gap-2 flex-1">
                        @if (task.startDate || task.endDate) {
                            @if (task.startDate) {
                                <div class="flex items-center gap-2">
                                    <span class="text-surface-500 text-base">Start</span>
                                    <p-tag [value]="task.startDate" severity="secondary" />
                                </div>
                            }

                            @if (task.startDate && task.endDate) {
                                <div class="w-px h-2.5 bg-surface-200 dark:bg-surface-700"></div>
                            }

                            @if (task.endDate) {
                                <div class="flex items-center gap-2">
                                    <span class="text-surface-500 text-base">End</span>
                                    <p-tag [value]="task.endDate" severity="secondary" />
                                </div>
                            }

                            @if (task.members?.length > 0) {
                                <div class="w-px h-2.5 bg-surface-200 dark:bg-surface-700"></div>
                            }
                        }

                        <div class="flex-1 flex items-start">
                            @if (task.members?.length > 0) {
                                <p-avatargroup>
                                    @for (member of task.members.slice(0, 5); track member.image) {
                                        <p-avatar [image]="'/demo/images/avatar/' + member.image" shape="circle" styleClass="border border-surface-0 dark:border-surface-900 w-6 h-6" />
                                    }
                                    @if (task.members.length > 5) {
                                        <p-avatar [label]="'+' + (task.members.length - 5)" shape="circle" styleClass="bg-primary-500 text-surface-0 border border-surface-0 dark:border-surface-900 w-6 h-6" />
                                    }
                                </p-avatargroup>
                            }
                        </div>
                    </div>

                    <!-- Mobile View -->
                    <div class="flex lg:hidden items-center justify-between">
                        <div class="flex items-center gap-2 flex-wrap">
                            @if (task.startDate) {
                                <div class="flex items-center gap-1">
                                    <i class="pi pi-calendar text-xs text-surface-500"></i>
                                    <p-tag [value]="task.startDate" severity="secondary" size="small" />
                                </div>
                            }

                            @if (task.startDate && task.endDate) {
                                <div class="text-surface-500 text-sm">-</div>
                            }

                            @if (task.endDate) {
                                <div class="flex items-center gap-1">
                                    <p-tag [value]="task.endDate" severity="secondary" size="small" />
                                </div>
                            }

                            @if ((task.startDate || task.endDate) && task.members?.length > 0) {
                                <div class="w-px h-3 bg-surface-200 dark:bg-surface-700"></div>
                            }

                            @if (task.members?.length > 0) {
                                <p-avatargroup>
                                    @for (member of task.members.slice(0, 3); track member.image) {
                                        <p-avatar [image]="'/demo/images/avatar/' + member.image" shape="circle" styleClass="border border-surface-0 dark:border-surface-900 w-6 h-6" />
                                    }
                                    @if (task.members.length > 3) {
                                        <p-avatar [label]="'+' + (task.members.length - 3)" shape="circle" styleClass="bg-primary-500 text-surface-0 border border-surface-0 dark:border-surface-900 w-6 h-6" />
                                    }
                                </p-avatargroup>
                            }
                        </div>
                    </div>

                    <div class="flex items-center gap-2 lg:ml-auto">
                        <p-button icon="pi pi-pencil" [text]="true" [rounded]="true" size="small" severity="secondary" styleClass="cursor-pointer" (onClick)="openEditTaskDrawer(task)" />
                        <p-button icon="pi pi-trash" [text]="true" [rounded]="true" size="small" severity="secondary" styleClass="cursor-pointer" (onClick)="deleteTask(task.id)" />
                    </div>
                </div>

                @if (!isLast) {
                    <div class="px-4 lg:px-14 py-2">
                        <div class="border-t border-dashed border-surface-200 dark:border-surface-700"></div>
                    </div>
                }
            </div>
        </ng-template>
    `
})
export class TaskList {
    activeFilter = signal<string>('All Tasks');
    searchQuery = model<string>('');
    openPanels = ['0', '1', '2'];
    isDrawerVisible = false;
    selectedTask: Task | null = null;
    drawerMode: 'create' | 'edit' = 'create';

    filterOptions = [
        { key: 'All Tasks', label: 'All', fullLabel: 'All Tasks', icon: 'pi pi-list', countKey: 'all' as const },
        { key: 'Pending', label: 'Pending', fullLabel: 'Pending', icon: 'pi pi-inbox', countKey: 'inbox' as const },
        { key: 'In Progress', label: 'In Progress', fullLabel: 'In Progress', icon: 'pi pi-clock', countKey: 'inProgress' as const },
        { key: 'Completed', label: 'Completed', fullLabel: 'Completed', icon: 'pi pi-check-circle', countKey: 'completed' as const }
    ];

    taskData = signal<Task[]>([
        { id: 1, title: 'Design a SaaS Platform UI', description: null, status: 'pending', completed: false, startDate: '12.01.2025', endDate: '24.01.2025', members: [{ image: 'amyelsner.png' }, { image: 'annafali.png' }] },
        { id: 2, title: 'Create an E-Commerce Landing Page', description: null, status: 'pending', completed: false, startDate: '02.01.2025', endDate: '28.01.2025', members: [{ image: 'amyelsner.png' }, { image: 'annafali.png' }] },
        {
            id: 3,
            title: 'Build an Educational Website UI',
            description: 'A clean, professional and fast information access interface will be designed for an education-oriented website.',
            status: 'pending',
            completed: false,
            startDate: '02.02.2025',
            endDate: '06.02.2025',
            members: [{ image: 'amyelsner.png' }, { image: 'annafali.png' }, { image: 'asiyajavayant.png' }, { image: 'bernardodominic.png' }]
        },
        { id: 4, title: 'Develop a Tech Startup Landing Page', description: null, status: 'pending', completed: false, startDate: '12.02.2025', endDate: '27.02.2025', members: [{ image: 'amyelsner.png' }, { image: 'annafali.png' }] },
        { id: 5, title: 'Design a Healthcare Landing Page', description: null, status: 'pending', completed: false, startDate: '09.02.2025', endDate: '17.02.2025', members: [{ image: 'amyelsner.png' }, { image: 'annafali.png' }] },
        { id: 6, title: 'Create a Finance Dashboard UI', description: null, status: 'in-progress', completed: false, startDate: '15.02.2025', endDate: '28.03.2025', members: [{ image: 'amyelsner.png' }, { image: 'annafali.png' }] },
        { id: 7, title: 'Design a Fashion Landing Page', description: null, status: 'in-progress', completed: false, startDate: '12.02.2025', endDate: '19.02.2025', members: [{ image: 'amyelsner.png' }, { image: 'annafali.png' }] },
        {
            id: 8,
            title: 'Develop a Gaming Platform UI',
            description: null,
            status: 'completed',
            completed: true,
            startDate: '02.02.2025',
            endDate: '06.02.2025',
            members: [{ image: 'amyelsner.png' }, { image: 'annafali.png' }, { image: 'asiyajavayant.png' }, { image: 'bernardodominic.png' }]
        },
        { id: 9, title: 'Create a Corporate Website Landing Page', description: null, status: 'completed', completed: true, startDate: '12.02.2025', endDate: '27.02.2025', members: [{ image: 'amyelsner.png' }, { image: 'annafali.png' }] },
        { id: 10, title: 'Design a Personal Blog Landing Page', description: null, status: 'completed', completed: true, startDate: '12.01.2025', endDate: '24.01.2025', members: [{ image: 'amyelsner.png' }, { image: 'annafali.png' }] }
    ]);

    filteredTasks = computed(() => {
        let tasks = this.taskData();

        if (this.searchQuery().trim()) {
            tasks = tasks.filter((task) => task.title.toLowerCase().includes(this.searchQuery().toLowerCase()));
        }

        switch (this.activeFilter()) {
            case 'Pending':
                return tasks.filter((task) => task.status === 'pending');
            case 'In Progress':
                return tasks.filter((task) => task.status === 'in-progress');
            case 'Completed':
                return tasks.filter((task) => task.status === 'completed');
            default:
                return tasks;
        }
    });

    taskCounts = computed(() => ({
        all: this.taskData().length,
        inbox: this.taskData().filter((task) => task.status === 'pending').length,
        inProgress: this.taskData().filter((task) => task.status === 'in-progress').length,
        completed: this.taskData().filter((task) => task.status === 'completed').length
    }));

    pendingTasks = computed(() => this.filteredTasks().filter((task) => task.status === 'pending'));
    inProgressTasks = computed(() => this.filteredTasks().filter((task) => task.status === 'in-progress'));
    completedTasks = computed(() => this.filteredTasks().filter((task) => task.status === 'completed'));

    constructor(private confirmationService: ConfirmationService) {}

    toggleTaskCompletion(task: Task, completed: boolean) {
        setTimeout(() => {
            const tasks = this.taskData();
            const taskIndex = tasks.findIndex((t) => t.id === task.id);
            if (taskIndex !== -1) {
                const updatedTask = { ...tasks[taskIndex], status: completed ? 'completed' : 'pending', completed };
                const remainingTasks = tasks.filter((t) => t.id !== task.id);
                this.taskData.set([updatedTask, ...remainingTasks]);
            }
        }, 400);
    }

    deleteTask(taskId: number) {
        this.confirmationService.confirm({
            message: 'Are you sure you want to delete this task?',
            header: 'Delete Confirmation',
            icon: 'pi pi-info-circle',
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
                const tasks = this.taskData().filter((task) => task.id !== taskId);
                this.taskData.set(tasks);
            }
        });
    }

    openNewTaskDrawer() {
        this.selectedTask = null;
        this.drawerMode = 'create';
        this.isDrawerVisible = true;
    }

    openEditTaskDrawer(task: Task) {
        this.selectedTask = task;
        this.drawerMode = 'edit';
        this.isDrawerVisible = true;
    }

    handleDrawerSave(newTaskData: any) {
        if (this.drawerMode === 'create') {
            const tasks = this.taskData();
            const newId = Math.max(...tasks.map((t) => t.id), 0) + 1;
            const newTask: Task = {
                id: newId,
                title: newTaskData.title || '',
                description: newTaskData.description || null,
                status: newTaskData.status || 'pending',
                completed: newTaskData.completed || false,
                startDate: newTaskData.startDate || null,
                endDate: newTaskData.endDate || null,
                members: newTaskData.members || []
            };
            this.taskData.set([newTask, ...tasks]);
        } else {
            const tasks = this.taskData();
            const taskIndex = tasks.findIndex((t) => t.id === newTaskData.id);
            if (taskIndex !== -1) {
                tasks[taskIndex] = {
                    ...tasks[taskIndex],
                    ...newTaskData,
                    id: tasks[taskIndex].id
                };
                this.taskData.set([...tasks]);
            }
        }
        this.isDrawerVisible = false;
    }

    handleDrawerCancel() {
        this.isDrawerVisible = false;
        this.selectedTask = null;
    }
}
