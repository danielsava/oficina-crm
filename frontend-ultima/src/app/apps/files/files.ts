import { Component, computed, ElementRef, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { TableModule } from 'primeng/table';
import { DrawerModule } from 'primeng/drawer';
import { InputTextModule } from 'primeng/inputtext';
import { Menu, MenuModule } from 'primeng/menu';
import { TagModule } from 'primeng/tag';
import { TextareaModule } from 'primeng/textarea';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem } from 'primeng/api';

interface ActivityFeed {
    id: number;
    fileName: string;
    icon: string;
    description: string;
    author: string;
    time: string;
    dotColor: string;
    ringColor: string;
}

interface StorageData {
    id: number;
    type: string;
    count: number;
    color: string;
    shadowColor: string;
    flexValue: number;
}

interface PinnedItem {
    id: number;
    name: string;
    type: string;
    size: string;
    icon: string;
}

interface Comment {
    id: number;
    author: string;
    content: string;
    time: string;
}

interface Document {
    id: number;
    fileName: string;
    type: string;
    fileSize: string;
    size: string;
    uploadDate: string;
    editDate: string;
    owner: string;
    icon: string;
    comments: Comment[];
}

@Component({
    selector: 'app-files',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, TableModule, DrawerModule, InputTextModule, MenuModule, TagModule, TextareaModule, ConfirmDialogModule],
    providers: [ConfirmationService],
    template: `
        <div class="flex flex-col gap-6 card">
            <div class="flex flex-col gap-4 lg:flex-row lg:justify-between lg:items-center">
                <div class="text-surface-900 dark:text-surface-0 text-2xl! font-medium leading-loose">Overview</div>

                <div class="flex flex-col gap-3 sm:flex-row sm:items-center sm:gap-4">
                    <p-button icon="pi pi-plus" label="Add New" severity="primary" [rounded]="true" styleClass="w-full sm:w-auto cursor-pointer" (onClick)="addDocument()" />
                </div>
            </div>

            <div class="flex flex-col gap-8">
                <div class="flex flex-col lg:grid lg:grid-cols-12 gap-6">
                    <div class="lg:col-span-6 xl:col-span-4 bg-surface-0 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
                        <div class="px-6 pt-4 pb-4">
                            <h3 class="text-surface-900 dark:text-surface-0 text-xl font-medium leading-7">Activity Feed</h3>
                        </div>

                        <div class="relative max-h-[350px] lg:max-h-[450px] 2xl:max-h-[330px]">
                            <div class="absolute top-0 left-0 right-0 h-4 bg-linear-to-b from-surface-0 dark:from-surface-900 to-transparent pointer-events-none z-20"></div>
                            <div class="absolute bottom-0 left-0 right-0 h-6 bg-linear-to-t from-surface-0 dark:from-surface-900 to-transparent pointer-events-none z-20"></div>

                            <div class="pb-6 pt-3 px-4 max-h-[350px] lg:max-h-[450px] 2xl:max-h-[330px] overflow-y-auto">
                                <div class="relative">
                                    <div class="absolute left-[10px] top-0 bottom-0 w-px bg-surface-200 dark:bg-surface-700"></div>

                                    <div class="flex flex-col gap-4">
                                        @for (activity of activityFeed; track activity.id; let i = $index; let last = $last) {
                                            <div class="flex gap-3">
                                                <div class="flex items-start pt-2.5 w-6 justify-center">
                                                    <div class="w-2 h-2 rounded-full ring-2 ring-offset-2 ring-offset-surface-0 dark:ring-offset-surface-800 relative z-10" [ngClass]="[activity.dotColor, activity.ringColor]"></div>
                                                </div>

                                                <div class="flex-1 pb-4" [class.border-b]="!last" [class.border-surface-200]="!last" [class.dark:border-surface-700]="!last">
                                                    <div class="flex flex-col gap-2">
                                                        <div class="flex flex-col gap-1">
                                                            <div class="flex items-center justify-between">
                                                                <div class="flex items-center gap-1">
                                                                    <i class="pi text-sm text-surface-500" [ngClass]="activity.icon"></i>
                                                                    <span class="text-surface-950 dark:text-surface-0 text-base font-medium leading-normal">{{ activity.fileName }}</span>
                                                                </div>
                                                                <div>
                                                                    <p-button [rounded]="true" [text]="true" icon="pi pi-ellipsis-h" size="small" severity="secondary" styleClass="cursor-pointer" (onClick)="activityMenu.toggle($event)" />
                                                                    <p-menu #activityMenu [model]="feedMenuItems" [popup]="true" styleClass="w-48!" appendTo="body" />
                                                                </div>
                                                            </div>
                                                            <p class="text-surface-600 dark:text-surface-400 text-sm leading-tight">{{ activity.description }}</p>
                                                        </div>
                                                        <div class="flex items-center gap-2">
                                                            <span class="text-surface-500 text-sm leading-tight">{{ activity.time }}</span>
                                                            <div class="w-0 h-[6px] border-l border-surface-200 dark:border-surface-700"></div>
                                                            <span class="text-surface-500 text-sm leading-tight">{{ activity.author }}</span>
                                                        </div>
                                                    </div>
                                                </div>
                                            </div>
                                        }
                                    </div>
                                </div>
                            </div>
                        </div>
                    </div>

                    <div class="lg:col-span-6 xl:col-span-8 flex flex-col gap-6">
                        <div class="p-5 bg-surface-0 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700 flex flex-col gap-[18px] overflow-hidden">
                            <div class="flex justify-between items-center h-8">
                                <h3 class="text-surface-900 dark:text-surface-0 text-xl font-medium leading-7">Storage</h3>
                                <div class="flex items-center gap-1">
                                    <span class="text-surface-950 dark:text-surface-0 text-xl font-semibold leading-tight">{{ totalFiles().toLocaleString() }}</span>
                                    <span class="text-surface-500 text-sm leading-none">Total Files</span>
                                </div>
                            </div>

                            <div class="hidden md:flex items-end gap-1 w-full">
                                @for (storage of storageData; track storage.id) {
                                    <div class="flex flex-col gap-2" [style.flex]="storage.flexValue">
                                        <div class="h-4 rounded-lg" [ngClass]="storage.color" [style.box-shadow]="'0px 5px 10px 0px ' + storage.shadowColor"></div>
                                        <div class="flex flex-col gap-1">
                                            <span class="text-surface-900 dark:text-surface-0 text-sm md:text-base xl:text-lg font-medium leading-tight md:leading-normal xl:leading-7">{{ storage.count.toLocaleString() }}</span>
                                            <div class="flex items-center gap-1">
                                                <div class="w-2 h-2 rounded-sm" [ngClass]="storage.color" [style.box-shadow]="'0px 5px 10px 0px ' + storage.shadowColor"></div>
                                                <span class="text-surface-500 text-xs md:text-sm leading-tight">{{ storage.type }}</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>

                            <div class="flex flex-col gap-3 md:hidden">
                                @for (storage of storageData; track storage.id) {
                                    <div class="flex items-center justify-between">
                                        <div class="flex items-center gap-3">
                                            <div class="w-3 h-3 rounded-sm" [ngClass]="storage.color" [style.box-shadow]="'0px 5px 10px 0px ' + storage.shadowColor"></div>
                                            <span class="text-surface-500 text-sm leading-tight">{{ storage.type }}</span>
                                        </div>
                                        <span class="text-surface-900 dark:text-surface-0 text-lg font-medium leading-7">{{ storage.count.toLocaleString() }}</span>
                                    </div>
                                }
                            </div>
                        </div>

                        <div class="p-5 bg-surface-0 dark:bg-surface-900 rounded-2xl border border-surface-200 dark:border-surface-700">
                            <h3 class="text-surface-900 dark:text-surface-0 text-xl font-medium mb-4">Pinned</h3>

                            <div class="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 2xl:grid-cols-6 gap-3">
                                @for (pinned of pinnedItems; track pinned.id) {
                                    <div class="p-3 rounded-xl border border-surface-200 dark:border-surface-700 flex flex-col gap-4">
                                        <div class="flex justify-between items-start">
                                            <i class="pi text-2xl! text-surface-400" [ngClass]="pinned.icon"></i>
                                            <div>
                                                <p-button [rounded]="true" [text]="true" icon="pi pi-ellipsis-v" size="small" severity="secondary" styleClass="cursor-pointer" (onClick)="pinnedMenu.toggle($event)" />
                                                <p-menu #pinnedMenu [model]="pinnedMenuItems" [popup]="true" styleClass="w-48!" appendTo="body" />
                                            </div>
                                        </div>
                                        <div class="flex flex-col gap-1">
                                            <span class="text-surface-900 dark:text-surface-0 text-base font-medium">{{ pinned.name }}</span>
                                            <div class="flex xl:items-center gap-1 xl:flex-row flex-col">
                                                <span class="text-surface-500 text-sm">{{ pinned.type }}</span>
                                                <div class="w-1 h-1 bg-surface-300 rounded-full hidden xl:block"></div>
                                                <span class="text-surface-500 text-sm">{{ pinned.size }}</span>
                                            </div>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>

                <div class="flex flex-col gap-6">
                    <h2 class="text-surface-950 dark:text-surface-0 text-2xl font-medium leading-loose">Documents</h2>

                    <div class="flex flex-wrap gap-4">
                        @for (filter of filterOptions; track filter) {
                            <button
                                (click)="activeFilter.set(filter)"
                                class="px-[18px] py-[9px] rounded-xl text-base font-medium border transition-colors whitespace-nowrap cursor-pointer"
                                [ngClass]="{
                                    'bg-primary-50 dark:bg-primary-900/20 border-primary-200 dark:border-primary-800 text-primary-950 dark:text-primary-100 shadow-sm': activeFilter() === filter,
                                    'border-surface-200 dark:border-surface-700 text-surface-950 dark:text-surface-0 hover:bg-surface-50 dark:hover:bg-surface-700': activeFilter() !== filter
                                }"
                            >
                                {{ filter }}
                            </button>
                        }
                    </div>

                    <p-table
                        [value]="filteredDocuments()"
                        [paginator]="true"
                        [rows]="rows"
                        sortMode="multiple"
                        styleClass="bg-surface-0 dark:bg-surface-800 rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden [&>[data-pc-section=paginatorcontainer]]:border-0! [&_[data-pc-name=pcpaginator]]:rounded-none!"
                        tableStyleClass="w-full"
                        paginatorTemplate="FirstPageLink PrevPageLink PageLinks NextPageLink LastPageLink CurrentPageReport"
                        currentPageReportTemplate="Shows {first} to {last} of {totalRecords} results"
                    >
                        <ng-template #header>
                            <tr>
                                <th pSortableColumn="fileName" class="w-40">File Name <p-sortIcon field="fileName" /></th>
                                <th pSortableColumn="type" class="w-32">Type <p-sortIcon field="type" /></th>
                                <th pSortableColumn="fileSize" class="w-42">File Size <p-sortIcon field="fileSize" /></th>
                                <th class="w-24">Size</th>
                                <th pSortableColumn="uploadDate" class="flex-1">Upload Date <p-sortIcon field="uploadDate" /></th>
                                <th pSortableColumn="editDate" class="flex-1">Edit Date <p-sortIcon field="editDate" /></th>
                                <th pSortableColumn="owner" class="flex-1">Owner <p-sortIcon field="owner" /></th>
                                <th class="w-24">Actions</th>
                            </tr>
                        </ng-template>
                        <ng-template #body let-doc>
                            <tr>
                                <td>
                                    <div class="flex items-center gap-3 py-2">
                                        <i class="pi text-xl text-surface-400" [ngClass]="doc.icon"></i>
                                        <span class="text-surface-500 text-sm whitespace-nowrap">{{ doc.fileName }}</span>
                                    </div>
                                </td>
                                <td>
                                    <p-tag [value]="doc.type" [severity]="getTagSeverity(doc.type)" styleClass="px-2 py-1" />
                                </td>
                                <td>
                                    <span class="text-surface-500 text-sm whitespace-nowrap">{{ doc.fileSize }}</span>
                                </td>
                                <td>
                                    <span class="text-surface-500 text-sm whitespace-nowrap">{{ doc.size }}</span>
                                </td>
                                <td>
                                    <span class="text-surface-500 text-sm whitespace-nowrap">{{ doc.uploadDate }}</span>
                                </td>
                                <td>
                                    <span class="text-surface-500 text-sm whitespace-nowrap">{{ doc.editDate }}</span>
                                </td>
                                <td>
                                    <span class="text-surface-500 text-sm whitespace-nowrap">{{ doc.owner }}</span>
                                </td>
                                <td>
                                    <div class="flex items-center gap-1">
                                        <p-button icon="pi pi-download" [rounded]="true" [text]="true" size="small" severity="secondary" styleClass="cursor-pointer" />
                                        <p-button icon="pi pi-ellipsis-h" [rounded]="true" [text]="true" size="small" severity="secondary" styleClass="cursor-pointer" (onClick)="onTableMenuToggle($event, doc, tableMenu)" />
                                        <p-menu #tableMenu [model]="tableMenuItems" [popup]="true" styleClass="w-48!" appendTo="body" />
                                    </div>
                                </td>
                            </tr>
                        </ng-template>
                    </p-table>
                </div>
            </div>

            <p-drawer [(visible)]="showEditDrawer" position="right" styleClass="w-full! max-w-[417px]!" appendTo="body">
                <ng-template #header>
                    <h3 class="text-surface-900 dark:text-surface-0 text-2xl font-medium">{{ isAddMode ? 'Add' : 'Edit' }}</h3>
                </ng-template>

                <div class="flex flex-col h-full">
                    <div class="flex-1 flex flex-col gap-6 overflow-y-auto">
                        <div class="relative min-h-[180px] h-[180px] rounded-2xl bg-surface-100 dark:bg-surface-800 border border-surface-200 dark:border-surface-700">
                            <div class="w-full h-full flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors rounded-2xl" (click)="triggerFileUpload()">
                                <div class="flex items-center justify-center">
                                    <div class="w-12 h-12 rounded-full bg-surface-200 dark:bg-surface-600 flex items-center justify-center">
                                        <i class="pi text-surface-600 dark:text-surface-300 text-2xl" [ngClass]="editForm.type ? getIconByType(editForm.type) : 'pi-upload'"></i>
                                    </div>
                                </div>
                                <div class="text-center">
                                    <div class="text-surface-900 dark:text-surface-0 text-base font-medium mb-1">
                                        {{ editForm.fileName || 'Click to upload file' }}
                                    </div>
                                    <div class="text-surface-500 dark:text-surface-400 text-sm">
                                        {{ editForm.type ? editForm.type + ' - ' + (editForm.fileSize || '') : 'Select a file to upload' }}
                                    </div>
                                </div>
                            </div>
                            @if (editForm.fileName && editForm.type) {
                                <p-button icon="pi pi-times" [text]="true" [rounded]="true" size="small" styleClass="absolute! z-40! top-4 right-4 cursor-pointer" severity="secondary" (onClick)="removeUploadedFile(); $event.stopPropagation()" />
                            }
                            <input #fileInput type="file" (change)="handleFileUpload($event)" class="hidden" />
                        </div>

                        <div class="flex flex-col gap-6">
                            <div class="flex flex-col gap-2">
                                <label class="text-surface-950 dark:text-surface-0 text-base font-medium">Name</label>
                                <input pInputText [(ngModel)]="editForm.fileName" class="w-full" />
                            </div>

                            <div class="flex flex-col gap-2">
                                <label class="text-surface-950 dark:text-surface-0 text-base font-medium">Owner</label>
                                <input pInputText [(ngModel)]="editForm.owner" class="w-full" />
                            </div>

                            @if (!isAddMode || editForm.fileName) {
                                <div class="bg-surface-50 dark:bg-surface-800 rounded-xl p-4 border border-surface-200 dark:border-surface-700">
                                    <div class="grid grid-cols-2 gap-4">
                                        <div class="flex flex-col gap-1 min-h-[44px]">
                                            <label class="text-surface-500 text-xs font-medium uppercase tracking-wide">Type</label>
                                            @if (editForm.type) {
                                                <p-tag [value]="editForm.type" [severity]="getTagSeverity(editForm.type)" styleClass="px-2 py-1 text-xs w-fit" />
                                            } @else {
                                                <span class="text-surface-700 dark:text-surface-300 text-sm font-medium">&nbsp;</span>
                                            }
                                        </div>

                                        <div class="flex flex-col gap-1 min-h-[44px]">
                                            <label class="text-surface-500 text-xs font-medium uppercase tracking-wide">File Size</label>
                                            <span class="text-surface-700 dark:text-surface-300 text-sm font-medium">{{ editForm.fileSize || '&nbsp;' }}</span>
                                        </div>

                                        <div class="flex flex-col gap-1 min-h-[44px]">
                                            <label class="text-surface-500 text-xs font-medium uppercase tracking-wide">Dimensions</label>
                                            <span class="text-surface-700 dark:text-surface-300 text-sm font-medium">{{ editForm.size || '&nbsp;' }}</span>
                                        </div>

                                        <div class="flex flex-col gap-1 min-h-[44px]">
                                            <label class="text-surface-500 text-xs font-medium uppercase tracking-wide">Uploaded</label>
                                            <span class="text-surface-700 dark:text-surface-300 text-sm font-medium">{{ editForm.uploadDate || '&nbsp;' }}</span>
                                        </div>
                                    </div>

                                    <div class="flex flex-col gap-1 mt-3 pt-3 border-t border-surface-200 dark:border-surface-700 min-h-[44px]">
                                        <label class="text-surface-500 text-xs font-medium uppercase tracking-wide">Last Modified</label>
                                        <span class="text-surface-700 dark:text-surface-300 text-sm font-medium">{{ editForm.editDate || '&nbsp;' }}</span>
                                    </div>
                                </div>
                            }
                        </div>

                        @if (!isAddMode && editingItem && editingItem.comments) {
                            <div class="border-t border-surface-200 dark:border-surface-700 pt-6">
                                <h4 class="text-surface-950 dark:text-surface-0 text-base font-medium mb-4">Comments</h4>
                                <div class="flex flex-col gap-4">
                                    @for (comment of editingItem!.comments; track comment.id) {
                                        <div class="pb-4 border-b border-surface-200 dark:border-surface-700 last:border-b-0">
                                            <div class="flex justify-between items-start mb-2">
                                                <span class="text-surface-950 dark:text-surface-0 text-base font-medium">{{ comment.author }}</span>
                                                <p-button icon="pi pi-ellipsis-h" [text]="true" size="small" severity="secondary" styleClass="cursor-pointer" (onClick)="commentMenu.toggle($event)" />
                                                <p-menu #commentMenu [model]="createCommentMenuItems(comment.id)" [popup]="true" styleClass="w-48!" />
                                            </div>
                                            <p class="text-surface-600 dark:text-surface-400 text-sm mb-2">{{ comment.content }}</p>
                                            <span class="text-surface-500 text-sm">{{ comment.time }}</span>
                                        </div>
                                    }
                                </div>
                            </div>
                        }

                        @if (!isAddMode) {
                            <div class="border-t border-surface-200 dark:border-surface-700 pt-6">
                                <h4 class="text-surface-950 dark:text-surface-0 text-base font-medium mb-3">Add Comment</h4>
                                <div class="flex flex-col gap-3">
                                    <textarea pTextarea [(ngModel)]="newComment" [rows]="4" class="w-full" placeholder="Write your comment here..."></textarea>
                                    <p-button label="Post Comment" severity="secondary" [outlined]="true" styleClass="w-full cursor-pointer" (onClick)="addComment()" [disabled]="!newComment.trim()" />
                                </div>
                            </div>
                        }
                    </div>

                    <div class="flex flex-col gap-3 py-6 pt-4 border-t border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
                        <p-button [label]="isAddMode ? 'Add Document' : 'Update Document'" severity="primary" styleClass="w-full cursor-pointer" (onClick)="updateDocument()" />
                        @if (!isAddMode) {
                            <p-button label="Move to trash" icon="pi pi-trash" severity="danger" [outlined]="true" styleClass="w-full cursor-pointer" (onClick)="confirmMoveToTrash()" />
                        }
                    </div>
                </div>
            </p-drawer>

            <p-confirmdialog />
        </div>
    `
})
export class Files {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    activeFilter = signal<string>('All Files');

