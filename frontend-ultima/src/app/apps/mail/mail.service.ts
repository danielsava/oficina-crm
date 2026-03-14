import { Injectable, signal, computed } from '@angular/core';

export interface ThreadMessage {
    id: number;
    sender: string;
    email: string;
    avatar?: string;
    time: string;
    content?: string;
}

export interface Email {
    id: number;
    sender: string;
    email: string;
    avatar?: string;
    subject: string;
    preview: string;
    time: string;
    tag?: string;
    read: boolean;
    starred: boolean;
    important: boolean;
    archived: boolean;
    spam: boolean;
    deleted: boolean;
    category?: string;
    thread?: ThreadMessage[];
    fullContent?: string;
}

@Injectable({
    providedIn: 'root'
})
export class MailService {
    private _emailsData = signal<Email[]>([]);
    private _loaded = signal(false);

    emailsData = this._emailsData.asReadonly();
    loaded = this._loaded.asReadonly();

    async loadEmails() {
        if (this._loaded()) return;

        const response = await fetch('/demo/data/emailData.json');
        const data = await response.json();
        this._emailsData.set(data.emails);
        this._loaded.set(true);
    }

    getEmailById(id: number): Email | null {
        return this._emailsData().find((email) => email.id === id) ?? null;
    }

    updateEmail(id: number, updates: Partial<Email>) {
        const emails = this._emailsData();
        const emailIndex = emails.findIndex((e) => e.id === id);
        if (emailIndex !== -1) {
            emails[emailIndex] = { ...emails[emailIndex], ...updates };
            this._emailsData.set([...emails]);
        }
    }

    markAsRead(id: number) {
        this.updateEmail(id, { read: true });
    }

    markAsUnread(id: number) {
        this.updateEmail(id, { read: false });
    }

    toggleStar(id: number) {
        const email = this.getEmailById(id);
        if (email) {
            this.updateEmail(id, { starred: !email.starred });
        }
    }

    toggleImportant(id: number) {
        const email = this.getEmailById(id);
        if (email) {
            this.updateEmail(id, { important: !email.important });
        }
    }

    archiveEmail(id: number) {
        this.updateEmail(id, { archived: true });
    }

    unarchiveEmail(id: number) {
        this.updateEmail(id, { archived: false });
    }

    markAsSpam(id: number) {
        this.updateEmail(id, { spam: true });
    }

    deleteEmail(id: number) {
        this.updateEmail(id, { deleted: true });
    }

    recoverEmail(id: number) {
        this.updateEmail(id, { deleted: false, spam: false });
    }
}
