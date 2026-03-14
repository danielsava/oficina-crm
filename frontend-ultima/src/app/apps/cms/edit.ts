import { Component, computed, ElementRef, model, signal, ViewChild } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { AccordionModule } from 'primeng/accordion';
import { ButtonModule } from 'primeng/button';
import { CheckboxModule } from 'primeng/checkbox';
import { ChipModule } from 'primeng/chip';
import { DatePickerModule } from 'primeng/datepicker';
import { DrawerModule } from 'primeng/drawer';
import { EditorModule } from 'primeng/editor';
import { InputTextModule } from 'primeng/inputtext';
import { MultiSelectModule } from 'primeng/multiselect';
import { RadioButtonModule } from 'primeng/radiobutton';
import { SelectModule } from 'primeng/select';

interface Author {
    name: string;
    image: string;
}

interface StatusOption {
    label: string;
    value: string;
}

@Component({
    selector: 'app-edit',
    imports: [FormsModule, AccordionModule, ButtonModule, CheckboxModule, ChipModule, DatePickerModule, DrawerModule, EditorModule, InputTextModule, MultiSelectModule, RadioButtonModule, SelectModule],
    template: `
        <div class="flex flex-col min-h-screen overflow-hidden card">
            <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center gap-4">
                <h1 class="flex-1 text-surface-900 dark:text-surface-0 text-lg font-medium">Create a new post</h1>
                <p-button icon="pi pi-bars" severity="secondary" styleClass="!flex xl:!hidden" (onClick)="sidebarVisible.set(true)" />
            </div>

            <div class="flex flex-1 overflow-hidden">
                <div class="flex-1 p-6 flex flex-col gap-6 min-w-0 overflow-auto">
                    <div class="flex flex-col gap-2">
                        <label class="text-surface-900 dark:text-surface-0 text-base font-medium">Cover</label>
                        <div class="relative h-[19rem] rounded-2xl border border-surface-200 dark:border-surface-700 overflow-hidden">
                            @if (coverImage()) {
                                <img [src]="coverImage()" alt="Cover image" class="w-full h-full object-cover" />
                                <div class="absolute inset-0 bg-linear-to-b from-transparent to-black/30"></div>
                                <div class="absolute top-[18px] right-[18px]">
                                    <p-button icon="pi pi-trash" severity="secondary" size="small" styleClass="!text-red-500 dark:!text-red-400" (onClick)="removeCoverImage()" />
                                </div>
                            } @else {
                                <div
                                    class="w-full h-full bg-surface-100 dark:bg-surface-800 flex flex-col items-center justify-center gap-4 cursor-pointer hover:bg-surface-200 dark:hover:bg-surface-700 transition-colors"
                                    (click)="triggerFileUpload()"
                                >
                                    <div class="w-12 h-12 rounded-full bg-surface-200 dark:bg-surface-600 flex items-center justify-center">
                                        <i class="pi pi-cloud-upload text-surface-600 dark:text-surface-300 text-xl"></i>
                                    </div>
                                    <div class="text-center">
                                        <div class="text-surface-900 dark:text-surface-0 text-base font-medium mb-1">Click to upload cover image</div>
                                        <div class="text-surface-500 dark:text-surface-400 text-sm">PNG, JPG or WebP (max 5MB)</div>
                                    </div>
                                </div>
                            }
                            <input #fileInput type="file" accept="image/*" (change)="handleFileUpload($event)" class="hidden" />
                        </div>
                    </div>

                    <div class="flex flex-col gap-2">
                        <label class="text-surface-900 dark:text-surface-0 text-base font-medium">Title</label>
                        <input type="text" pInputText [(ngModel)]="title" placeholder="The Smartest Ways to Earn Airline Miles" />
                    </div>

                    <div class="flex-1 flex flex-col gap-2 min-w-0">
                        <label class="text-surface-900 dark:text-surface-0 text-base font-medium">Content</label>
                        <p-editor [(ngModel)]="content" [style]="{ 'min-height': '320px', 'padding-top': '0', 'overflow-wrap': 'break-word', 'word-break': 'break-word' }" styleClass="!min-w-0" />
                    </div>
                </div>

                <div class="hidden xl:block w-[309px] p-6 bg-surface-0 dark:bg-surface-900 border-l border-surface-200 dark:border-surface-700">
                    <div class="flex flex-col gap-6">
                        <div class="flex gap-4">
                            <p-button label="Save Draft" [outlined]="true" severity="secondary" styleClass="w-full" class="flex-1" />
                            <p-button label="Publish" severity="primary" styleClass="w-full" class="flex-1" />
                        </div>

                        <div class="w-full border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                        <div class="flex flex-col gap-4">
                            <div class="flex justify-start items-start gap-2">
                                <span class="flex-1 text-surface-900 dark:text-surface-0 text-base font-medium">Publish</span>
                                <a class="text-primary-600 dark:text-primary-400 text-base font-medium underline">Preview</a>
                            </div>
                        </div>

                        <p-accordion [multiple]="true" [value]="accordionValue" expandIcon="pi pi-chevron-down !text-primary" collapseIcon="pi pi-chevron-up !text-primary">
                            <p-accordion-panel value="status">
                                <p-accordion-header>
                                    <div class="flex justify-start items-center gap-2 w-full">
                                        <span class="text-surface-900 dark:text-surface-0 text-base font-medium">Status:</span>
                                        <span class="flex-1 text-primary-600 dark:text-primary-400 text-base font-medium">{{ status() }}</span>
                                    </div>
                                </p-accordion-header>
                                <p-accordion-content [pt]="{'root': { class: 'overflow-hidden' } }">
                                    <p-select [(ngModel)]="status" [options]="statusOptions" optionLabel="label" optionValue="value" class="w-full" />
                                </p-accordion-content>
                            </p-accordion-panel>

                            <p-accordion-panel value="visibility">
                                <p-accordion-header>
                                    <div class="flex justify-start items-center gap-2 w-full">
                                        <span class="text-surface-900 dark:text-surface-0 text-base font-medium">Visibility:</span>
                                        <span class="flex-1 text-primary-600 dark:text-primary-400 text-base font-medium">{{ visibility() }}</span>
                                    </div>
                                </p-accordion-header>
                                <p-accordion-content [pt]="{'root': { class: 'overflow-hidden' } }">
                                    <div class="flex flex-col gap-3">
                                        <div class="flex items-center gap-2">
                                            <p-radioButton [(ngModel)]="visibility" inputId="public" value="Public" />
                                            <label for="public" class="text-surface-900 dark:text-surface-0 text-base">Public</label>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <p-radioButton [(ngModel)]="visibility" inputId="password" value="Password protected" />
                                            <label for="password" class="text-surface-900 dark:text-surface-0 text-base">Password protected</label>
                                        </div>
                                        <div class="flex items-center gap-2">
                                            <p-radioButton [(ngModel)]="visibility" inputId="private" value="Private" />
                                            <label for="private" class="text-surface-900 dark:text-surface-0 text-base">Private</label>
                                        </div>
                                    </div>
                                </p-accordion-content>
                            </p-accordion-panel>

                            <p-accordion-panel value="publish-date">
                                <p-accordion-header>
                                    <div class="flex justify-start items-center gap-2 w-full">
                                        <span class="text-surface-900 dark:text-surface-0 text-base font-medium">Publish:</span>
                                        <span class="flex-1 text-primary-600 dark:text-primary-400 text-base font-medium">{{ formattedPublishDate() }}</span>
                                    </div>
                                </p-accordion-header>
                                <p-accordion-content [pt]="{'root': { class: 'overflow-hidden' } }">
                                    <p-datepicker [(ngModel)]="publishDate" appendTo="body" styleClass="!w-full" inputStyleClass="w-full" />
                                </p-accordion-content>
                            </p-accordion-panel>
                        </p-accordion>

                        <div class="flex flex-col gap-2">
                            <label class="text-surface-900 dark:text-surface-0 text-base font-medium">Author</label>
                            <p-multiselect [(ngModel)]="selectedAuthors" [options]="authorOptions" optionLabel="name" placeholder="Select authors">
                                <ng-template #selecteditems let-value>
                                    @if (value && value.length > 0) {
                                        <div class="flex gap-1 overflow-hidden min-h-8">
                                            @for (author of value; track author.name) {
                                                <p-chip [label]="author.name" [image]="author.image" [removable]="true" styleClass="!shrink-0" (onRemove)="removeAuthor($event, author)" />
                                            }
                                        </div>
                                    }
                                </ng-template>
                            </p-multiselect>
                        </div>

                        <div class="w-full border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                        <div class="flex flex-col gap-4">
                            <label class="text-surface-900 dark:text-surface-0 text-base font-medium">Category</label>
                            <div class="flex flex-col gap-3">
                                @for (category of categories; track category) {
                                    <div class="flex items-center gap-2">
                                        <p-checkbox [(ngModel)]="selectedCategories" [inputId]="category" [value]="category" />
                                        <label [for]="category" class="text-surface-900 dark:text-surface-0 text-base">{{ category }}</label>
                                    </div>
                                }
                            </div>
                        </div>

                        <div class="w-full border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                        <div class="flex flex-col gap-2">
                            <label class="text-surface-900 dark:text-surface-0 text-base font-medium">Tag</label>
                            <p-multiselect [(ngModel)]="selectedTags" [options]="tagOptions" placeholder="Select tags" display="chip" styleClass="!w-full" />
                        </div>

                        <div class="w-full border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                        <p-button label="Move to trash" icon="pi pi-trash" severity="danger" [outlined]="true" class="flex-1" styleClass="w-full" />
                    </div>
                </div>
            </div>

            <p-drawer [(visible)]="sidebarVisible" position="right" styleClass="!w-full !max-w-md" appendTo="body">
                <ng-template #header>
                    <h3 class="text-surface-900 dark:text-surface-0 text-lg font-medium">Publishing Settings</h3>
                </ng-template>

                <div class="flex flex-col gap-6 p-4 px-2">
                    <div class="flex gap-4">
                        <p-button label="Save Draft" [outlined]="true" severity="secondary" styleClass="w-full" class="flex-1" />
                        <p-button label="Publish" severity="primary" styleClass="w-full" class="flex-1" />
                    </div>

                    <div class="w-full border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                    <div class="flex flex-col gap-4">
                        <div class="flex justify-start items-start gap-2">
                            <span class="flex-1 text-surface-900 dark:text-surface-0 text-base font-medium">Publish</span>
                            <a class="text-primary-600 dark:text-primary-400 text-base font-medium underline">Preview</a>
                        </div>
                    </div>

                    <p-accordion [multiple]="true" [value]="accordionValue" expandIcon="pi pi-chevron-down !text-primary" collapseIcon="pi pi-chevron-up !text-primary">
                        <p-accordion-panel value="status">
                            <p-accordion-header>
                                <div class="flex justify-start items-center gap-2 w-full">
                                    <span class="text-surface-900 dark:text-surface-0 text-base font-medium">Status:</span>
                                    <span class="flex-1 text-primary-600 dark:text-primary-400 text-base font-medium">{{ status() }}</span>
                                </div>
                            </p-accordion-header>
                            <p-accordion-content [pt]="{'root': { class: 'overflow-hidden' } }">
                                <p-select [(ngModel)]="status" [options]="statusOptions" optionLabel="label" optionValue="value" styleClass="!w-full" />
                            </p-accordion-content>
                        </p-accordion-panel>
                        <p-accordion-panel value="visibility">
                            <p-accordion-header>
                                <div class="flex justify-start items-center gap-2 w-full">
                                    <span class="text-surface-900 dark:text-surface-0 text-base font-medium">Visibility:</span>
                                    <span class="flex-1 text-primary-600 dark:text-primary-400 text-base font-medium">{{ visibility() }}</span>
                                </div>
                            </p-accordion-header>
                            <p-accordion-content [pt]="{'root': { class: 'overflow-hidden' } }">
                                <div class="flex flex-col gap-3">
                                    <div class="flex items-center gap-2">
                                        <p-radioButton [(ngModel)]="visibility" inputId="mobile-public" value="Public" />
                                        <label for="mobile-public" class="text-surface-900 dark:text-surface-0 text-base">Public</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <p-radioButton [(ngModel)]="visibility" inputId="mobile-password" value="Password protected" />
                                        <label for="mobile-password" class="text-surface-900 dark:text-surface-0 text-base">Password protected</label>
                                    </div>
                                    <div class="flex items-center gap-2">
                                        <p-radioButton [(ngModel)]="visibility" inputId="mobile-private" value="Private" />
                                        <label for="mobile-private" class="text-surface-900 dark:text-surface-0 text-base">Private</label>
                                    </div>
                                </div>
                            </p-accordion-content>
                        </p-accordion-panel>
                        <p-accordion-panel value="publish-date">
                            <p-accordion-header>
                                <div class="flex justify-start items-center gap-2 w-full">
                                    <span class="text-surface-900 dark:text-surface-0 text-base font-medium">Publish:</span>
                                    <span class="flex-1 text-primary-600 dark:text-primary-400 text-base font-medium">{{ formattedPublishDate() }}</span>
                                </div>
                            </p-accordion-header>
                            <p-accordion-content [pt]="{'root': { class: 'overflow-hidden' } }">
                                <p-datepicker [(ngModel)]="publishDate" appendTo="body" styleClass="!w-full" inputStyleClass="w-full"/>
                            </p-accordion-content>
                        </p-accordion-panel>
                    </p-accordion>

                    <div class="flex flex-col gap-2">
                        <label class="text-surface-900 dark:text-surface-0 text-base font-medium">Author</label>
                        <p-multiselect [(ngModel)]="selectedAuthors" [options]="authorOptions" optionLabel="name" placeholder="Select authors">
                            <ng-template #selecteditems let-value>
                                @if (value && value.length > 0) {
                                    <div class="flex gap-1 overflow-hidden min-h-8">
                                        @for (author of value; track author.name) {
                                            <p-chip [label]="author.name" [image]="author.image" [removable]="true" styleClass="!shrink-0" (onRemove)="removeAuthor($event, author)" />
                                        }
                                    </div>
                                }
                            </ng-template>
                        </p-multiselect>
                    </div>

                    <div class="w-full border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                    <div class="flex flex-col gap-4">
                        <label class="text-surface-900 dark:text-surface-0 text-base font-medium">Category</label>
                        <div class="flex flex-col gap-3">
                            @for (category of categories; track category) {
                                <div class="flex items-center gap-2">
                                    <p-checkbox [(ngModel)]="selectedCategories" [inputId]="'mobile-' + category" [value]="category" />
                                    <label [for]="'mobile-' + category" class="text-surface-900 dark:text-surface-0 text-base">{{ category }}</label>
                                </div>
                            }
                        </div>
                    </div>

                    <div class="w-full border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                    <div class="flex flex-col gap-2">
                        <label class="text-surface-900 dark:text-surface-0 text-base font-medium">Tag</label>
                        <p-multiselect [(ngModel)]="selectedTags" [options]="tagOptions" placeholder="Select tags" display="chip" styleClass="!w-full" />
                    </div>

                    <div class="w-full border-t border-dashed border-surface-200 dark:border-surface-700"></div>

                    <p-button label="Move to trash" icon="pi pi-trash" severity="danger" [outlined]="true" />
                </div>
            </p-drawer>
        </div>
    `
})
export class Edit {
    @ViewChild('fileInput') fileInput!: ElementRef<HTMLInputElement>;

