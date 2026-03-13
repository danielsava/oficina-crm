import { Component } from '@angular/core';
import { InputTextModule } from 'primeng/inputtext';
import { BadgeModule } from 'primeng/badge';
import { AvatarModule } from 'primeng/avatar';
import { ButtonModule } from 'primeng/button';
import { IconFieldModule } from 'primeng/iconfield';
import { InputIconModule } from 'primeng/inputicon';

@Component({
    selector: 'app-topbar',
    standalone: true,
    imports: [InputTextModule, BadgeModule, AvatarModule, ButtonModule, IconFieldModule, InputIconModule],
    template: `
    <header class="flex items-center justify-between px-4 md:px-6 py-3 bg-[#333333]/90 backdrop-blur-sm border-b border-[#444444] w-full text-white shadow-md z-30 relative">
        <!-- Left Section: Logo & Breadcrumb -->
        <div class="flex items-center gap-6">
            <!-- Ultima-like Logo Area (Mobile or Topbar integration) -->
            <div class="flex items-center gap-2 cursor-pointer">
                <span class="text-xl font-bold tracking-tight text-white uppercase hidden md:block">Oficina<span class="font-normal opacity-80">CRM</span></span>
            </div>

            <!-- Toggle Menu Button (often found in Ultima) -->
            <p-button icon="pi pi-bars" [text]="true" [rounded]="true" styleClass="!text-white hover:!bg-white/10 !p-2 !w-auto !h-auto [&>.p-button-icon]:!text-[20px] !border-none !bg-transparent"></p-button>
        </div>

        <!-- Right Section: Actions -->
        <div class="flex items-center gap-2 md:gap-4">
            
            <!-- Search Icon (Ultima typically collapses search or uses simple icon) -->
            <p-button icon="pi pi-search" [text]="true" [rounded]="true" styleClass="!text-white hover:!bg-white/10 !p-2 !w-auto !h-auto [&>.p-button-icon]:!text-[20px] !border-none !bg-transparent"></p-button>

            <!-- Settings -->
            <p-button icon="pi pi-cog" [text]="true" [rounded]="true" styleClass="!text-white hover:!bg-white/10 !p-2 !w-auto !h-auto [&>.p-button-icon]:!text-[20px] !border-none !bg-transparent"></p-button>

            <!-- Notifications -->
            <div class="relative flex">
                <p-button icon="pi pi-bell" [text]="true" [rounded]="true" styleClass="!text-white hover:!bg-white/10 !p-2 !w-auto !h-auto [&>.p-button-icon]:!text-[20px] !border-none !bg-transparent"></p-button>
                <p-badge value="3" severity="danger" styleClass="absolute top-0 right-0 !text-[10px] !min-w-[16px] !h-[16px] !leading-[16px] !shadow-sm"></p-badge>
            </div>
            
            <!-- Quick Actions Apps -->
            <p-button icon="pi pi-th-large" [text]="true" [rounded]="true" styleClass="!text-white hover:!bg-white/10 !p-2 !w-auto !h-auto [&>.p-button-icon]:!text-[20px] !border-none !bg-transparent block hidden md:block"></p-button>

            <!-- Profile -->
            <button class="flex items-center hover:bg-white/10 rounded-full p-1 transition-colors ml-1 cursor-pointer border-none bg-transparent outline-none">
                <p-avatar image="https://i.pravatar.cc/150?u=a042581f4e29026024d" shape="circle" styleClass="!h-8 !w-8"></p-avatar>
            </button>
        </div>
    </header>
  `
})
export class TopbarComponent { }

