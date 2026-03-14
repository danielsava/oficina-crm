import { Injectable, signal } from '@angular/core';

export interface FormState {
    profilePhoto: File | null;
    profilePhotoUrl: string | null;
    name: string;
    email: string;
    phone: string;
    biography: string;
    department: any[];
    position: string;
    employed: boolean;
    hybridWork: boolean;
    officeLocation: string;
    salaryRange: number[];
    country: string | null;
    state: string;
    city: string;
    postalCode: string;
    addressLine1: string;
    addressLine2: string;
    region: string;
    authorizationLevel: string;
    authorizations: string[];
    userManagement: boolean;
    salesManagement: boolean;
    financeDisplay: boolean;
    status: string;
    sendInvitation: boolean;
    notes: string;
}

@Injectable({
    providedIn: 'root'
})
export class FormStateService {
    formState = signal<FormState>({
        profilePhoto: null,
        profilePhotoUrl: null,
        name: '',
        email: '',
        phone: '',
        biography: '',
        department: [],
        position: 'Admin',
        employed: false,
        hybridWork: false,
        officeLocation: '',
        salaryRange: [5000, 15000],
        country: null,
        state: '',
        city: '',
        postalCode: '',
        addressLine1: '',
        addressLine2: '',
        region: '',
        authorizationLevel: 'member',
        authorizations: [],
        userManagement: false,
        salesManagement: false,
        financeDisplay: false,
        status: 'active',
        sendInvitation: false,
        notes: ''
    });

    updateField<K extends keyof FormState>(field: K, value: FormState[K]) {
        this.formState.update((state) => ({
            ...state,
            [field]: value
        }));
    }

    reset() {
        this.formState.set({
            profilePhoto: null,
            profilePhotoUrl: null,
            name: '',
            email: '',
            phone: '',
            biography: '',
            department: [],
            position: 'Admin',
            employed: false,
            hybridWork: false,
            officeLocation: '',
            salaryRange: [5000, 15000],
            country: null,
            state: '',
            city: '',
            postalCode: '',
            addressLine1: '',
            addressLine2: '',
            region: '',
            authorizationLevel: 'member',
            authorizations: [],
            userManagement: false,
            salesManagement: false,
            financeDisplay: false,
            status: 'active',
            sendInvitation: false,
            notes: ''
        });
    }
}
