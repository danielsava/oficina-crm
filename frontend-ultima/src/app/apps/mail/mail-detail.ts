import { Component, OnInit, signal, computed, ViewChild, inject } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router, ActivatedRoute } from '@angular/router';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { Menu } from 'primeng/menu';
import { PopoverModule } from 'primeng/popover';
import { Popover } from 'primeng/popover';
import { TextareaModule } from 'primeng/textarea';
import { MenuItem } from 'primeng/api';
import { MailService, Email } from './mail.service';

@Component({
    selector: 'app-mail-detail',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, AvatarModule, MenuModule, PopoverModule, TextareaModule],
    styles: [
        `
            .flip-icon-horizontal {
                transform: scaleX(-1);
            }
        `
    ],
    template: `
        <div class="w-full h-full flex flex-col bg-surface-0 dark:bg-surface-900 card">
            <!-- Header -->
            <div class="px-4 md:px-6 py-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center bg-surface-0 dark:bg-surface-900">
                <div class="flex items-center gap-2 md:gap-4 flex-1 min-w-0">
                    <p-button icon="pi pi-arrow-left" [text]="true" (onClick)="goBack()" severity="secondary" />
                    <div class="flex flex-col min-w-0">
                        <h1 class="text-surface-900 dark:text-surface-0 text-lg font-medium truncate">{{ currentEmail()?.subject }}</h1>
                        <span class="text-surface-500 dark:text-surface-400 text-sm">{{ currentEmail()?.thread?.length || 1 }} {{ (currentEmail()?.thread?.length || 1) === 1 ? 'message' : 'messages' }}</span>
                    </div>
                </div>
                <div class="flex items-center gap-2 md:gap-3 shrink-0">
                    <p-button [icon]="currentEmail()?.starred ? 'pi pi-star-fill' : 'pi pi-star'" [ngClass]="currentEmail()?.starred ? 'text-yellow-500' : ''" [text]="true" severity="secondary" (onClick)="toggleStar()" pTooltip="Star" />
                    <p-button
                        [icon]="currentEmail()?.important ? 'pi pi-bookmark-fill' : 'pi pi-bookmark'"
                        [ngClass]="currentEmail()?.important ? 'text-orange-500' : ''"
                        [text]="true"
                        severity="secondary"
                        (onClick)="toggleImportant()"
                        pTooltip="Mark as important"
                    />
                    <p-button icon="pi pi-ellipsis-v" severity="secondary" [text]="true" (onClick)="showActionMenu($event)" pTooltip="More actions" />
                </div>
            </div>

            <!-- Messages -->
            <div class="flex-1 overflow-y-auto">
                <div class="px-4 md:px-6">
                    @for (message of currentEmail()?.thread; track message.id; let i = $index) {
                        <div class="message-card">
                            <div class="my-4 bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg overflow-hidden">
                                <!-- Mobile Header -->
                                <div class="p-3 md:p-6 border-b border-surface-200 dark:border-surface-700">
                                    <div class="block md:hidden">
                                        <div class="flex items-start gap-3 mb-3">
                                            @if (message.avatar && message.avatar.startsWith('/')) {
                                                <p-avatar [image]="message.avatar" size="normal" styleClass="w-8 h-8 shrink-0" [pt]="{ image: 'rounded-lg' }" />
                                            } @else if (message.avatar) {
                                                <p-avatar [label]="message.avatar" size="normal" styleClass="w-8 h-8 shrink-0 bg-primary-100 text-primary-600!" [pt]="{ image: 'rounded-lg' }" />
                                            } @else {
                                                <p-avatar [label]="getAvatarInitials(message.sender)" size="normal" styleClass="w-8 h-8 shrink-0 bg-primary-100 text-primary-600!" [pt]="{ image: 'rounded-lg' }" />
                                            }
                                            <div class="flex-1 min-w-0">
                                                <div class="flex items-center justify-between">
                                                    <span class="text-surface-900 dark:text-surface-0 font-medium truncate">{{ message.sender }}</span>
                                                    <span class="text-xs text-surface-500 dark:text-surface-400 shrink-0 ml-2">{{ message.time }}</span>
                                                </div>
                                                <div class="text-sm text-surface-500 dark:text-surface-400 truncate">&lt;{{ message.email }}&gt;</div>
                                                <div class="flex items-center justify-between mt-1">
                                                    <div class="flex items-center gap-1 text-sm text-surface-500 dark:text-surface-400">
                                                        <span>to {{ message.sender === 'Robert Fox' ? currentEmail()?.sender : 'Robert Fox' }}</span>
                                                        <p-button icon="pi pi-chevron-down" [text]="true" size="small" severity="secondary" styleClass="p-1 w-4 h-4" (onClick)="showRecipientDetails($event)" />
                                                    </div>
                                                    <div class="flex items-center gap-1">
                                                        <p-button [text]="true" size="small" severity="secondary" (onClick)="toggleReply()" pTooltip="Reply" styleClass="w-6 h-6">
                                                            <i class="pi pi-reply flip-icon-horizontal"></i>
                                                        </p-button>
                                                        <p-button icon="pi pi-ellipsis-v" [text]="true" size="small" severity="secondary" (onClick)="showActionMenu($event)" pTooltip="More actions" styleClass="w-6 h-6" />
                                                    </div>
                                                </div>
                                            </div>
                                        </div>
                                    </div>

                                    <!-- Desktop Header -->
                                    <div class="hidden md:block">
                                        <div class="flex items-start justify-between gap-4">
                                            <div class="flex items-start gap-3">
                                                @if (message.avatar && message.avatar.startsWith('/')) {
                                                    <p-avatar [image]="message.avatar" size="normal" styleClass="w-10 h-10 shrink-0" [pt]="{ image: 'rounded-lg' }" />
                                                } @else if (message.avatar) {
                                                    <p-avatar [label]="message.avatar" size="normal" styleClass="w-10 h-10 shrink-0 bg-primary-100 text-primary-600!" [pt]="{ image: 'rounded-lg' }" />
                                                } @else {
                                                    <p-avatar [label]="getAvatarInitials(message.sender)" size="normal" styleClass="w-10 h-10 shrink-0 bg-primary-100 text-primary-600!" [pt]="{ image: 'rounded-lg' }" />
                                                }
                                                <div class="flex flex-col gap-1">
                                                    <div class="flex items-center gap-2">
                                                        <span class="text-surface-900 dark:text-surface-0 font-medium">{{ message.sender }}</span>
                                                        <span class="text-surface-500 dark:text-surface-400 text-sm">&lt;{{ message.email }}&gt;</span>
                                                    </div>
                                                    <div class="flex items-center gap-2 text-sm text-surface-500 dark:text-surface-400">
                                                        <span>to {{ message.sender === 'Robert Fox' ? currentEmail()?.sender : 'Robert Fox' }}</span>
                                                        <p-button icon="pi pi-chevron-down" [text]="true" size="small" severity="secondary" styleClass="p-1 w-5 h-5" (onClick)="showRecipientDetails($event)" />
                                                    </div>
                                                </div>
                                            </div>
                                            <div class="flex items-center gap-2">
                                                <span class="text-sm text-surface-500 dark:text-surface-400">{{ message.time }}</span>
                                                <div class="flex items-center gap-1">
                                                    <p-button [text]="true" size="small" severity="secondary" (onClick)="toggleReply()" pTooltip="Reply">
                                                        <i class="pi pi-reply flip-icon-horizontal"></i>
                                                    </p-button>
                                                    <p-button icon="pi pi-ellipsis-v" [text]="true" size="small" severity="secondary" (onClick)="showActionMenu($event)" pTooltip="More actions" />
                                                </div>
                                            </div>
                                        </div>
                                    </div>
                                </div>

                                <!-- Content -->
                                <div class="p-3 md:p-6">
                                    <div class="text-sm md:text-base text-surface-700 dark:text-surface-300 leading-relaxed break-words overflow-hidden" [innerHTML]="message.content || currentEmail()?.fullContent"></div>
                                </div>

                                <!-- Actions (only on last message) -->
                                @if (i === (currentEmail()?.thread?.length || 1) - 1) {
                                    <div class="px-3 md:px-6 pb-3 md:pb-4 flex flex-col sm:flex-row items-stretch sm:items-center gap-2">
                                        <p-button label="Reply" severity="secondary" [outlined]="true" size="small" (onClick)="toggleReply()" styleClass="w-full sm:w-auto">
                                            <ng-template #icon>
                                                <i class="pi pi-reply flip-icon-horizontal mr-2"></i>
                                            </ng-template>
                                        </p-button>
                                        <p-button label="Forward" icon="pi pi-reply" severity="secondary" [outlined]="true" size="small" styleClass="w-full sm:w-auto" />
                                    </div>
                                }
                            </div>
                        </div>
                    }
                </div>
            </div>

            <!-- Reply Editor -->
            @if (showReplyEditor) {
                <div class="px-3 md:px-6 mb-4 md:mb-6">
                    <div class="bg-surface-0 dark:bg-surface-800 border border-surface-200 dark:border-surface-700 rounded-lg shadow-sm">
                        <div class="p-3 md:p-4 border-b border-surface-200 dark:border-surface-700 flex items-center justify-between">
                            <div class="flex items-center gap-2 md:gap-3 min-w-0">
                                <p-avatar image="/demo/images/avatar/avatar-square-m-2.jpg" size="normal" styleClass="w-6 h-6 md:w-8 md:h-8 shrink-0" [pt]="{ image: 'rounded-lg' }" />
                                <div class="min-w-0">
                                    <div class="text-surface-900 dark:text-surface-0 font-medium text-sm md:text-base">Robert Fox</div>
                                    <div class="text-xs md:text-sm text-surface-500 dark:text-surface-400 truncate">to {{ currentEmail()?.sender }}</div>
                                </div>
                            </div>
                            <p-button icon="pi pi-times" [text]="true" severity="secondary" size="small" (onClick)="showReplyEditor = false" styleClass="shrink-0" />
                        </div>

                        <div class="p-3 md:p-4">
                            <textarea pTextarea [(ngModel)]="replyMessage" [rows]="6" placeholder="Type your reply..." class="w-full border-0 resize-none text-sm md:text-base shadow-none!"></textarea>
                        </div>

                        <div class="p-3 md:p-4 border-t border-surface-200 dark:border-surface-700 flex flex-col sm:flex-row items-stretch sm:items-center justify-between gap-3 sm:gap-0">
                            <div class="flex items-center gap-1 justify-center sm:justify-start">
                                <p-button icon="pi pi-paperclip" [text]="true" size="small" severity="secondary" pTooltip="Attach files" />
                                <p-button icon="pi pi-image" [text]="true" size="small" severity="secondary" pTooltip="Insert photo" />
                                <p-button icon="pi pi-link" [text]="true" size="small" severity="secondary" pTooltip="Insert link" styleClass="hidden sm:inline-flex" />
                                <p-button icon="pi pi-face-smile" [text]="true" size="small" severity="secondary" pTooltip="Insert emoji" styleClass="hidden sm:inline-flex" />
                            </div>
                            <div class="flex items-center gap-2">
                                <p-button label="Send" icon="pi pi-send" (onClick)="sendReply()" styleClass="w-full sm:w-auto" />
                            </div>
                        </div>
                    </div>
                </div>
            }

            <!-- Bottom Reply Button -->
            <div class="p-3 md:p-6 border-t border-surface-200 dark:border-surface-700 bg-surface-0 dark:bg-surface-900">
                <p-button label="Reply" severity="secondary" [outlined]="true" (onClick)="showReplyEditor = true" styleClass="w-full sm:w-auto">
                    <ng-template #icon>
                        <i class="pi pi-reply flip-icon-horizontal mr-2"></i>
                    </ng-template>
                </p-button>
            </div>
        </div>

        <p-menu #actionMenu [model]="actionMenuItems()" [popup]="true" appendTo="body" />

        <p-popover #recipientPanel styleClass="w-80">
            <div class="p-4">
                <div class="flex items-center gap-3 mb-4">
                    <p-avatar [label]="getAvatarInitials(currentEmail()?.sender || '')" size="normal" styleClass="w-10 h-10 bg-primary-100 text-primary-600" />
                    <div>
                        <div class="font-medium text-surface-900 dark:text-surface-0">{{ currentEmail()?.sender }}</div>
                        <div class="text-sm text-surface-500 dark:text-surface-400">&lt;{{ currentEmail()?.email }}&gt;</div>
                    </div>
                </div>
                <div class="space-y-2 text-sm">
                    <div><strong>From:</strong> {{ currentEmail()?.sender }} &lt;{{ currentEmail()?.email }}&gt;</div>
                    <div><strong>To:</strong> Robert Fox</div>
                    <div><strong>Date:</strong> {{ currentEmail()?.thread?.[0]?.time }}</div>
                    <div><strong>Subject:</strong> {{ currentEmail()?.subject }}</div>
                </div>
            </div>
        </p-popover>
    `
})
export class MailDetail implements OnInit {
    @ViewChild('actionMenu') actionMenu!: Menu;
    @ViewChild('recipientPanel') recipientPanel!: Popover;