    filterOptions = ['All Files', 'Recently Uploaded', 'Large Files', 'Uploaded by Me'];

    showEditDrawer = false;
    editingItem: Document | null = null;
    isAddMode = false;
    editForm: Partial<Document> = {
        fileName: '',
        owner: '',
        type: '',
        fileSize: '',
        size: '',
        uploadDate: '',
        editDate: ''
    };
    newComment = '';
    rows = 5;

    activityFeed: ActivityFeed[] = [
        {
            id: 1,
            fileName: 'Diamond.pdf',
            icon: 'pi-file-pdf',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            author: 'Olivia Martinez',
            time: 'Today, 08:00 PM',
            dotColor: 'bg-primary-500',
            ringColor: 'ring-primary-500'
        },
        {
            id: 2,
            fileName: 'Genesis.png',
            icon: 'pi-image',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            author: 'Jessica Davis',
            time: 'Yesterday, 11:42 PM',
            dotColor: 'bg-green-500',
            ringColor: 'ring-green-500'
        },
        {
            id: 3,
            fileName: 'Avalon.esp',
            icon: 'pi-file',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            author: 'Robert Fox',
            time: 'Dec 11, 2025',
            dotColor: 'bg-cyan-500',
            ringColor: 'ring-cyan-500'
        },
        {
            id: 4,
            fileName: 'Poseidon.zip',
            icon: 'pi-file-o',
            description: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.',
            author: 'Emily Johnson',
            time: 'Dec 10, 2025',
            dotColor: 'bg-yellow-500',
            ringColor: 'ring-yellow-500'
        },
        {
            id: 5,
            fileName: 'Portfolio.pdf',
            icon: 'pi-file-pdf',
            description: 'Latest updates to the client portfolio with new design mockups and specifications.',
            author: 'Sarah Wilson',
            time: 'Dec 9, 2025',
            dotColor: 'bg-purple-500',
            ringColor: 'ring-purple-500'
        },
        {
            id: 6,
            fileName: 'Database.sql',
            icon: 'pi-database',
            description: 'Database schema updates and new table structures for the project.',
            author: 'Benjamin Taylor',
            time: 'Dec 8, 2025',
            dotColor: 'bg-red-500',
            ringColor: 'ring-red-500'
        }
    ];

