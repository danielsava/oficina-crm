import { Component } from '@angular/core';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  template: `
    <div class="space-y-6 max-w-7xl mx-auto">
        <!-- Header -->
        <div class="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
            <h1 class="text-[34px] font-bold text-[#0f172a] shadow-sm tracking-tight" style="text-shadow: 0px 1px 1px rgba(0,0,0,0.02)">Dashboard</h1>
            <button class="bg-[#2453d7] hover:bg-[#1d40b0] text-white px-5 py-2.5 rounded-[12px] text-[15px] font-medium shadow-[0_4px_14px_0_rgba(36,83,215,0.3)] transition-all flex items-center justify-center gap-2">
                <i class="pi pi-plus text-[13px] font-bold"></i>
                <span>Confirmar agendamento</span>
            </button>
        </div>

        <!-- Top Widgets -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6">
            
            <!-- Resumo Diário -->
            <div class="lg:col-span-2 bg-white rounded-[20px] shadow-[0_2px_10px_0_rgba(0,0,0,0.02)] border border-slate-100 p-6 flex flex-col min-h-[160px]">
                <h2 class="text-[17px] font-semibold text-slate-800 mb-6">Resumo Diário</h2>
                
                <div class="grid grid-cols-3 gap-4 mt-auto">
                    <div class="flex flex-col gap-1 border-r border-slate-100/80">
                        <span class="text-[15px] font-medium text-slate-700">Serviços Hoje</span>
                        <span class="text-[32px] font-bold text-[#1f4db3]">1</span>
                    </div>
                    
                    <div class="flex flex-col gap-1 px-4 border-r border-slate-100/80">
                        <span class="text-[15px] font-medium text-slate-700">Faturamento</span>
                        <span class="text-[32px] font-bold text-[#1f4db3]">53</span>
                    </div>
                    
                    <div class="flex flex-col gap-1 px-4">
                        <span class="text-[15px] font-medium text-slate-700">Total</span>
                        <span class="text-[32px] font-bold text-[#1f4db3]">R$</span>
                    </div>
                </div>
            </div>

            <!-- Faturamento Mensal -->
            <div class="bg-white rounded-[20px] shadow-[0_2px_10px_0_rgba(0,0,0,0.02)] border border-slate-100 p-6 flex flex-col relative overflow-hidden min-h-[160px]">
                <div class="flex justify-end mb-2">
                    <button class="text-[13px] text-slate-500 font-medium flex items-center gap-1.5 hover:text-slate-800 transition-colors">
                        Ver relatório
                        <i class="pi pi-angle-down text-[10px]"></i>
                    </button>
                </div>
                
                <div class="flex justify-between items-end mt-auto z-10 relative">
                    <div class="flex flex-col gap-0.5 mb-1">
                        <span class="text-[16px] font-semibold text-slate-800">Faturamento Mensal</span>
                        <span class="text-[22px] font-bold text-slate-500">$1,0k</span>
                    </div>
                    <i class="pi pi-angle-up text-slate-600 self-start mt-1"></i>
                </div>
                
                <!-- Mock Chart Bars -->
                <div class="absolute bottom-6 right-6 h-12 w-28 flex items-end gap-2 z-0 opacity-90 justify-end">
                   <div class="w-2.5 bg-[#2453d7] rounded-full h-full"></div>
                   <div class="w-2.5 bg-slate-300 rounded-full h-2/5"></div>
                   <div class="w-2.5 bg-slate-200 rounded-full h-1/5"></div>
                   <div class="w-2.5 bg-[#fbbf24] rounded-full h-[80%]"></div>
                </div>
            </div>
            
        </div>
        
<!-- Bottom Widgets -->
        <div class="grid grid-cols-1 lg:grid-cols-3 gap-6 mt-6">
            
            <!-- Próximos Agendamentos -->
            <div class="lg:col-span-2 bg-white rounded-[24px] shadow-[0_4px_24px_0_rgba(0,0,0,0.03)] border border-slate-100 p-6 flex flex-col">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-[19px] font-semibold text-slate-800">Próximos Agendamentos</h2>
                    <a href="javascript:void(0)" class="text-[14px] text-[#2453d7] font-medium flex items-center gap-1 hover:text-[#1d40b0] transition-colors">
                        Ver mais <i class="pi pi-arrow-right text-[11px] font-bold"></i>
                    </a>
                </div>
                
                <div class="flex-1">
                    <!-- Table Header -->
                    <div class="grid grid-cols-12 gap-4 pb-3 mb-3 text-[14px] font-medium text-slate-500 px-4">
                        <div class="col-span-4">Cliente</div>
                        <div class="col-span-8">Veículo</div>
                    </div>
                    
                    <!-- Rows -->
                    <div class="flex flex-col gap-4">
                        <div class="grid grid-cols-12 gap-4 items-center bg-white shadow-[4px_10px_24px_0_rgba(0,0,0,0.06)] hover:shadow-[6px_14px_32px_0_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 rounded-[20px] p-4 border border-slate-50/50 cursor-pointer">
                            <div class="col-span-4 flex items-center gap-3">
                                <div class="w-9 h-9 flex items-center justify-center text-slate-600">
                                    <i class="pi pi-user text-[17px]"></i>
                                </div>
                                <span class="text-[15px] font-medium text-slate-700">João Silva</span>
                            </div>
                            <div class="col-span-7 flex items-center">
                                <span class="text-[15px] font-medium text-slate-700">VW Golf GTI</span>
                            </div>
                            <div class="col-span-1 flex justify-end">
                                <div class="w-[26px] h-[26px] rounded-full bg-[#9bcc2a] flex items-center justify-center text-white shadow-sm ring-4 ring-[#edfaeb]">
                                    <i class="pi pi-check text-[11px] font-bold"></i>
                                </div>
                            </div>
                        </div>
                        
                        <div class="grid grid-cols-12 gap-4 items-center bg-white shadow-[4px_10px_24px_0_rgba(0,0,0,0.06)] hover:shadow-[6px_14px_32px_0_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 rounded-[20px] p-4 border border-slate-50/50 cursor-pointer">
                            <div class="col-span-4 flex items-center gap-3">
                                <div class="w-9 h-9 flex items-center justify-center text-slate-600">
                                    <i class="pi pi-user text-[17px]"></i>
                                </div>
                                <span class="text-[15px] font-medium text-slate-700">João Silva</span>
                            </div>
                            <div class="col-span-7 flex items-center">
                                <span class="text-[15px] font-medium text-slate-700">VW Golf GTI</span>
                            </div>
                            <div class="col-span-1 flex justify-end">
                                <div class="w-[26px] h-[26px] rounded-full bg-[#9bcc2a] flex items-center justify-center text-white shadow-sm ring-4 ring-[#edfaeb]">
                                    <i class="pi pi-check text-[11px] font-bold"></i>
                                </div>
                            </div>
                        </div>

                        <div class="grid grid-cols-12 gap-4 items-center bg-white shadow-[4px_10px_24px_0_rgba(0,0,0,0.06)] hover:shadow-[6px_14px_32px_0_rgba(0,0,0,0.1)] hover:-translate-y-0.5 transition-all duration-300 rounded-[20px] p-4 border border-slate-50/50 cursor-pointer">
                            <div class="col-span-4 flex items-center gap-3">
                                <div class="w-9 h-9 flex items-center justify-center text-slate-600">
                                    <i class="pi pi-user text-[17px]"></i>
                                </div>
                                <span class="text-[15px] font-medium text-slate-700">João Silva</span>
                            </div>
                            <div class="col-span-7 flex items-center">
                                <span class="text-[15px] font-medium text-slate-700">VW Golf GTI</span>
                            </div>
                            <div class="col-span-1 flex justify-end">
                                <div class="w-[26px] h-[26px] rounded-full bg-[#9bcc2a] flex items-center justify-center text-white shadow-sm ring-4 ring-[#edfaeb]">
                                    <i class="pi pi-check text-[11px] font-bold"></i>
                                </div>
                            </div>
                        </div>
                    </div>
                </div>
            </div>

            <!-- Serviços do Dia -->
            <div class="bg-white rounded-[24px] shadow-[0_4px_24px_0_rgba(0,0,0,0.03)] border border-slate-100 p-6 flex flex-col">
                <div class="flex justify-between items-center mb-6">
                    <h2 class="text-[19px] font-semibold text-slate-800">Serviços do Dia</h2>
                    <a href="javascript:void(0)" class="text-[14px] text-[#2453d7] font-medium flex items-center gap-1 hover:text-[#1d40b0] transition-colors">
                        Ver mais <i class="pi pi-arrow-right text-[11px] font-bold"></i>
                    </a>
                </div>

                <div class="flex-1">
                    <div class="pb-3 mb-3 text-[14px] font-medium text-slate-500 px-2">
                        <div>Agendamento</div>
                    </div>

                    <div class="flex flex-col gap-4">
                        <!-- Em Andamento -->
                        <div class="flex items-center justify-between bg-[#ffc107] text-[#4f3d00] px-4 py-4 rounded-2xl cursor-pointer hover:bg-[#ffcd33] hover:shadow-[3px_6px_16px_0_rgba(255,193,7,0.3)] hover:-translate-y-0.5 transition-all duration-300 shadow-sm border border-transparent">
                            <div class="flex items-center gap-3">
                                <i class="pi pi-wrench text-[17px]"></i>
                                <span class="text-[15px] font-semibold">Em Andamento</span>
                            </div>
                            <i class="pi pi-angle-down text-[15px] font-bold"></i>
                        </div>

                        <!-- Aguardando Peça -->
                        <div class="flex items-center justify-between bg-[#eff6ff] text-[#334155] px-4 py-4 rounded-2xl cursor-pointer hover:bg-[#e0f0ff] hover:shadow-[3px_6px_16px_0_rgba(59,130,246,0.15)] hover:-translate-y-0.5 transition-all duration-300 shadow-sm border border-transparent">
                            <div class="flex items-center gap-3">
                                <i class="pi pi-clock text-[17px] text-[#64748b]"></i>
                                <span class="text-[15px] font-medium">Aguardando Peça</span>
                            </div>
                            <i class="pi pi-angle-right text-[15px] font-bold text-[#64748b]"></i>
                        </div>

                        <!-- Em Andamento 2 -->
                        <div class="flex items-center justify-between bg-[#fffbeb] text-[#4f3d00] px-4 py-4 rounded-2xl cursor-pointer hover:bg-[#fef3c7] hover:shadow-[3px_6px_16px_0_rgba(251,191,36,0.2)] hover:-translate-y-0.5 transition-all duration-300 shadow-sm border border-[#fde68a]">
                            <div class="flex items-center gap-3 text-[#b45309]">
                                <i class="pi pi-wrench text-[17px]"></i>
                                <span class="text-[15px] font-medium">Em Andamento</span>
                            </div>
                            <i class="pi pi-angle-right text-[15px] font-bold text-[#b45309]"></i>
                        </div>
                    </div>
                </div>
            </div>
            
        </div>
    </div>
  `
})
export class DashboardComponent {}