    private mailService = inject(MailService);
    private router = inject(Router);
    private route = inject(ActivatedRoute);

    emailId = signal<number | null>(null);
    fromView = signal<string>('Inbox');

    replyMessage = '';
    showReplyEditor = false;

    async ngOnInit() {
        await this.mailService.loadEmails();

        const id = this.route.snapshot.params['id'];
        this.emailId.set(parseInt(id));
        this.fromView.set(this.route.snapshot.queryParams['from'] || 'Inbox');
    }

    currentEmail = computed(() => {
        const id = this.emailId();
        if (!id) return null;
        return this.mailService.getEmailById(id);
    });

    actionMenuItems = computed<MenuItem[]>(() => {
        const email = this.currentEmail();
        const isInTrash = email?.deleted;

        if (isInTrash) {
            return [{ label: 'Recover', icon: 'pi pi-replay', command: () => this.recoverEmail() }];
        }

        return [
            { label: 'Forward', icon: 'pi pi-reply', command: () => {} },
            {
                label: email?.archived ? 'Unarchive' : 'Archive',
                icon: email?.archived ? 'pi pi-replay' : 'pi pi-inbox',
                command: () => (email?.archived ? this.unarchiveEmail() : this.archiveEmail())
            },
            { label: 'Mark as Spam', icon: 'pi pi-ban', command: () => this.markAsSpam() },
            { label: 'Delete', icon: 'pi pi-trash', command: () => this.deleteEmail() }
        ];
    });

