import { Component, EventEmitter, Input, Output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { AvatarModule } from 'primeng/avatar';
import { TagModule } from 'primeng/tag';

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

@Component({
    selector: 'app-chat-sidebar',
    standalone: true,
    imports: [CommonModule, ButtonModule, AvatarModule, TagModule],
    template: `
        <div class="h-full">
            <!-- Contact Info Panel (Collapsible) -->
            @if (showContactInfo) {
                <div class="h-full">
                    <!-- Backdrop for mobile/tablet -->
                    <div class="xl:hidden! absolute inset-0 bg-black/50 z-40" (click)="toggleContactInfo()"></div>

                    <!-- Sidebar Content -->
                    <div
                        class="h-full bg-surface-0 dark:bg-surface-900 flex flex-col overflow-hidden w-full xl:w-80 fixed xl:relative inset-y-0 right-0 xl:inset-auto z-50 xl:z-auto border-l-0 xl:border-l border-surface-200 dark:border-surface-700 shadow-none"
                    >
                        <!-- Header with Close Button -->
                        <div class="p-6 border-b border-surface-200 dark:border-surface-700 shrink-0">
                            <!-- Close Button -->
                            <p-button icon="pi pi-times" [text]="true" severity="secondary" size="small" styleClass="absolute! top-4 right-4 z-10" [rounded]="true" (onClick)="toggleContactInfo()" />
                            <h3 class="text-lg font-medium text-surface-900 dark:text-surface-0">Group Info</h3>
                        </div>

                        <!-- Scrollable Content -->
                        <div class="flex-1 overflow-y-auto p-6">
                            <div class="space-y-4">
                                @for (participant of activeChat?.participants; track participant.id) {
                                    <div class="flex items-center gap-3">
                                        @if (participant.avatar) {
                                            <p-avatar [image]="'/demo/images/avatar/' + participant.avatar" size="normal" shape="circle" styleClass="w-10 h-10 cursor-pointer" (click)="openUserProfile(participant.id)" />
                                        } @else {
                                            <p-avatar [label]="getAvatarInitials(participant.name)" size="normal" shape="circle" styleClass="w-10 h-10 bg-primary-100 text-primary-600 cursor-pointer" (click)="openUserProfile(participant.id)" />
                                        }
                                        <div class="flex-1">
                                            <p class="text-base font-medium text-surface-900 dark:text-surface-0">{{ participant.name }}</p>
                                            <p class="text-sm text-surface-500 dark:text-surface-400 capitalize">{{ participant.status }}</p>
                                        </div>
                                    </div>
                                }
                            </div>
                        </div>
                    </div>
                </div>
            }

            <!-- User Profile Panel -->
            @if (showUserProfile && selectedUser) {
                <div class="h-full">
                    <!-- Backdrop for mobile/tablet -->
                    <div class="xl:hidden! absolute inset-0 bg-black/50 z-40" (click)="closeUserProfile()"></div>

                    <!-- Sidebar Content -->
                    <div
                        class="h-full bg-surface-0 dark:bg-surface-900 flex flex-col overflow-hidden w-full xl:w-80 fixed xl:relative inset-y-0 right-0 xl:inset-auto z-1000 xl:z-auto border-l-0 xl:border-l border-surface-200 dark:border-surface-700 shadow-none"
                    >
                        <!-- Profile Header -->
                        <div class="p-6 border-b border-surface-200 dark:border-surface-700 flex flex-col items-center gap-6">
                            <!-- Close Button -->
                            <p-button icon="pi pi-times" [text]="true" severity="secondary" size="small" styleClass="absolute! top-4 right-4 z-10" [rounded]="true" (onClick)="closeUserProfile()" />

                            <div class="flex flex-col items-center gap-4">
                                @if (selectedUser.avatar) {
                                    <p-avatar [image]="'/demo/images/avatar/' + selectedUser.avatar" size="large" shape="circle" styleClass="w-16 h-16" />
                                } @else {
                                    <p-avatar [label]="getAvatarInitials(selectedUser.name)" size="large" shape="circle" styleClass="w-16 h-16 bg-primary-100 text-primary-600" />
                                }
                                <h3 class="text-xl font-medium text-surface-900 dark:text-surface-0">{{ selectedUser.name }}</h3>
                            </div>

                            <!-- Action Buttons -->
                            <div class="flex items-center justify-center gap-2 w-full">
                                <p-button icon="pi pi-phone" severity="secondary" [rounded]="true" />
                                <p-button icon="pi pi-video" severity="secondary" [rounded]="true" />
                                <p-button icon="pi pi-ellipsis-h" severity="secondary" [rounded]="true" />
                            </div>
                        </div>

                        <!-- Main Info Section -->
                        <div class="px-4 pt-4">
                            <h4 class="text-base font-medium text-surface-900 dark:text-surface-0">Main info</h4>
                        </div>

                        <!-- Info Items -->
                        <div class="flex-1 overflow-y-auto">
                            <!-- Company -->
                            <div class="px-4 py-4 flex items-center gap-2">
                                <i class="pi pi-building text-surface-500 dark:text-surface-400 text-xs"></i>
                                <span class="flex-1 text-sm text-surface-500 dark:text-surface-400">Company</span>
                                <span class="text-sm font-medium text-surface-900 dark:text-surface-0">{{ selectedUser.company }}</span>
                            </div>
                            <div class="mx-4 h-px bg-surface-200 dark:bg-surface-700"></div>

                            <!-- Role -->
                            <div class="px-4 py-4 flex items-center gap-2">
                                <i class="pi pi-user text-surface-500 dark:text-surface-400 text-xs"></i>
                                <span class="flex-1 text-sm text-surface-500 dark:text-surface-400">Role</span>
                                <span class="text-sm font-medium text-surface-900 dark:text-surface-0">{{ selectedUser.role }}</span>
                            </div>
                            <div class="mx-4 h-px bg-surface-200 dark:bg-surface-700"></div>

                            <!-- Phone -->
                            <div class="px-4 py-4 flex items-center gap-2">
                                <i class="pi pi-phone text-surface-500 dark:text-surface-400 text-xs"></i>
                                <span class="flex-1 text-sm text-surface-500 dark:text-surface-400">Phone</span>
                                <span class="text-sm font-medium text-surface-900 dark:text-surface-0">{{ selectedUser.phone }}</span>
                            </div>
                            <div class="mx-4 h-px bg-surface-200 dark:bg-surface-700"></div>

                            <!-- Email -->
                            <div class="px-4 py-4 flex items-center gap-2">
                                <i class="pi pi-envelope text-surface-500 dark:text-surface-400 text-xs"></i>
                                <span class="flex-1 text-sm text-surface-500 dark:text-surface-400">Email</span>
                                <span class="text-sm font-medium text-surface-900 dark:text-surface-0">{{ selectedUser.email }}</span>
                            </div>
                            <div class="mx-4 h-px bg-surface-200 dark:bg-surface-700"></div>

                            <!-- First Contact -->
                            <div class="px-4 py-4 flex items-center gap-2">
                                <i class="pi pi-calendar text-surface-500 dark:text-surface-400 text-xs"></i>
                                <span class="flex-1 text-sm text-surface-500 dark:text-surface-400">First contact</span>
                                <span class="text-sm font-medium text-surface-900 dark:text-surface-0">{{ selectedUser.firstContact }}</span>
                            </div>
                            <div class="mx-4 h-px bg-surface-200 dark:bg-surface-700"></div>

                            <!-- Created By -->
                            <div class="px-4 py-4 flex items-center gap-2">
                                <i class="pi pi-user-plus text-surface-500 dark:text-surface-400 text-xs"></i>
                                <span class="flex-1 text-sm text-surface-500 dark:text-surface-400">Created by</span>
                                <span class="text-sm font-medium text-surface-900 dark:text-surface-0">{{ selectedUser.createdBy }}</span>
                            </div>
                            <div class="mx-4 h-px bg-surface-200 dark:bg-surface-700"></div>

                            <!-- Status -->
                            <div class="px-4 py-4 flex items-center gap-2">
                                <i class="pi pi-circle text-surface-500 dark:text-surface-400 text-xs"></i>
                                <span class="flex-1 text-sm text-surface-500 dark:text-surface-400">Status</span>
                                <p-tag [value]="selectedUser.statusTag || ''" [severity]="selectedUser.statusTag === 'Active' ? 'success' : 'secondary'" />
                            </div>
                            <div class="mx-4 h-px bg-surface-200 dark:bg-surface-700"></div>

                            <!-- Access -->
                            <div class="px-4 py-4 flex items-center gap-2">
                                <i class="pi pi-lock text-surface-500 dark:text-surface-400 text-xs"></i>
                                <span class="flex-1 text-sm text-surface-500 dark:text-surface-400">Access</span>
                                <p-tag [value]="selectedUser.access || ''" severity="secondary" />
                            </div>

                            <!-- Linked Threads Section -->
                            <div class="px-4 pt-4 pb-2">
                                <h4 class="text-base font-medium text-surface-900 dark:text-surface-0">Linked threads</h4>
                            </div>

                            <!-- Linked Threads Items -->
                            @for (thread of selectedUser.linkedThreads; track thread) {
                                <div class="px-4 py-2 flex items-center gap-2">
                                    <i class="pi pi-link text-surface-500 dark:text-surface-400 text-xs"></i>
                                    <span class="text-sm text-surface-500 dark:text-surface-400">{{ thread }}</span>
                                </div>
                            }
                        </div>
                    </div>
                </div>
            }
        </div>
    `
})
export class ChatSidebar {
    @Input() showContactInfo = false;
    @Input() showUserProfile = false;
    @Input() activeChat: ChatRoom | null = null;
    @Input() selectedUser: SelectedUser | null = null;
    @Output() openUserProfileEvent = new EventEmitter<number>();
    @Output() closeUserProfileEvent = new EventEmitter<void>();
    @Output() toggleContactInfoEvent = new EventEmitter<void>();

    getAvatarInitials(name: string): string {
        return name
            .split(' ')
            .map((n) => n[0])
            .join('')
            .toUpperCase();
    }

    openUserProfile(userId: number) {
        this.openUserProfileEvent.emit(userId);
    }

    closeUserProfile() {
        this.closeUserProfileEvent.emit();
    }

    toggleContactInfo() {
        this.toggleContactInfoEvent.emit();
    }
}