    storageData: StorageData[] = [
        { id: 1, type: 'PNG', count: 12762, color: 'bg-green-500', shadowColor: 'rgba(34,197,94,0.16)', flexValue: 12762 },
        { id: 2, type: 'CSS', count: 10824, color: 'bg-orange-500', shadowColor: 'rgba(249,115,22,0.16)', flexValue: 10824 },
        { id: 3, type: 'PDF', count: 8824, color: 'bg-primary-500', shadowColor: 'rgba(59,130,246,0.16)', flexValue: 8824 },
        { id: 4, type: 'DOCX', count: 7145, color: 'bg-violet-500', shadowColor: 'rgba(139,92,246,0.16)', flexValue: 7145 },
        { id: 5, type: 'EPS', count: 6802, color: 'bg-cyan-500', shadowColor: 'rgba(6,182,212,0.16)', flexValue: 6802 },
        { id: 6, type: 'ZIP', count: 5829, color: 'bg-yellow-500', shadowColor: 'rgba(234,179,8,0.16)', flexValue: 5829 },
        { id: 7, type: 'XLS', count: 5240, color: 'bg-rose-500', shadowColor: 'rgba(244,63,94,0.16)', flexValue: 5240 }
    ];

    totalFiles = computed(() => this.storageData.reduce((sum, item) => sum + item.count, 0));