    getAvatarInitials(name: string): string {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    }

    goBack() {
        this.router.navigate(['/apps/mail/inbox'], { queryParams: { view: this.fromView() } });
    }

    toggleReply() {
        this.showReplyEditor = !this.showReplyEditor;
    }

    sendReply() {
        this.showReplyEditor = false;
        this.replyMessage = '';
    }

    toggleStar() {
        const email = this.currentEmail();
        if (email) {
            this.mailService.toggleStar(email.id);
        }
    }

    toggleImportant() {
        const email = this.currentEmail();
        if (email) {
            this.mailService.toggleImportant(email.id);
        }
    }

    archiveEmail() {
        const email = this.currentEmail();
        if (email) {
            this.mailService.archiveEmail(email.id);
            this.goBack();
        }
    }

    unarchiveEmail() {
        const email = this.currentEmail();
        if (email) {
            this.mailService.unarchiveEmail(email.id);
        }
    }

    markAsSpam() {
        const email = this.currentEmail();
        if (email) {
            this.mailService.markAsSpam(email.id);
            this.goBack();
        }
    }

    deleteEmail() {
        const email = this.currentEmail();
        if (email) {
            this.mailService.deleteEmail(email.id);
            this.goBack();
        }
    }

    recoverEmail() {
        const email = this.currentEmail();
        if (email) {
            this.mailService.recoverEmail(email.id);
            this.goBack();
        }
    }

    showActionMenu(event: Event) {
        this.actionMenu.toggle(event);
    }

    showRecipientDetails(event: Event) {
        this.recipientPanel.toggle(event);
    }
}
