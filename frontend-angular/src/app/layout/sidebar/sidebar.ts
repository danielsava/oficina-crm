import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MenuModule, ButtonModule, RippleModule],
  template: `
    <aside class="flex flex-col bg-slate-100/70 backdrop-blur-md h-full w-64 border-r border-slate-200/60 py-6 px-4">
  
      <!-- Logo -->
      <div class="mb-10 px-2 cursor-pointer">
        <h1 class="text-[26px] font-bold leading-tight text-slate-800 tracking-tight">Oficina<br/>Moderna</h1>
      </div>

      <!-- Navigation -->
      <div class="flex-1 mt-2">
         <p-menu [model]="items" styleClass="w-full bg-transparent border-none p-0 flex flex-col gap-2 [&>.p-menuitem]:!m-0 p-0">
            <ng-template pTemplate="item" let-item>
                <a pRipple [ngClass]="{'bg-slate-100/90 text-slate-800 shadow-[2px_4px_10px_0_rgba(0,0,0,0.03)]': item.id === 'active', 'text-slate-600 hover:bg-white hover:text-slate-800 hover:shadow-[3px_6px_16px_0_rgba(0,0,0,0.05)]': item.id !== 'active'}"
                   class="flex items-center gap-3 px-4 py-3 rounded-xl font-medium transition-all duration-300 hover:-translate-y-0.5 w-full cursor-pointer overflow-hidden no-underline"
                   [class.mt-8]="item.separator">
                    <i [class]="item.icon" [ngClass]="item.id === 'active' ? 'text-slate-500' : 'text-slate-400'" class="text-[18px]"></i>
                    <span class="text-[15px]" [ngClass]="item.id === 'active' ? 'font-semibold' : ''">{{ item.label }}</span>
                </a>
            </ng-template>
         </p-menu>
      </div>

      <!-- Action Button -->
      <div class="mt-auto pt-4">
        <p-button 
            label="Agendar" 
            styleClass="!w-full !bg-blue-600 hover:!bg-blue-700 !text-white !font-medium !py-3 !rounded-xl !shadow-[0_4px_14px_0_rgba(37,99,235,0.3)] !transition-all !flex !items-center !justify-center !gap-2 !border-none">
        </p-button>
      </div>
    </aside>
  `
})
export class SidebarComponent implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      { label: 'Clientes', icon: 'pi pi-users', id: 'active' },
      { label: 'Ordem de Serviço', icon: 'pi pi-receipt' },
      { label: 'Estoque', icon: 'pi pi-shopping-bag' },
      { label: 'Faturamento', icon: 'pi pi-credit-card' },
      { label: 'Configurações', icon: 'pi pi-clock', separator: true }
    ];
  }
}

