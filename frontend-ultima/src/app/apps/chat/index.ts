import { Component, computed, OnInit, signal, ViewChild } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { MenuModule } from 'primeng/menu';
import { ConfirmDialogModule } from 'primeng/confirmdialog';
import { ConfirmationService, MenuItem } from 'primeng/api';
import { Menu } from 'primeng/menu';
import { ChatMenu } from './chat-menu';
import { ChatBox } from './chatbox';
import { ChatSidebar } from './chatsidebar';

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

interface CurrentUser {
    id: string;
    name: string;
    avatar?: string;
}

interface SelectedUser {
    id: number;
    name: string;
    avatar?: string;
    company?: string;
    role?: string;
    phone?: string;
    email?: string;
    firstContact?: string;
    createdBy?: string;
    statusTag?: string;
    access?: string;
    linkedThreads?: string[];
}

interface Contact {
    id: number;
    name: string;
    avatar?: string;
    role?: string;
    company?: string;
    status?: string;
}

@Component({
    selector: 'app-chat',
    standalone: true,
    imports: [CommonModule, ButtonModule, MenuModule, ConfirmDialogModule, ChatMenu, ChatBox, ChatSidebar],
    providers: [ConfirmationService],
    template: `
        <div class="flex card overflow-hidden" style="height: 70vh; min-height: 500px; max-height: 800px">
            <div [ngClass]="{ 'hidden md:block': showChatView, 'block w-full md:w-auto': !showChatView }" class="md:block h-full overflow-hidden">
                <app-chat-menu [chatRooms]="chatRooms()" [activeChatId]="activeChatId()" (selectChatEvent)="selectChat($event)" (newChatEvent)="createNewChat($event)" />
            </div>

            <div [ngClass]="{ flex: showChatView, 'hidden md:flex': !showChatView }" class="flex-1 flex-col h-full min-h-0">
                <div class="px-4 xl:px-6 py-3 xl:py-4 border-b border-surface-200 dark:border-surface-700 flex justify-between items-center shrink-0">
                    <div class="flex items-center gap-2 xl:gap-3">
                        <p-button icon="pi pi-arrow-left" [text]="true" severity="secondary" styleClass="md:hidden!" size="small" (onClick)="goBackToMenu()" ariaLabel="Back to chats" />

                        @if (activeChat()?.type === 'group' && activeChat()?.avatar) {
                            <div class="w-8 h-8 xl:w-10 xl:h-10 cursor-pointer overflow-hidden" (click)="toggleContactInfo()">
                                <img [src]="'/demo/images/chat/' + encodeURIComponent(activeChat()!.avatar!)" [alt]="activeChat()?.name" class="w-full h-full rounded-full object-contain" />
                            </div>
                        } @else if (activeChat()?.type === 'individual' && activeChat()?.avatar) {
                            <div class="w-8 h-8 xl:w-10 xl:h-10 cursor-pointer overflow-hidden" (click)="toggleContactInfo()">
                                <img [src]="'/demo/images/avatar/' + activeChat()!.avatar" [alt]="activeChat()?.name" class="w-full h-full rounded-full object-cover" />
                            </div>
                        } @else {
                            <div class="w-8 h-8 xl:w-10 xl:h-10 bg-surface-900 dark:bg-surface-100 rounded-full flex items-center justify-center cursor-pointer" (click)="toggleContactInfo()">
                                <div class="grid grid-cols-2 gap-px">
                                    <div class="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-emerald-500 rounded-sm"></div>
                                    <div class="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-red-400 rounded-sm"></div>
                                    <div class="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-purple-500 rounded-sm"></div>
                                    <div class="w-1.5 h-1.5 xl:w-2 xl:h-2 bg-cyan-400 rounded-sm"></div>
                                </div>
                            </div>
                        }
                        <div class="flex flex-col cursor-pointer" (click)="toggleContactInfo()">
                            <h3 class="text-sm xl:text-base font-medium text-surface-900 dark:text-surface-0 hover:text-primary-600 dark:hover:text-primary-400 transition-colors">
                                {{ activeChat()?.name }}
                            </h3>
                            @if (activeChat()?.type === 'group') {
                                <p class="text-xs xl:text-sm text-surface-500 dark:text-surface-400 truncate">{{ formatParticipants(activeChat()?.participants || []) }}</p>
                            }
                        </div>
                    </div>
                    <div class="flex items-center gap-2 xl:gap-3">
                        <p-button icon="pi pi-video" severity="secondary" [outlined]="true" size="small" styleClass="xl:size-normal" />
                        <div>
                            <p-menu #menu [model]="menuItems()" [popup]="true" appendTo="body" />
                            <p-button icon="pi pi-ellipsis-v" severity="secondary" [outlined]="true" size="small" styleClass="xl:size-normal" (onClick)="showMenu($event)" />
                        </div>
                    </div>
                </div>

                <div class="flex-1 flex relative overflow-hidden min-h-0">
                    <app-chat-box [activeChat]="activeChat()" [currentUser]="currentUser()" (openUserProfileEvent)="openUserProfile($event)" (sendMessageEvent)="handleSendMessage($event)" />

                    <app-chat-sidebar
                        [showContactInfo]="showContactInfo"
                        [showUserProfile]="showUserProfile"
                        [activeChat]="activeChat()"
                        [selectedUser]="selectedUser()"
                        (openUserProfileEvent)="openUserProfile($event)"
                        (closeUserProfileEvent)="closeUserProfile()"
                        (toggleContactInfoEvent)="toggleContactInfo()"
                    />
                </div>
            </div>

            <p-confirmdialog />
        </div>
    `
})
export class Chat implements OnInit {
    @ViewChild('menu') menu!: Menu;