    sidebarVisible = signal(false);
    coverImage = signal<string | null>('/demo/images/cms/cms-hero-1.jpg');

    title = model('The Smartest Ways to Earn Airline Miles');
    content = model(
        'Your credit score plays a crucial role in your financial well-being, influencing your ability to secure loans, mortgages, and even rental agreements. A higher score can unlock better interest rates and financial flexibility. Understanding how to improve and maintain a strong credit score is essential for achieving financial stability. Here are five golden rules to help you boost your score effectively.'
    );
    status = model('Draft');
    visibility = model('Public');
    publishDate = model<Date | null>(new Date());
    selectedAuthors = model<Author[]>([{ name: 'Dianne Russell', image: '/demo/images/cms/avatars/avatar-dianne.jpg' }]);
    selectedCategories = model<string[]>(['Lifestyle', 'Art', 'Banking']);
    selectedTags = model<string[]>(['World', 'Space']);

    accordionValue = ['status', 'visibility', 'publish-date'];

    tagOptions: string[] = ['World', 'Space', 'Technology', 'Science', 'Nature', 'Travel', 'Art', 'Music', 'Food', 'Sports'];

    statusOptions: StatusOption[] = [
        { label: 'Draft', value: 'Draft' },
        { label: 'Published', value: 'Published' },
        { label: 'Scheduled', value: 'Scheduled' }
    ];

