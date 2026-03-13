import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { BadgeModule } from 'primeng/badge';

@Component({
    selector: 'app-dashboard',
    standalone: true,
    imports: [CommonModule, CardModule, ButtonModule, BadgeModule],
    template: `
    <div class="space-y-6 max-w-full mx-auto pb-8">
        
        <!-- Top Widgets (2 columns: Resumo Diário, Faturamento Mensal) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Resumo Diário (Col-span 2) -->
            <p-card styleClass="lg:col-span-2 bg-[#ffffff] rounded-lg shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col min-h-[160px] h-full [&>.p-card-body]:p-6 [&>.p-card-body]:h-full [&>.p-card-content]:h-full [&>.p-card-content]:flex [&>.p-card-content]:flex-col [&>.p-card-content]:p-0">
                <ng-template pTemplate="content">
                    <h2 class="text-[18px] font-bold text-[#333333] mb-6 m-0">Resumo Diário</h2>
                    
                    <div class="grid grid-cols-3 gap-4 mt-auto">
                        <div class="flex flex-col gap-1 border-r border-slate-200/60">
                            <span class="text-[14px] font-bold text-slate-400 uppercase tracking-wider">Serviços Hoje</span>
                            <span class="text-[32px] font-bold text-[#2453d7]">1</span>
                        </div>
                        
                        <div class="flex flex-col gap-1 px-4 border-r border-slate-200/60">
                            <span class="text-[14px] font-bold text-slate-400 uppercase tracking-wider">Faturamento</span>
                            <span class="text-[32px] font-bold text-[#2453d7]">53</span>
                        </div>
                        
                        <div class="flex flex-col gap-1 px-4">
                            <span class="text-[14px] font-bold text-slate-400 uppercase tracking-wider">Total</span>
                            <span class="text-[32px] font-bold text-[#2453d7]">R$</span>
                        </div>
                    </div>
                </ng-template>
            </p-card>

            <!-- Faturamento Mensal (Col-span 1) -->
            <p-card styleClass="bg-[#ffffff] rounded-lg shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col relative overflow-hidden min-h-[160px] [&>.p-card-body]:p-6 [&>.p-card-body]:h-full [&>.p-card-content]:h-full [&>.p-card-content]:flex [&>.p-card-content]:flex-col [&>.p-card-content]:p-0">
                <ng-template pTemplate="content">
                    <div class="flex justify-end mb-2">
                        <p-button 
                            label="Ver relatório" 
                            icon="pi pi-angle-down" 
                            iconPos="right"
                            [text]="true"
                            styleClass="p-0 text-[13px] text-slate-500 font-medium hover:text-[#2453d7] transition-colors bg-transparent [&>.p-button-icon]:text-[10px]">
                        </p-button>
                    </div>
                    
                    <div class="flex justify-between items-end mt-auto z-10 relative">
                        <div class="flex flex-col gap-0.5 mb-1">
                            <span class="text-[18px] font-bold text-[#333333]">Faturamento Mensal</span>
                            <span class="text-[24px] font-bold text-[#2453d7]">$1,0k</span>
                        </div>
                        <i class="pi pi-angle-up text-[#9bcc2a] self-start mt-1 font-bold"></i>
                    </div>
                    
                    <!-- Mock Chart Bars -->
                    <div class="absolute bottom-6 right-6 h-12 w-28 flex items-end gap-2 z-0 opacity-90 justify-end">
                       <div class="w-2.5 bg-[#2453d7] rounded-sm h-full"></div>
                       <div class="w-2.5 bg-slate-300 rounded-sm h-2/5"></div>
                       <div class="w-2.5 bg-slate-200 rounded-sm h-1/5"></div>
                       <div class="w-2.5 bg-[#fbbf24] rounded-sm h-[80%]"></div>
                    </div>
                </ng-template>
            </p-card>
            
        </div>
        
        <!-- Bottom Widgets (Próximos Agendamentos, Serviços do Dia) -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            
            <!-- Próximos Agendamentos -->
            <p-card styleClass="lg:col-span-2 bg-[#ffffff] rounded-lg shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col [&>.p-card-body]:p-6 [&>.p-card-content]:p-0">
                <ng-template pTemplate="content">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-[18px] font-bold text-[#333333] m-0">Próximos Agendamentos</h2>
                        <a href="javascript:void(0)" class="text-[13px] text-[#2453d7] font-semibold flex items-center gap-1 hover:text-[#1d40b0] transition-colors">
                            Ver mais <i class="pi pi-arrow-right text-[11px] font-bold"></i>
                        </a>
                    </div>
                    
                    <div class="flex-1">
                        <!-- Table Header -->
                        <div class="grid grid-cols-12 gap-4 pb-3 mb-3 text-[13px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 px-4">
                            <div class="col-span-4">Cliente</div>
                            <div class="col-span-8">Veículo</div>
                        </div>
                        
                        <!-- Rows -->
                        <div class="flex flex-col gap-3">
                            @for (item of [1,2,3]; track item) {
                                <div class="grid grid-cols-12 gap-4 items-center bg-[#fdfdfd] hover:bg-slate-50 hover:-translate-y-0.5 transition-all duration-300 rounded-md p-3 border border-slate-100 cursor-pointer">
                                    <div class="col-span-4 flex items-center gap-3">
                                        <div class="w-9 h-9 flex items-center justify-center text-slate-500 bg-slate-100 rounded-full">
                                            <i class="pi pi-user text-[15px]"></i>
                                        </div>
                                        <span class="text-[14px] font-bold text-slate-700">João Silva</span>
                                    </div>
                                    <div class="col-span-7 flex items-center">
                                        <span class="text-[14px] font-medium text-slate-600">VW Golf GTI</span>
                                    </div>
                                    <div class="col-span-1 flex justify-end">
                                        <div class="w-[26px] h-[26px] rounded-full bg-[#9bcc2a] flex items-center justify-center text-white shadow-sm ring-2 ring-[#edfaeb]">
                                            <i class="pi pi-check text-[11px] font-bold"></i>
                                        </div>
                                    </div>
                                </div>
                            }
                        </div>
                    </div>
                </ng-template>
            </p-card>

            <!-- Serviços do Dia -->
            <p-card styleClass="bg-[#ffffff] rounded-lg shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col h-full [&>.p-card-body]:p-6 [&>.p-card-content]:p-0">
                <ng-template pTemplate="content">
                    <div class="flex justify-between items-center mb-6">
                        <h2 class="text-[18px] font-bold text-[#333333] m-0">Serviços do Dia</h2>
                        <a href="javascript:void(0)" class="text-[13px] text-[#2453d7] font-semibold flex items-center gap-1 hover:text-[#1d40b0] transition-colors">
                            Ver mais <i class="pi pi-arrow-right text-[11px] font-bold"></i>
                        </a>
                    </div>

                    <div class="flex-1">
                        <div class="pb-3 mb-3 text-[13px] font-bold text-slate-400 uppercase tracking-wider border-b border-slate-100 px-2">
                            <div>Agendamento</div>
                        </div>

                        <div class="flex flex-col gap-3">
                            <!-- Em Andamento -->
                            <div class="flex items-center justify-between bg-[#fffde7] text-[#665c00] px-4 py-3.5 rounded-md cursor-pointer hover:bg-[#fff9c4] hover:-translate-y-0.5 transition-all duration-300 border border-[#fff59d]">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-wrench text-[15px] text-[#fbc02d]"></i>
                                    <span class="text-[14px] font-bold">Em Andamento</span>
                                </div>
                                <i class="pi pi-angle-down text-[14px] font-bold text-[#fbc02d]"></i>
                            </div>

                            <!-- Aguardando Peça -->
                            <div class="flex items-center justify-between bg-[#f8fafc] text-[#475569] px-4 py-3.5 rounded-md cursor-pointer hover:bg-[#f1f5f9] hover:-translate-y-0.5 transition-all duration-300 border border-slate-200">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-clock text-[15px] text-slate-400"></i>
                                    <span class="text-[14px] font-bold text-[#475569]">Aguardando Peça</span>
                                </div>
                                <i class="pi pi-angle-right text-[14px] font-bold text-slate-400"></i>
                            </div>

                            <!-- Em Andamento 2 -->
                            <div class="flex items-center justify-between bg-[#fffaf0] text-[#7c2d12] px-4 py-3.5 rounded-md cursor-pointer hover:bg-[#ffedd5] hover:-translate-y-0.5 transition-all duration-300 border border-[#fed7aa]">
                                <div class="flex items-center gap-3">
                                    <i class="pi pi-wrench text-[15px] text-[#ea580c]"></i>
                                    <span class="text-[14px] font-bold">Em Andamento</span>
                                </div>
                                <i class="pi pi-angle-right text-[14px] font-bold text-[#ea580c]"></i>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </p-card>
            
        </div>
        
        <!-- Bottom Stat Cards -->
        <div class="grid grid-cols-1 md:grid-cols-3 gap-6 mt-6">
            
            <!-- Agendamentos -->
            <p-card styleClass="bg-[#ffffff] rounded-lg shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col transition-shadow hover:shadow-md [&>.p-card-body]:p-6">
                <ng-template pTemplate="content">
                    <div class="flex justify-between items-start mb-6">
                        <div class="text-slate-700">
                            <i class="pi pi-calendar text-[32px]"></i>
                        </div>
                        <div class="text-right">
                            <div class="text-[28px] font-semibold text-[#333333]">1.204</div>
                            <div class="text-[13px] text-slate-500 font-medium uppercase tracking-wider">Agendamentos</div>
                        </div>
                    </div>
                    
                    <div class="flex gap-4 border-t border-slate-100 pt-4">
                        <div class="flex-1">
                            <div class="flex justify-between text-[12px] font-semibold text-slate-600 mb-1.5">
                                <span>Meta</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: 75%"></div>
                            </div>
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between text-[12px] font-semibold text-slate-600 mb-1.5">
                                <span>Recorde Histórico</span>
                                <span>2.500</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2">
                                <div class="bg-indigo-700 h-2 rounded-full" style="width: 45%"></div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </p-card>

            <!-- Faturamento -->
            <p-card styleClass="bg-[#ffffff] rounded-lg shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col transition-shadow hover:shadow-md [&>.p-card-body]:p-6">
                <ng-template pTemplate="content">
                    <div class="flex justify-between items-start mb-6">
                        <div class="text-slate-700">
                            <div class="w-10 h-10 rounded-full bg-slate-800 text-white flex items-center justify-center font-bold text-xl">$</div>
                        </div>
                        <div class="text-right">
                            <div class="text-[28px] font-semibold text-[#333333]">R$ 63.573</div>
                            <div class="text-[13px] text-slate-500 font-medium uppercase tracking-wider">Faturamento</div>
                        </div>
                    </div>
                    
                    <div class="flex gap-4 border-t border-slate-100 pt-4">
                        <div class="flex-1">
                            <div class="flex justify-between text-[12px] font-semibold text-slate-600 mb-1.5">
                                <span>Meta</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: 85%"></div>
                            </div>
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between text-[12px] font-semibold text-slate-600 mb-1.5">
                                <span>Recorde</span>
                                <span>R$ 99.028</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2">
                                <div class="bg-indigo-700 h-2 rounded-full" style="width: 60%"></div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </p-card>

            <!-- Novos Clientes -->
            <p-card styleClass="bg-[#ffffff] rounded-lg shadow-[0_2px_4px_-1px_rgba(0,0,0,0.05)] border border-slate-200/60 flex flex-col transition-shadow hover:shadow-md [&>.p-card-body]:p-6">
                <ng-template pTemplate="content">
                    <div class="flex justify-between items-start mb-6">
                        <div class="text-slate-700">
                            <i class="pi pi-users text-[32px]"></i>
                        </div>
                        <div class="text-right">
                            <div class="text-[28px] font-semibold text-[#333333]">142</div>
                            <div class="text-[13px] text-slate-500 font-medium uppercase tracking-wider">Novos Clientes</div>
                        </div>
                    </div>
                    
                    <div class="flex gap-4 border-t border-slate-100 pt-4">
                        <div class="flex-1">
                            <div class="flex justify-between text-[12px] font-semibold text-slate-600 mb-1.5">
                                <span>Meta</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2">
                                <div class="bg-blue-600 h-2 rounded-full" style="width: 60%"></div>
                            </div>
                        </div>
                        <div class="flex-1">
                            <div class="flex justify-between text-[12px] font-semibold text-slate-600 mb-1.5">
                                <span>Recorde Anual</span>
                                <span>350</span>
                            </div>
                            <div class="w-full bg-slate-100 rounded-full h-2">
                                <div class="bg-indigo-700 h-2 rounded-full" style="width: 40%"></div>
                            </div>
                        </div>
                    </div>
                </ng-template>
            </p-card>
            
        </div>
    </div>
  `
})
export class DashboardComponent { }