    chatRooms = signal<ChatRoom[]>([]);
    currentUser = signal<CurrentUser>({ id: 'me', name: 'You' });
    userData = signal<Record<number, SelectedUser>>({});
    activeChatId = signal<number | null>(1);
    showContactInfo = false;
    showUserProfile = false;
    selectedUserId = signal<number | null>(null);
    showChatView = false;

    activeChat = computed(() => {
        return this.chatRooms().find((chat) => chat.id === this.activeChatId()) ?? null;
    });

    selectedUser = computed(() => {
        const userId = this.selectedUserId();
        return userId ? this.userData()[userId] : null;
    });

    menuItems = computed<MenuItem[]>(() => {
        this.chatRooms();
        const chat = this.activeChat();
        return [
            {
                label: chat?.pinned ? 'Unpin Chat' : 'Pin Chat',
                icon: 'pi pi-thumbtack',
                command: () => this.togglePin()
            },
            {
                label: 'Delete Chat',
                icon: 'pi pi-trash',
                command: () => this.deleteChat()
            },
            {
                label: chat?.archived ? 'Restore Chat' : 'Archive Chat',
                icon: chat?.archived ? 'pi pi-replay' : 'pi pi-inbox',
                command: () => (chat?.archived ? this.restoreChat() : this.archiveChat())
            }
        ];
    });

    constructor(private confirmationService: ConfirmationService) {}

    async ngOnInit() {
        const response = await fetch('/demo/data/chatData.json');
        const data = await response.json();
        this.chatRooms.set(data.chatRooms);
        this.currentUser.set(data.currentUser);
        this.userData.set(data.userData);
    }

    deleteChat() {
        this.confirmationService.confirm({
            message: `Are you sure you want to delete "${this.activeChat()?.name}"? This action cannot be undone.`,
            header: 'Delete Chat',
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
                const rooms = this.chatRooms();
                const chatIndex = rooms.findIndex((chat) => chat.id === this.activeChatId());
                if (chatIndex !== -1) {
                    rooms.splice(chatIndex, 1);
                    this.chatRooms.set([...rooms]);
                    if (rooms.length > 0) {
                        this.activeChatId.set(rooms[0].id);
                    } else {
                        this.activeChatId.set(null);
                        this.showChatView = false;
                    }
                }
            }
        });
    }

    archiveChat() {
        const rooms = this.chatRooms();
        const chat = rooms.find((c) => c.id === this.activeChatId());
        if (chat) {
            chat.archived = true;
            this.chatRooms.set([...rooms]);
            const availableChats = rooms.filter((c) => !c.archived);
            if (availableChats.length > 0) {
                this.activeChatId.set(availableChats[0].id);
            } else {
                this.activeChatId.set(null);
                this.showChatView = false;
            }
        }
    }

    restoreChat() {
        const rooms = this.chatRooms();
        const chat = rooms.find((c) => c.id === this.activeChatId());
        if (chat) {
            chat.archived = false;
            this.chatRooms.set([...rooms]);
        }
    }

    togglePin() {
        const rooms = this.chatRooms();
        const chat = rooms.find((c) => c.id === this.activeChatId());
        if (chat) {
            chat.pinned = !chat.pinned;
            this.chatRooms.set([...rooms]);
        }
    }

    formatParticipants(participants: Participant[]): string {
        if (participants.length <= 3) {
            return participants.map((p) => p.name).join(', ');
        }
        const first3 = participants
            .slice(0, 3)
            .map((p) => p.name)
            .join(', ');
        return `${first3} ...`;
    }

    toggleContactInfo() {
        if (this.activeChat()?.type === 'individual') {
            if (this.showUserProfile) {
                this.closeUserProfile();
            } else {
                const participant = this.activeChat()?.participants?.[0];
                if (participant) {
                    this.openUserProfile(participant.id);
                }
            }
        } else {
            this.showContactInfo = !this.showContactInfo;
            this.showUserProfile = false;
        }
    }

    openUserProfile(userId: string | number) {
        this.selectedUserId.set(Number(userId));
        this.showUserProfile = true;
        this.showContactInfo = false;
    }

    closeUserProfile() {
        this.showUserProfile = false;
        this.selectedUserId.set(null);
    }

    showMenu(event: Event) {
        this.menu.toggle(event);
    }

    selectChat(chatId: number) {
        this.activeChatId.set(chatId);
        this.showChatView = true;
    }

    goBackToMenu() {
        this.showChatView = false;
    }

    createNewChat(contact: Contact) {
        const rooms = this.chatRooms();
        const newChatId = Math.max(...rooms.map((c) => c.id)) + 1;

        const newChat: ChatRoom = {
            id: newChatId,
            name: contact.name,
            type: 'individual',
            archived: false,
            avatar: contact.avatar,
            lastMessage: 'Start a conversation...',
            lastMessageSender: undefined,
            lastMessageTime: 'Now',
            unreadCount: 0,
            messages: []
        };

        this.chatRooms.set([newChat, ...rooms]);
        this.activeChatId.set(newChatId);
        this.showChatView = true;
    }

    handleSendMessage(message: Message) {
        const rooms = this.chatRooms();
        const chat = rooms.find((c) => c.id === this.activeChatId());
        if (chat) {
            chat.messages.push(message);
            this.chatRooms.set([...rooms]);
        }
    }

    encodeURIComponent(str: string): string {
        return encodeURIComponent(str);
    }
}