    authorOptions: Author[] = [
        { name: 'Dianne Russell', image: '/demo/images/cms/avatars/avatar-dianne.jpg' },
        { name: 'Jane Smith', image: '/demo/images/cms/avatars/avatar-jane.jpg' },
        { name: 'Darrell Steward', image: '/demo/images/cms/avatars/avatar-darrell.jpg' },
        { name: 'Emma Wilson', image: '/demo/images/cms/avatars/avatar-emma.jpg' },
        { name: 'Ethan Hunt', image: '/demo/images/cms/avatars/avatar-ethan.jpg' },
        { name: 'Sophia Chen', image: '/demo/images/cms/avatars/avatar-sophia.jpg' }
    ];

    categories: string[] = ['Lifestyle', 'Sustainability', 'Culture', 'Art', 'Banking', 'Technology'];

    formattedPublishDate = computed(() => {
        if (!this.publishDate()) return 'Immediately';
        const date = new Date(this.publishDate()!);
        const options: Intl.DateTimeFormatOptions = { month: 'short', day: 'numeric', year: 'numeric' };
        return date.toLocaleDateString('en-US', options);
    });

    removeCoverImage() {
        this.coverImage.set(null);
    }

    triggerFileUpload() {
        this.fileInput?.nativeElement.click();
    }

    handleFileUpload(event: Event) {
        const input = event.target as HTMLInputElement;
        const file = input.files?.[0];
        if (file && file.type.startsWith('image/')) {
            const reader = new FileReader();
            reader.onload = (e) => {
                this.coverImage.set(e.target?.result as string);
            };
            reader.readAsDataURL(file);
        }
    }

    removeAuthor(event: any, authorToRemove: Author) {
        event.stopPropagation();
        this.selectedAuthors.set(this.selectedAuthors().filter((author) => author.name !== authorToRemove.name));
    }
}
