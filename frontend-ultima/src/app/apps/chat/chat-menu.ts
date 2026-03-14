import { Component, computed, EventEmitter, input, model, OnInit, Output, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { DialogModule } from 'primeng/dialog';
import { InputTextModule } from 'primeng/inputtext';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';
import { BadgeModule } from 'primeng/badge';
import { OverlayBadgeModule } from 'primeng/overlaybadge';

interface Participant {
    id: number;
    name: string;
    avatar?: string;
    status: string;
}

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

interface Contact {
    id: number;
    name: string;
    avatar?: string;
    role?: string;
    company?: string;
    status?: string;
}

interface OnlineUser {
    id: number;
    name: string;
    avatar: string;
    isViewed: boolean;
}

@Component({
    selector: 'app-chat-menu',
    standalone: true,
    imports: [CommonModule, FormsModule, ButtonModule, AvatarModule, DialogModule, InputTextModule, IconFieldModule, InputIconModule, BadgeModule, OverlayBadgeModule],
    template: `
        <div class="w-full md:w-[320px] h-full bg-surface-0 dark:bg-surface-900 md:border-r border-surface-200 dark:border-surface-700 flex flex-col overflow-hidden">
            <div class="flex-1 flex flex-col min-h-0">
                <!-- Online Users Stories Section -->
                <div class="border-b border-surface-200 dark:border-surface-700">
                    <div class="px-4 pt-4 pb-2 flex flex-col gap-4">
                        <!-- Header -->
                        <div class="flex justify-between items-center">
                            <h3 class="text-base font-medium text-surface-900 dark:text-surface-0">Online</h3>
                            <button class="text-base font-medium text-primary-600 dark:text-primary-400 cursor-pointer">See All</button>
                        </div>

                        <!-- Stories Avatars -->
                        <div class="flex gap-3 overflow-x-auto scrollbar-none p-1">
                            @for (user of onlineUsers; track user.id) {
                                <div
                                    class="shrink-0 p-0.5 rounded-full outline outline-2 outline-offset-[-1px] cursor-pointer"
                                    [ngClass]="user.isViewed ? 'outline-surface-300 dark:outline-surface-600' : 'outline-primary-600 dark:outline-primary-400'"
                                >
                                    <img [src]="'/demo/images/avatar/' + user.avatar" [alt]="user.name" class="w-10 h-10 rounded-full" />
                                </div>
                            }
                        </div>
                    </div>

                    <!-- Search and New Message Button -->
                    <div class="p-4 flex gap-2">
                        <p-iconfield class="flex-1">
                            <p-inputicon class="pi pi-search" />
                            <input pInputText [(ngModel)]="searchQuery" placeholder="Search" class="w-full" />
                        </p-iconfield>

                        <p-button icon="pi pi-plus" severity="secondary" [outlined]="true" styleClass="shrink-0" ariaLabel="New Message" (onClick)="openNewChatDialog()" />
                    </div>
                </div>

                <!-- Custom Tabs -->
                <div class="border-b border-surface-200 dark:border-surface-700">
                    <div class="flex">
                        <div class="flex-1 px-4 py-2 cursor-pointer transition-colors" [class.border-b-2]="activeTabIndex === 0" [class.border-primary-500]="activeTabIndex === 0" (click)="activeTabIndex = 0">
                            <div class="text-center">
                                <span class="text-base font-medium" [ngClass]="activeTabIndex === 0 ? 'text-primary-500' : 'text-surface-500 dark:text-surface-400'">All</span>
                            </div>
                        </div>
                        <div class="flex-1 px-4 py-2 cursor-pointer transition-colors" [class.border-b-2]="activeTabIndex === 1" [class.border-primary-500]="activeTabIndex === 1" (click)="activeTabIndex = 1">
                            <div class="text-center">
                                <span class="text-base font-medium" [ngClass]="activeTabIndex === 1 ? 'text-primary-500' : 'text-surface-500 dark:text-surface-400'">Group</span>
                            </div>
                        </div>
                        <div class="flex-1 px-4 py-2 cursor-pointer transition-colors" [class.border-b-2]="activeTabIndex === 2" [class.border-primary-500]="activeTabIndex === 2" (click)="activeTabIndex = 2">
                            <div class="text-center">
                                <span class="text-base font-medium" [ngClass]="activeTabIndex === 2 ? 'text-primary-500' : 'text-surface-500 dark:text-surface-400'">Unread</span>
                            </div>
                        </div>
                        @if (hasArchivedChats()) {
                            <div class="flex-1 px-4 py-2 cursor-pointer transition-colors" [class.border-b-2]="activeTabIndex === 3" [class.border-primary-500]="activeTabIndex === 3" (click)="activeTabIndex = 3">
                                <div class="text-center">
                                    <span class="text-base font-medium" [ngClass]="activeTabIndex === 3 ? 'text-primary-500' : 'text-surface-500 dark:text-surface-400'">Archived</span>
                                </div>
                            </div>
                        }
                    </div>
                </div>

                <!-- Tab Content -->
                <div class="flex-1 overflow-y-auto min-h-0 overscroll-contain">
                    <!-- All Tab -->
                    @if (activeTabIndex === 0) {
                        <div class="p-4 space-y-6">
                            <!-- Pinned Conversations Section -->
                            @if (pinnedChats().length > 0) {
                                <div>
                                    <h3 class="text-base font-medium text-surface-900 dark:text-surface-0 mb-3">Pinned</h3>
                                    <div class="space-y-2">
                                        @for (chat of pinnedChats(); track chat.id) {
                                            <ng-container *ngTemplateOutlet="chatItem; context: { chat: chat }"></ng-container>
                                        }
                                    </div>
                                </div>
                            }

                            <!-- All Messages Section -->
                            <div>
                                <h3 class="text-base font-medium text-surface-900 dark:text-surface-0 mb-3">All Messages</h3>
                                @if (allChats().length > 0) {
                                    <div class="space-y-2">
                                        @for (chat of allChats(); track chat.id) {
                                            <ng-container *ngTemplateOutlet="chatItem; context: { chat: chat }"></ng-container>
                                        }
                                    </div>
                                } @else if (searchQuery().trim()) {
                                    <div class="text-center py-8">
                                        <i class="pi pi-search text-surface-400 dark:text-surface-500 text-2xl mb-2"></i>
                                        <p class="text-surface-500 dark:text-surface-400 text-sm">No chats found for "{{ searchQuery() }}"</p>
                                    </div>
                                }
                            </div>
                        </div>
                    }

                    <!-- Group Tab -->
                    @if (activeTabIndex === 1) {
                        <div class="p-4">
                            @if (groupChats().length > 0) {
                                <div class="space-y-2">
                                    @for (chat of groupChats(); track chat.id) {
                                        <ng-container *ngTemplateOutlet="chatItem; context: { chat: chat }"></ng-container>
                                    }
                                </div>
                            } @else if (searchQuery().trim()) {
                                <div class="text-center py-8">
                                    <i class="pi pi-search text-surface-400 dark:text-surface-500 text-2xl mb-2"></i>
                                    <p class="text-surface-500 dark:text-surface-400 text-sm">No group chats found for "{{ searchQuery() }}"</p>
                                </div>
                            }
                        </div>
                    }

                    <!-- Unread Tab -->
                    @if (activeTabIndex === 2) {
                        <div class="p-4">
                            @if (unreadChats().length > 0) {
                                <div class="space-y-2">
                                    @for (chat of unreadChats(); track chat.id) {
                                        <ng-container *ngTemplateOutlet="chatItem; context: { chat: chat }"></ng-container>
                                    }
                                </div>
                            } @else if (searchQuery().trim()) {
                                <div class="text-center py-8">
                                    <i class="pi pi-search text-surface-400 dark:text-surface-500 text-2xl mb-2"></i>
                                    <p class="text-surface-500 dark:text-surface-400 text-sm">No unread chats found for "{{ searchQuery() }}"</p>
                                </div>
                            }
                        </div>
                    }

                    <!-- Archived Tab -->
                    @if (activeTabIndex === 3) {
                        <div class="p-4">
                            @if (archivedChats().length > 0) {
                                <div class="space-y-2">
                                    @for (chat of archivedChats(); track chat.id) {
                                        <ng-container *ngTemplateOutlet="chatItemArchived; context: { chat: chat }"></ng-container>
                                    }
                                </div>
                            } @else if (searchQuery().trim()) {
                                <div class="text-center py-8">
                                    <i class="pi pi-search text-surface-400 dark:text-surface-500 text-2xl mb-2"></i>
                                    <p class="text-surface-500 dark:text-surface-400 text-sm">No archived chats found for "{{ searchQuery() }}"</p>
                                </div>
                            }
                        </div>
                    }
                </div>
            </div>

            <!-- New Chat Dialog -->
            <p-dialog [(visible)]="showNewChatDialog" [modal]="true" header="New Message" [style]="{ width: '25rem' }">
                <div class="space-y-4">
                    <div class="text-sm text-surface-500 dark:text-surface-400 mb-4">Select a contact to start a conversation</div>

                    <div class="space-y-2 max-h-96 overflow-y-auto">
                        @for (contact of availableContacts(); track contact.id) {
                            <div class="p-3 rounded-xl flex items-center gap-3 cursor-pointer hover:bg-surface-100 dark:hover:bg-surface-700 transition-colors" (click)="selectContact(contact)">
                                @if (contact.avatar) {
                                    <p-avatar [image]="'/demo/images/avatar/' + contact.avatar" size="normal" shape="circle" styleClass="w-10 h-10" />
                                } @else {
                                    <p-avatar [label]="getAvatarInitials(contact.name)" size="normal" shape="circle" styleClass="w-10 h-10 bg-primary-100 text-primary-600" />
                                }

                                <div class="flex-1">
                                    <div class="text-base font-medium text-surface-900 dark:text-surface-0">{{ contact.name }}</div>
                                    <div class="text-sm text-surface-500 dark:text-surface-400">{{ contact.role }} at {{ contact.company }}</div>
                                </div>

                                <div class="text-xs text-surface-500 dark:text-surface-400 capitalize">{{ contact.status }}</div>
                            </div>
                        }
                    </div>
                </div>
            </p-dialog>
        </div>

        <!-- Chat Item Template -->
        <ng-template #chatItem let-chat="chat">
            <div
                class="p-4 relative rounded-2xl flex gap-3 cursor-pointer transition-colors"
                [ngClass]="activeChatId() === chat.id ? 'bg-surface-100 dark:bg-surface-700' : 'bg-surface-0 dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-700'"
                (click)="selectChat(chat)"
            >
                <div class="relative">
                    <!-- Group Chat Avatar -->
                    @if (chat.type === 'group' && chat.avatar) {
                        <div class="w-10 h-10">
                            <img [src]="'/demo/images/chat/' + encodeURIComponent(chat.avatar)" [alt]="chat.name" class="w-full h-full rounded-full object-contain" />
                        </div>
                    } @else if (chat.type === 'group') {
                        <!-- Fallback Group Chat Avatar -->
                        <div class="w-10 h-10 bg-surface-900 dark:bg-surface-100 rounded-full flex items-center justify-center">
                            <div class="grid grid-cols-2 gap-px">
                                <div class="w-2 h-2 bg-emerald-500 rounded-sm"></div>
                                <div class="w-2 h-2 bg-red-400 rounded-sm"></div>
                                <div class="w-2 h-2 bg-purple-500 rounded-sm"></div>
                                <div class="w-2 h-2 bg-cyan-400 rounded-sm"></div>
                            </div>
                        </div>
                    } @else {
                        <!-- Individual Chat Avatar -->
                        <div class="w-10 h-10">
                            <p-overlaybadge styleClass="inline-flex">
                                @if (chat.avatar) {
                                    <p-avatar [image]="'/demo/images/avatar/' + chat.avatar" size="normal" shape="circle" styleClass="p-overlay-badge w-10 h-10" />
                                } @else {
                                    <p-avatar [label]="getAvatarInitials(chat.name)" size="normal" shape="circle" styleClass="p-overlay-badge w-10 h-10 bg-primary-100 text-primary-600" />
                                }
                                <ng-template pTemplate="badge">
                                    <div class="w-2.5 h-2.5 bg-surface-300 dark:bg-surface-600 rounded-full"></div>
                                </ng-template>
                            </p-overlaybadge>
                        </div>
                    }
                </div>

                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-base font-medium text-surface-900 dark:text-surface-0 truncate">{{ chat.name }}</span>
                        <span class="text-sm text-surface-500 dark:text-surface-400">{{ getLastMessageTime(chat) }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <p class="text-sm text-surface-500 dark:text-surface-400 truncate flex-1">{{ chat.type === 'group' ? getLastMessageSender(chat) + ': ' : '' }}{{ getLastMessage(chat) }}</p>
                        @if (chat.unreadCount && chat.unreadCount > 0) {
                            <div class="w-5 h-5 shrink-0 bg-primary-500 rounded-full flex items-center justify-center">
                                <span class="text-xs font-bold text-white">{{ chat.unreadCount }}</span>
                            </div>
                        }
                        @if (chat.pinned) {
                            <i class="pi pi-thumbtack text-surface-400 dark:text-surface-500 text-xs shrink-0"></i>
                        }
                    </div>
                </div>
            </div>
        </ng-template>

        <!-- Chat Item Archived Template -->
        <ng-template #chatItemArchived let-chat="chat">
            <div
                class="p-4 relative rounded-2xl flex gap-3 cursor-pointer transition-colors"
                [ngClass]="activeChatId() === chat.id ? 'bg-surface-100 dark:bg-surface-700' : 'bg-surface-0 dark:bg-surface-900 hover:bg-surface-100 dark:hover:bg-surface-700'"
                (click)="selectChat(chat)"
            >
                <div class="relative">
                    @if (chat.type === 'group' && chat.avatar) {
                        <div class="w-10 h-10">
                            <img [src]="'/demo/images/chat/' + encodeURIComponent(chat.avatar)" [alt]="chat.name" class="w-full h-full rounded-full object-contain" />
                        </div>
                    } @else if (chat.type === 'group') {
                        <div class="w-10 h-10 bg-surface-900 dark:bg-surface-100 rounded-full flex items-center justify-center">
                            <div class="grid grid-cols-2 gap-px">
                                <div class="w-2 h-2 bg-emerald-500 rounded-sm"></div>
                                <div class="w-2 h-2 bg-red-400 rounded-sm"></div>
                                <div class="w-2 h-2 bg-purple-500 rounded-sm"></div>
                                <div class="w-2 h-2 bg-cyan-400 rounded-sm"></div>
                            </div>
                        </div>
                    } @else {
                        <div class="w-10 h-10">
                            <p-overlaybadge styleClass="inline-flex">
                                @if (chat.avatar) {
                                    <p-avatar [image]="'/demo/images/avatar/' + chat.avatar" size="normal" shape="circle" styleClass="p-overlay-badge w-10 h-10" />
                                } @else {
                                    <p-avatar [label]="getAvatarInitials(chat.name)" size="normal" shape="circle" styleClass="p-overlay-badge w-10 h-10 bg-primary-100 text-primary-600" />
                                }
                                <ng-template pTemplate="badge">
                                    <div class="w-2.5 h-2.5 bg-surface-300 dark:bg-surface-600 rounded-full"></div>
                                </ng-template>
                            </p-overlaybadge>
                        </div>
                    }
                </div>

                <div class="flex-1 min-w-0">
                    <div class="flex items-center justify-between mb-1">
                        <span class="text-base font-medium text-surface-900 dark:text-surface-0 truncate">{{ chat.name }}</span>
                        <span class="text-sm text-surface-500 dark:text-surface-400">{{ getLastMessageTime(chat) }}</span>
                    </div>
                    <div class="flex items-center gap-1">
                        <i class="pi pi-inbox text-surface-400 dark:text-surface-500 text-xs"></i>
                        <p class="text-sm text-surface-500 dark:text-surface-400 truncate flex-1">{{ chat.type === 'group' ? getLastMessageSender(chat) + ': ' : '' }}{{ getLastMessage(chat) }}</p>
                        @if (chat.pinned) {
                            <i class="pi pi-thumbtack text-surface-400 dark:text-surface-500 text-xs shrink-0"></i>
                        }
                    </div>
                </div>
            </div>
        </ng-template>
    `
})
export class ChatMenu implements OnInit {
    chatRooms = input<ChatRoom[]>([]);
    activeChatId = input<number | null>(null);
    @Output() selectChatEvent = new EventEmitter<number>();
    @Output() newChatEvent = new EventEmitter<Contact>();

    activeTabIndex = 0;
    showNewChatDialog = false;
    searchQuery = model('');
    userData = signal<Record<number, Contact>>({});

    onlineUsers: OnlineUser[] = [
        { id: 1, name: 'Amy Elsner', avatar: 'amyelsner.png', isViewed: false },
        { id: 2, name: 'Anna Fali', avatar: 'annafali.png', isViewed: false },
        { id: 3, name: 'Asiya Javayant', avatar: 'asiyajavayant.png', isViewed: false },
        { id: 4, name: 'Bernardo Dominic', avatar: 'bernardodominic.png', isViewed: false },
        { id: 5, name: 'Elwin Sharvill', avatar: 'elwinsharvill.png', isViewed: true },
        { id: 6, name: 'Ioni Bowcher', avatar: 'ionibowcher.png', isViewed: true },
        { id: 7, name: 'Ivan Magalhaes', avatar: 'ivanmagalhaes.png', isViewed: true }
    ];

    async ngOnInit() {
        const response = await fetch('/demo/data/chatData.json');
        const data = await response.json();
        this.userData.set(data.userData);
    }

    getAvatarInitials(name: string): string {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    }

    selectChat(chat: ChatRoom) {
        this.selectChatEvent.emit(chat.id);
    }

    openNewChatDialog() {
        this.showNewChatDialog = true;
    }

    selectContact(contact: Contact) {
        const existingChat = this.chatRooms().find((chat) => chat.type === 'individual' && chat.name === contact.name);

        if (existingChat) {
            this.selectChatEvent.emit(existingChat.id);
        } else {
            this.newChatEvent.emit(contact);
        }

        this.showNewChatDialog = false;
    }

    filterChatsBySearch(chats: ChatRoom[]): ChatRoom[] {
        if (!this.searchQuery().trim()) return chats;
        const query = this.searchQuery().toLowerCase().trim();
        return chats.filter((chat) => chat.name.toLowerCase().includes(query));
    }

    pinnedChats = computed(() => {
        const pinnedChatsList = this.chatRooms().filter((chat) => chat.pinned && !chat.archived);
        return this.filterChatsBySearch(pinnedChatsList);
    });

    allChats = computed(() => {
        const nonArchivedChats = this.chatRooms().filter((chat) => !chat.archived);
        return this.filterChatsBySearch(nonArchivedChats);
    });

    groupChats = computed(() => {
        const nonArchivedGroupChats = this.chatRooms().filter((chat) => chat.type === 'group' && !chat.archived);
        return this.filterChatsBySearch(nonArchivedGroupChats);
    });

    unreadChats = computed(() => {
        const nonArchivedUnreadChats = this.chatRooms().filter((chat) => (chat.unreadCount ?? 0) > 0 && !chat.archived);
        return this.filterChatsBySearch(nonArchivedUnreadChats);
    });

    archivedChats = computed(() => {
        const archivedChatList = this.chatRooms().filter((chat) => chat.archived);
        return this.filterChatsBySearch(archivedChatList);
    });

    hasArchivedChats = computed(() => this.archivedChats().length > 0);

    availableContacts = computed(() => {
        return Object.values(this.userData());
    });

    getLastMessage(chat: ChatRoom): string {
        if (!chat.messages || chat.messages.length === 0) {
            return 'Start conversation';
        }
        const lastMessage = chat.messages[chat.messages.length - 1];
        return lastMessage.content;
    }

    getLastMessageSender(chat: ChatRoom): string {
        if (!chat.messages || chat.messages.length === 0) {
            return '';
        }
        const lastMessage = chat.messages[chat.messages.length - 1];
        return lastMessage.senderId === 'me' ? 'You' : lastMessage.senderName;
    }

    getLastMessageTime(chat: ChatRoom): string {
        if (!chat.messages || chat.messages.length === 0) {
            return '';
        }
        const lastMessage = chat.messages[chat.messages.length - 1];
        return lastMessage.time;
    }

    encodeURIComponent(str: string): string {
        return encodeURIComponent(str);
    }
}