    pinnedItems: PinnedItem[] = [
        { id: 1, name: 'Genesis', type: 'DOCX', size: '17.4 MB', icon: 'pi-file-word' },
        { id: 2, name: 'Avalon', type: 'XLS', size: '24 MB', icon: 'pi-file-excel' },
        { id: 3, name: 'Poseidon', type: 'EPS', size: '11.4 MB', icon: 'pi-image' },
        { id: 4, name: 'PrimeBlocks', type: 'ZIP', size: '32 MB', icon: 'pi-file-o' },
        { id: 5, name: 'PrimeOne', type: 'CSS', size: '23 MB', icon: 'pi-code' },
        { id: 6, name: 'Diamond', type: 'PDF', size: '24 MB', icon: 'pi-file-pdf' }
    ];

    documents = signal<Document[]>([
        {
            id: 1,
            fileName: 'Diamond',
            type: 'PDF',
            fileSize: '24 MB',
            size: '-',
            uploadDate: 'Jan 11, 2025',
            editDate: 'Jan 22, 2025',
            owner: 'Robert Fox',
            icon: 'pi-file-pdf',
            comments: [
                { id: 1, author: 'Olivia Martinez', content: 'Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor incididunt.', time: 'Today, 08:00 PM' },
                { id: 2, author: 'Jessica Davis', content: 'Great work on this document! The formatting looks perfect.', time: 'Yesterday, 10:30 AM' }
            ]
        },
        {
            id: 2,
            fileName: 'Genesis',
            type: 'DOCX',
            fileSize: '17.4 MB',
            size: '-',
            uploadDate: 'Jan 7, 2025',
            editDate: 'Jan 14, 2025',
            owner: 'Emily Johnson',
            icon: 'pi-file-word',
            comments: [{ id: 1, author: 'Robert Fox', content: 'Please review the final draft before publishing.', time: 'Today, 02:15 PM' }]
        },
        { id: 3, fileName: 'Mountain', type: 'PNG', fileSize: '8.3 MB', size: '2880x1440', uploadDate: 'Jan 2, 2025', editDate: 'Jan 14, 2025', owner: 'David Smith', icon: 'pi-image', comments: [] },
        {
            id: 4,
            fileName: 'Avalon',
            type: 'XLS',
            fileSize: '21 MB',
            size: '-',
            uploadDate: 'Jan 1, 2025',
            editDate: 'Jan 12, 2025',
            owner: 'Jessica Davis',
            icon: 'pi-file-excel',
            comments: [{ id: 1, author: 'Benjamin Taylor', content: 'The calculations look accurate. Ready for client presentation.', time: 'Jan 12, 2025' }]
        },
        { id: 5, fileName: 'Poseidon', type: 'EPS', fileSize: '11.4 MB', size: '-', uploadDate: 'Jan 2, 2025', editDate: 'Jan 11, 2025', owner: 'Robert Fox', icon: 'pi-image', comments: [] },
        { id: 6, fileName: 'PrimeBlocks', type: 'ZIP', fileSize: '32 MB', size: '-', uploadDate: 'Jan 2, 2025', editDate: 'Jan 16, 2025', owner: 'James Anderson', icon: 'pi-file-o', comments: [] },
        { id: 7, fileName: 'PrimeOne', type: 'CSS', fileSize: '23.3 MB', size: '-', uploadDate: 'Feb 27, 2025', editDate: 'Feb 28, 2025', owner: 'Benjamin Taylor', icon: 'pi-code', comments: [] },
        { id: 8, fileName: 'Portfolio', type: 'PDF', fileSize: '15.2 MB', size: '-', uploadDate: 'Dec 28, 2024', editDate: 'Jan 5, 2025', owner: 'Robert Fox', icon: 'pi-file-pdf', comments: [] },
        { id: 9, fileName: 'Presentation', type: 'PPTX', fileSize: '45.7 MB', size: '-', uploadDate: 'Jan 15, 2025', editDate: 'Jan 20, 2025', owner: 'Sarah Wilson', icon: 'pi-file', comments: [] },
        { id: 10, fileName: 'Spreadsheet', type: 'XLS', fileSize: '6.8 MB', size: '-', uploadDate: 'Jan 18, 2025', editDate: 'Jan 25, 2025', owner: 'Robert Fox', icon: 'pi-file-excel', comments: [] },
        { id: 11, fileName: 'Logo', type: 'SVG', fileSize: '2.1 MB', size: '1024x1024', uploadDate: 'Jan 22, 2025', editDate: 'Jan 24, 2025', owner: 'Alex Brown', icon: 'pi-image', comments: [] },
        { id: 12, fileName: 'Database', type: 'SQL', fileSize: '128 MB', size: '-', uploadDate: 'Jan 5, 2025', editDate: 'Jan 26, 2025', owner: 'Robert Fox', icon: 'pi-database', comments: [] },
        { id: 13, fileName: 'Report', type: 'DOCX', fileSize: '3.2 MB', size: '-', uploadDate: 'Jan 28, 2025', editDate: 'Jan 29, 2025', owner: 'Lisa Chen', icon: 'pi-file-word', comments: [] }
    ]);

