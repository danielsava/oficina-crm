import { AfterViewChecked, Component, ElementRef, EventEmitter, Input, model, Output, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { InputTextModule } from 'primeng/inputtext';

interface Message {
    id: number;
    senderId: string | number;
    senderName: string;
    senderAvatar?: string;
    content: string;
    timestamp: string;
    time: string;
    type: string;
    isNewDay?: boolean;
    dateLabel?: string;
}

interface Participant {
    id: number;
    name: string;
    avatar?: string;
    status: string;
}

interface ChatRoom {
    id: number;
    name: string;
    type: string;
    avatar?: string;
    archived?: boolean;
    pinned?: boolean;
    participants?: Participant[];
    lastMessage?: string;
    lastMessageSender?: string;
    lastMessageTime?: string;
    unreadCount?: number;
    messages: Message[];
}

interface CurrentUser {
    id: string;
    name: string;
    avatar?: string;
}

@Component({
    selector: 'app-chat-box',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, AvatarModule, InputTextModule],
    template: `
        <div class="flex-1 flex flex-col h-full min-h-0">
            <!-- Messages List -->
            <div #messagesContainer class="flex-1 overflow-y-auto p-4 xl:p-6 space-y-4 xl:space-y-6 min-h-0 overscroll-contain">
                @for (message of activeChat?.messages; track message.id) {
                    <!-- Date Separator -->
                    @if (message.isNewDay) {
                        <div class="flex items-center gap-4 xl:gap-6 mb-4 xl:mb-6">
                            <div class="flex-1 h-px bg-surface-200 dark:bg-surface-700"></div>
                            <span class="text-xs xl:text-sm text-surface-500 dark:text-surface-400">{{ message.dateLabel }}</span>
                            <div class="flex-1 h-px bg-surface-200 dark:bg-surface-700"></div>
                        </div>
                    }

                    <!-- Message -->
                    @if (message.senderId === 'me') {
                        <div class="flex justify-end items-start gap-2 xl:gap-4 pl-8 xl:pl-16">
                            <span class="text-xs text-surface-500 dark:text-surface-400 mt-2">{{ message.time }}</span>
                            <div class="px-3 py-2 bg-primary-100 dark:bg-primary-900 rounded-xl max-w-xs xl:max-w-sm">
                                <p class="text-sm text-surface-900 dark:text-surface-0 break-words overflow-wrap-anywhere">{{ message.content }}</p>
                            </div>
                        </div>
                    } @else {
                        <div class="flex justify-start items-start gap-2 xl:gap-4 pr-8 xl:pr-16">
                            @if (message.senderAvatar) {
                                <p-avatar [image]="'/demo/images/avatar/' + message.senderAvatar" size="normal" shape="circle" styleClass="w-6 h-6 xl:w-8 xl:h-8 cursor-pointer shrink-0!" (click)="openUserProfile(message.senderId)" />
                            } @else {
                                <p-avatar [label]="getAvatarInitials(message.senderName)" size="normal" shape="circle" styleClass="w-6 h-6 xl:w-8 xl:h-8 bg-primary-100 text-primary-600 cursor-pointer" (click)="openUserProfile(message.senderId)" />
                            }
                            <div class="px-3 py-2 bg-surface-100 dark:bg-surface-700 rounded-xl max-w-xs xl:max-w-sm">
                                <p class="text-sm text-surface-900 dark:text-surface-0 break-words overflow-wrap-anywhere">{{ message.content }}</p>
                            </div>
                            <span class="text-xs text-surface-500 dark:text-surface-400 mt-2">{{ message.time }}</span>
                        </div>
                    }
                }
            </div>

            <!-- Message Input -->
            <div class="px-4 xl:px-6 py-3 xl:py-5 border-t border-surface-200 dark:border-surface-700 flex items-center gap-2 xl:gap-4 shrink-0">
                <input pInputText [(ngModel)]="newMessage" placeholder="Write a message" class="flex-1" (keyup.enter)="sendMessage()" />
                <div class="flex items-center gap-2 xl:gap-3">
                    <!-- Mobile + Tablet: Single attach button -->
                    <p-button icon="pi pi-paperclip" severity="secondary" [outlined]="true" size="small" styleClass="xl:hidden!" />

                    <!-- Desktop: Two separate buttons -->
                    <div class="hidden! xl:flex! items-center gap-2">
                        <p-button icon="pi pi-paperclip" severity="secondary" [outlined]="true" />
                        <p-button icon="pi pi-image" severity="secondary" [outlined]="true" />
                    </div>

                    <div class="w-px h-4 bg-surface-200 dark:bg-surface-700 hidden! xl:block!"></div>

                    <!-- Mobile + Tablet: Icon only send button -->
                    <p-button icon="pi pi-send" severity="primary" size="small" styleClass="xl:hidden!" (onClick)="sendMessage()" />

                    <!-- Desktop: Send button with label -->
                    <p-button label="Send" icon="pi pi-send" styleClass="hidden! xl:flex!" (onClick)="sendMessage()" />
                </div>
            </div>
        </div>
    `,
    host: {
        class: 'flex flex-1'
    }
})
export class ChatBox implements AfterViewChecked {
    @Input() activeChat: ChatRoom | null = null;
    @Input() currentUser: CurrentUser = { id: 'me', name: 'You' };
    @Output() openUserProfileEvent = new EventEmitter<string | number>();
    @Output() sendMessageEvent = new EventEmitter<Message>();

    @ViewChild('messagesContainer') messagesContainer!: ElementRef;

    newMessage = model('');
    private shouldScrollToBottom = false;

    ngAfterViewChecked() {
        if (this.shouldScrollToBottom) {
            this.scrollToBottom();
            this.shouldScrollToBottom = false;
        }
    }

    scrollToBottom() {
        if (this.messagesContainer?.nativeElement) {
            this.messagesContainer.nativeElement.scrollTop = this.messagesContainer.nativeElement.scrollHeight;
        }
    }

    sendMessage() {
        if (!this.newMessage().trim()) return;

        const message: Message = {
            id: Date.now(),
            senderId: this.currentUser.id,
            senderName: this.currentUser.name,
            content: this.newMessage().trim(),
            timestamp: new Date().toISOString(),
            time: new Date().toLocaleTimeString('en-US', { hour: '2-digit', minute: '2-digit' }),
            type: 'text'
        };

        this.sendMessageEvent.emit(message);
        this.newMessage.set('');
        this.shouldScrollToBottom = true;
    }

    getAvatarInitials(name: string): string {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    }

    openUserProfile(userId: string | number) {
        this.openUserProfileEvent.emit(userId);
    }
}
