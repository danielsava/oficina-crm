import { Component, EventEmitter, Input, Output, computed } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { TextareaModule } from 'primeng/textarea';
import { AvatarModule } from 'primeng/avatar';

interface ComposeData {
    to: string;
    subject: string;
    message: string;
}

@Component({
    selector: 'app-compose-dialog',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, DialogModule, InputTextModule, TextareaModule, AvatarModule],
    template: `
        <p-dialog
            [(visible)]="visible"
            [modal]="false"
            [closable]="false"
            [draggable]="false"
            position="bottomright"
            styleClass="w-[360px] md:w-[640px]"
            (onHide)="onHide()"
            [pt]="{
                root: { class: 'rounded-lg fixed! bottom-4! right-4! transform-none! m-0! shadow-lg' },
                header: { class: 'hidden!' },
                content: { class: 'p-0!' }
            }"
        >
            <div>
                <div class="p-3 md:p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                    <div class="flex items-center gap-2 md:gap-3 min-w-0">
                        <p-avatar image="/demo/images/avatar/avatar-square-m-2.jpg" shape="square" [pt]="{ image: { class: 'rounded-lg!' } }" />
                        <div class="min-w-0">
                            <div class="text-surface-900 dark:text-surface-0 font-medium text-sm md:text-base">Robert Fox</div>
                            <div class="text-xs md:text-sm text-surface-500 dark:text-surface-400">Compose</div>
                        </div>
                    </div>
                    <p-button icon="pi pi-times" [text]="true" severity="secondary" size="small" (onClick)="closeCompose()" styleClass="shrink-0" />
                </div>

                <div class="px-3 md:px-4 py-2 border-b border-surface-200 dark:border-surface-700 flex items-center gap-3">
                    <label class="text-sm text-surface-600 dark:text-surface-300 font-medium min-w-0 shrink-0">To:</label>
                    <input pInputText [(ngModel)]="composeData.to" class="flex-1 text-sm border-0! shadow-none! bg-transparent p-0" />
                </div>

                <div class="px-3 md:px-4 py-2 border-b border-surface-200 dark:border-surface-700 flex items-center gap-3">
                    <label class="text-sm text-surface-600 dark:text-surface-300 font-medium min-w-0 shrink-0">Subject:</label>
                    <input pInputText [(ngModel)]="composeData.subject" class="flex-1 text-sm border-0! shadow-none! bg-transparent p-0" />
                </div>

                <div class="p-3 md:p-4">
                    <textarea pTextarea [(ngModel)]="composeData.message" [rows]="8" placeholder="Compose your message..." class="w-full border-0 resize-none text-sm md:text-base shadow-none!"></textarea>
                </div>

                <div class="p-3 md:p-4 border-t border-surface-200 dark:border-surface-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
                    <div class="flex items-center gap-1 justify-center sm:justify-start">
                        <p-button icon="pi pi-paperclip" [text]="true" size="small" severity="secondary" pTooltip="Attach files" />
                        <p-button icon="pi pi-image" [text]="true" size="small" severity="secondary" pTooltip="Insert photo" />
                        <p-button icon="pi pi-link" [text]="true" size="small" severity="secondary" pTooltip="Insert link" styleClass="hidden sm:inline-flex" />
                        <p-button icon="pi pi-face-smile" [text]="true" size="small" severity="secondary" pTooltip="Insert emoji" styleClass="hidden sm:inline-flex" />
                    </div>
                    <div class="flex items-center gap-2 w-full sm:w-auto">
                        <p-button label="Discard" severity="secondary" [outlined]="true" (onClick)="closeCompose()" class="flex-1" styleClass="w-full sm:flex-none" />
                        <p-button label="Send" icon="pi pi-send" (onClick)="sendEmail()" class="flex-1" styleClass="w-full sm:flex-none" />
                    </div>
                </div>
            </div>
        </p-dialog>
    `
})
export class ComposeDialog {
    @Input() visible = false;
    @Input() initialData: ComposeData = { to: '', subject: '', message: '' };
    @Output() visibleChange = new EventEmitter<boolean>();
    @Output() send = new EventEmitter<ComposeData>();
    @Output() close = new EventEmitter<void>();

    composeData: ComposeData = { to: '', subject: '', message: '' };

    ngOnChanges() {
        this.composeData = {
            to: this.initialData.to || '',
            subject: this.initialData.subject || '',
            message: this.initialData.message || ''
        };
    }

    closeCompose() {
        this.close.emit();
        this.visible = false;
        this.visibleChange.emit(false);
    }

    sendEmail() {
        this.send.emit({ ...this.composeData });
        this.closeCompose();
    }

    onHide() {
        this.closeCompose();
    }
}
