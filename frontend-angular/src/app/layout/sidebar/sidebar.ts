import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AvatarModule } from 'primeng/avatar';
import { MenuModule } from 'primeng/menu';
import { MenuItem } from 'primeng/api';
import { ButtonModule } from 'primeng/button';
import { RippleModule } from 'primeng/ripple';

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [CommonModule, MenuModule, ButtonModule, RippleModule, AvatarModule],
  template: `
    <aside class="flex flex-col bg-[#fdfdfd] h-full w-64 border-r border-slate-200 py-0 pb-6 shadow-[2px_0_6px_rgba(0,0,0,0.02)] relative z-20">
  
      <!-- User Profile Area (common in Ultima sidebar) -->
      <div class="px-6 py-6 border-b border-slate-100 flex flex-col items-center justify-center bg-slate-50/50">
         <p-avatar image="https://i.pravatar.cc/150?u=a042581f4e29026024d" shape="circle" styleClass="!h-16 !w-16 !mb-3 !shadow-md border-2 border-white"></p-avatar>
         <span class="text-[#333333] font-bold text-[15px]">João Silva</span>
         <span class="text-slate-500 text-[12px] font-medium">Gestor da Oficina</span>
      </div>

      <!-- Navigation -->
      <div class="flex-1 overflow-y-auto mt-4 px-3">
         <div class="text-[11px] font-bold text-slate-400 uppercase tracking-widest px-3 mb-2">Menu Principal</div>
         <p-menu [model]="items" styleClass="w-full bg-transparent border-none p-0 flex flex-col gap-1 [&>.p-menuitem]:!m-0 p-0">
            <ng-template pTemplate="item" let-item>
                <a pRipple 
                   [ngClass]="{'bg-[#d1e8ff] text-[#0a66c2] font-bold rounded-lg shadow-sm': item.id === 'active', 'text-slate-600 hover:bg-slate-100/80 hover:text-slate-800 rounded-lg font-medium': item.id !== 'active'}"
                   class="flex items-center gap-3 px-3 py-2.5 transition-colors duration-200 w-full cursor-pointer overflow-hidden no-underline"
                   [class.mt-4]="item.separator">
                    <i [class]="item.icon" [ngClass]="item.id === 'active' ? 'text-[#0a66c2]' : 'text-slate-500'" class="text-[18px]"></i>
                    <span class="text-[14px]">{{ item.label }}</span>
                </a>
            </ng-template>
         </p-menu>
      </div>

    </aside>
  `
})
export class SidebarComponent implements OnInit {
  items: MenuItem[] | undefined;

  ngOnInit() {
    this.items = [
      { label: 'Clientes', icon: 'pi pi-users' },
      { label: 'Ordem de Serviço', icon: 'pi pi-receipt' },
      { label: 'Estoque', icon: 'pi pi-shopping-bag' },
      { label: 'Faturamento', icon: 'pi pi-credit-card' },
      { label: 'Configurações', icon: 'pi pi-clock', separator: true }
    ];
  }
}

