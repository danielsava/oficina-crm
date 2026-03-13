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
    <header class="flex items-center justify-between px-6 md:px-8 py-4 bg-slate-300/60 backdrop-blur-md border-b border-slate-300/50 w-full">
        <!-- Search -->
        <div class="flex-1 max-w-md">
            <p-iconfield styleClass="w-full relative">
                <p-inputicon styleClass="pi pi-search !text-slate-400 !absolute !left-3 !top-1/2 !-translate-y-1/2 !z-10 !text-[15px]"></p-inputicon>
                <input 
                    pInputText 
                    class="w-full h-10 rounded-xl bg-slate-200/40 border border-slate-200/60 focus:ring-2 focus:ring-blue-100 focus:border-blue-300 transition-all text-[15px] text-slate-700 placeholder-slate-400 font-medium pl-10 pr-4 outline-none shadow-none" 
                    type="text" 
                    placeholder="Pesquisar..." />
            </p-iconfield>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-5 ml-4">
            
            <!-- Icons -->
            <div class="flex items-center gap-4 text-slate-500">
                <p-button icon="pi pi-comment" [text]="true" [rounded]="true" styleClass="!text-slate-500 hover:!text-slate-800 !p-2 !w-auto !h-auto [&>.p-button-icon]:!text-[22px] !border-none !bg-transparent"></p-button>
                
                <div class="relative flex">
                    <p-button icon="pi pi-bell" [text]="true" [rounded]="true" styleClass="!text-slate-500 hover:!text-slate-800 !p-2 !w-auto !h-auto [&>.p-button-icon]:!text-[22px] !border-none !bg-transparent"></p-button>
                    <p-badge value="1" severity="danger" styleClass="absolute -top-1 -right-1 !text-[10px] !min-w-[16px] !h-[16px] !leading-[16px] !shadow-sm !ring-2 !ring-white"></p-badge>
                </div>
            </div>

            <!-- Profile -->
            <button class="flex items-center gap-2 hover:bg-slate-100 rounded-full p-1 pr-3 transition-colors ml-2 cursor-pointer border-none bg-transparent outline-none">
                <p-avatar image="https://i.pravatar.cc/150?u=a042581f4e29026024d" shape="circle" styleClass="!h-9 !w-9 !border !border-slate-300 !shadow-sm"></p-avatar>
                <div class="flex items-center gap-1.5 ml-1">
                    <span class="text-[15px] font-semibold text-slate-700">João</span>
                    <i class="pi pi-angle-down text-slate-400 text-xs"></i>
                </div>
            </button>
        </div>

    </header>
  `
})
export class TopbarComponent { }

