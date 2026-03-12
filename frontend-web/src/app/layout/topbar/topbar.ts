import { Component } from '@angular/core';

@Component({
    selector: 'app-topbar',
    standalone: true,
    template: `

    <header class="flex items-center justify-between px-6 md:px-8 py-4 bg-slate-300/60 backdrop-blur-md border-b border-slate-300/50 w-full">
        <!-- Search -->
        <div class="flex-1 max-w-md">
            <div class="relative flex items-center w-full h-10 rounded-xl bg-slate-200/40 border border-slate-200/60 overflow-hidden focus-within:ring-2 focus-within:ring-blue-100 focus-within:border-blue-300 transition-all">
                <div class="grid place-items-center h-full w-11 text-slate-400 border-r border-transparent">
                    <i class="pi pi-search text-[15px]"></i>
                </div>
                <input
                class="peer h-full w-full outline-none text-[15px] text-slate-700 bg-transparent pr-4 placeholder-slate-400 font-medium"
                type="text"
                id="search"
                placeholder="Pesquisar..." />
            </div>
        </div>

        <!-- Actions -->
        <div class="flex items-center gap-5 ml-4">
            
            <!-- Icons -->
            <div class="flex items-center gap-4 text-slate-500">
                <button class="hover:text-slate-800 transition-colors relative">
                    <i class="pi pi-comment text-[22px]"></i>
                </button>
                <button class="hover:text-slate-800 transition-colors relative">
                    <i class="pi pi-bell text-[22px]"></i>
                    <span class="absolute -top-1 -right-1 flex h-4 w-4 items-center justify-center rounded-full bg-red-500 text-[10px] font-bold text-white shadow-sm ring-2 ring-white">1</span>
                </button>
            </div>

            <!-- Profile -->
            <button class="flex items-center gap-2 hover:bg-slate-100 rounded-full p-1 pr-3 transition-colors ml-2">
                <div class="h-9 w-9 rounded-full overflow-hidden bg-slate-200 border border-slate-300 shadow-sm">
                   <img src="https://i.pravatar.cc/150?u=a042581f4e29026024d" alt="User" class="h-full w-full object-cover"/>
                </div>
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