    filteredDocuments = computed(() => {
        const docs = this.documents();
        switch (this.activeFilter()) {
            case 'Recently Uploaded':
                return [...docs].sort((a, b) => new Date(b.uploadDate).getTime() - new Date(a.uploadDate).getTime());
            case 'Large Files':
                return docs.filter((doc) => parseFloat(doc.fileSize) > 20);
            case 'Uploaded by Me':
                return docs.filter((doc) => doc.owner === 'Robert Fox');
            default:
                return docs;
        }
    });

    feedMenuItems: MenuItem[] = [
        { label: 'Open', icon: 'pi pi-external-link' },
        { label: 'Share', icon: 'pi pi-share-alt' },
        { label: 'Download', icon: 'pi pi-download' },
        { label: 'Delete', icon: 'pi pi-trash' }
    ];

    pinnedMenuItems: MenuItem[] = [
        { label: 'Open', icon: 'pi pi-external-link' },
        { label: 'Unpin', icon: 'pi pi-times' },
        { label: 'Share', icon: 'pi pi-share-alt' },
        { label: 'Delete', icon: 'pi pi-trash' }
    ];

    tableMenuItems: MenuItem[] = [];

    constructor(private confirmationService: ConfirmationService) {}

    onTableMenuToggle(event: Event, document: Document, menu: Menu) {
        this.tableMenuItems = [
            { label: 'Edit', icon: 'pi pi-pencil', command: () => this.editDocument(document) },
            { label: 'Pin', icon: 'pi pi-bookmark' },
            { label: 'Share', icon: 'pi pi-share-alt' },
            { label: 'Delete', icon: 'pi pi-trash', command: () => this.confirmDeleteDocument(document) }
        ];
        menu.toggle(event);
    }

