import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule],
  template: `

    <aside class="flex flex-col bg-slate-100/70 backdrop-blur-md h-full w-64 border-r border-slate-200/60 py-6 px-4">
  
    <!-- Logo -->
      <div class="mb-10 px-2 cursor-pointer">
        <h1 class="text-[26px] font-bold leading-tight text-slate-800 tracking-tight">Oficina<br/>Moderna</h1>
      </div>

      <!-- Navigation -->
      <nav class="flex-1 space-y-2 mt-2">
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl bg-slate-100/90 text-slate-800 font-semibold shadow-[2px_4px_10px_0_rgba(0,0,0,0.03)] hover:shadow-[3px_6px_16px_0_rgba(0,0,0,0.06)] hover:-translate-y-0.5 transition-all duration-300">
          <i class="pi pi-users text-slate-500 text-[18px]"></i>
          <span class="text-[15px]">Clientes</span>
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-white hover:text-slate-800 font-medium hover:shadow-[3px_6px_16px_0_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300">
          <i class="pi pi-receipt text-slate-400 text-[18px]"></i>
          <span class="text-[15px]">Ordem de Serviço</span>
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-white hover:text-slate-800 font-medium hover:shadow-[3px_6px_16px_0_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300">
          <i class="pi pi-receipt text-slate-400 text-[18px]"></i>
          <span class="text-[15px]">Ordem de Serviço</span>
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-white hover:text-slate-800 font-medium hover:shadow-[3px_6px_16px_0_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300">
          <i class="pi pi-shopping-bag text-slate-400 text-[18px]"></i>
          <span class="text-[15px]">Estoque</span>
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-white hover:text-slate-800 font-medium hover:shadow-[3px_6px_16px_0_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300">
          <i class="pi pi-credit-card text-slate-400 text-[18px]"></i>
          <span class="text-[15px]">Faturamento</span>
        </a>
        <a href="#" class="flex items-center gap-3 px-4 py-3 rounded-xl text-slate-600 hover:bg-white hover:text-slate-800 font-medium hover:shadow-[3px_6px_16px_0_rgba(0,0,0,0.05)] hover:-translate-y-0.5 transition-all duration-300 mt-8">
          <i class="pi pi-clock text-slate-400 text-[18px]"></i>
          <span class="text-[15px]">Configurações</span>
        </a>
      </nav>

      <!-- Action Button -->
      <div class="mt-auto pt-4">
        <button class="w-full bg-blue-600 hover:bg-blue-700 text-white font-medium py-3 rounded-xl shadow-[0_4px_14px_0_rgba(37,99,235,0.3)] transition-all flex items-center justify-center gap-2">
          <span>Agendar</span>
        </button>
      </div>
    </aside>
  `
})
export class SidebarComponent { }