    createCommentMenuItems(commentId: number): MenuItem[] {
        return [
            { label: 'Edit Comment', icon: 'pi pi-pencil' },
            { label: 'Copy Text', icon: 'pi pi-copy' },
            { label: 'Report', icon: 'pi pi-flag' },
            { separator: true },
            { label: 'Remove', icon: 'pi pi-trash', command: () => this.removeComment(commentId) }
        ];
    }

    getTagSeverity(type: string): 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast' | undefined {
        const severityMap: Record<string, 'success' | 'secondary' | 'info' | 'warn' | 'danger' | 'contrast'> = {
            PDF: 'info',
            DOCX: 'secondary',
            PNG: 'success',
            XLS: 'warn',
            EPS: 'info',
            ZIP: 'warn',
            CSS: 'info',
            PPTX: 'secondary',
            SVG: 'success',
            SQL: 'contrast'
        };
        return severityMap[type] || 'secondary';
    }

    editDocument(document: Document) {
        this.editingItem = document;
        this.isAddMode = false;
        this.editForm = { ...document };
        this.showEditDrawer = true;
    }

    addDocument() {
        this.editingItem = null;
        this.isAddMode = true;
        this.editForm = {
            fileName: '',
            owner: '',
            type: '',
            fileSize: '',
            size: '',
            uploadDate: '',
            editDate: ''
        };
        this.showEditDrawer = true;
    }

    updateDocument() {
        if (this.isAddMode) {
            const docs = this.documents();
            const newId = Math.max(...docs.map((d) => d.id)) + 1;
            const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            const newDoc: Document = {
                id: newId,
                fileName: this.editForm.fileName || '',
                type: this.editForm.type || '',
                fileSize: this.editForm.fileSize || '',
                size: this.editForm.size || '-',
                uploadDate: this.editForm.uploadDate || currentDate,
                editDate: this.editForm.editDate || currentDate,
                owner: this.editForm.owner || 'Robert Fox',
                icon: this.getIconByType(this.editForm.type || ''),
                comments: []
            };
            this.documents.set([newDoc, ...docs]);
        } else if (this.editingItem) {
            const docs = this.documents();
            const index = docs.findIndex((d) => d.id === this.editingItem!.id);
            if (index !== -1) {
                docs[index] = { ...docs[index], ...this.editForm } as Document;
                this.documents.set([...docs]);
            }
        }
        this.showEditDrawer = false;
    }

    addComment() {
        if (this.newComment.trim() && this.editingItem) {
            const comment: Comment = {
                id: Date.now(),
                author: 'Robert Fox',
                content: this.newComment.trim(),
                time: 'Just now'
            };
            this.editingItem.comments.push(comment);
            this.newComment = '';
        }
    }

    removeComment(commentId: number) {
        if (this.editingItem?.comments) {
            const commentIndex = this.editingItem.comments.findIndex((c) => c.id === commentId);
            if (commentIndex !== -1) {
                this.editingItem.comments.splice(commentIndex, 1);
            }
        }
    }

    getIconByType(type: string): string {
        const iconMap: Record<string, string> = {
            PDF: 'pi-file-pdf',
            DOCX: 'pi-file-word',
            PNG: 'pi-image',
            JPG: 'pi-image',
            SVG: 'pi-image',
            XLS: 'pi-file-excel',
            EPS: 'pi-image',
            ZIP: 'pi-file-o',
            CSS: 'pi-code',
            PPTX: 'pi-file',
            SQL: 'pi-database'
        };
        return iconMap[type] || 'pi-file';
    }

    triggerFileUpload() {
        this.fileInput?.nativeElement?.click();
    }

    handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file) {
            const currentDate = new Date().toLocaleDateString('en-US', { month: 'short', day: 'numeric', year: 'numeric' });
            this.editForm.fileName = file.name.split('.')[0];
            this.editForm.type = file.name.split('.').pop()?.toUpperCase() || '';
            this.editForm.fileSize = (file.size / (1024 * 1024)).toFixed(1) + ' MB';

            if (this.isAddMode) {
                if (!this.editForm.uploadDate) {
                    this.editForm.uploadDate = currentDate;
                }
                if (!this.editForm.editDate) {
                    this.editForm.editDate = currentDate;
                }
                if (!this.editForm.owner) {
                    this.editForm.owner = 'Robert Fox';
                }
                if (!this.editForm.size) {
                    this.editForm.size = '-';
                }
            }
        }
    }

    removeUploadedFile() {
        this.editForm.fileName = '';
        this.editForm.type = '';
        this.editForm.fileSize = '';
        this.editForm.size = '';

        if (this.isAddMode) {
            this.editForm.uploadDate = '';
            this.editForm.editDate = '';
            this.editForm.owner = '';
        }

        if (this.fileInput?.nativeElement) {
            this.fileInput.nativeElement.value = '';
        }
    }

    confirmDeleteDocument(document: Document) {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${document.fileName}"? This action cannot be undone.`,
            header: 'Delete Document',
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
                this.deleteDocument(document.id);
            }
        });
    }

    deleteDocument(documentId: number) {
        const docs = this.documents();
        const index = docs.findIndex((d) => d.id === documentId);
        if (index !== -1) {
            docs.splice(index, 1);
            this.documents.set([...docs]);
            if (this.editingItem?.id === documentId) {
                this.showEditDrawer = false;
            }
        }
    }

    confirmMoveToTrash() {
        if (!this.editingItem) return;

        this.confirmationService.confirm({
            message: `Are you sure you want to move "${this.editingItem.fileName}" to trash? This action cannot be undone.`,
            header: 'Move to Trash',
            icon: 'pi pi-info-circle',
            rejectButtonProps: {
                label: 'Cancel',
                severity: 'secondary',
                outlined: true
            },
            acceptButtonProps: {
                label: 'Move to Trash',
                severity: 'danger'
            },
            accept: () => {
                this.deleteDocument(this.editingItem!.id);
            }
        });
    }
}
