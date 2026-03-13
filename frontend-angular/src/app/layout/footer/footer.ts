import { Component } from '@angular/core';

@Component({
  selector: 'app-footer',
  standalone: true,
  template: `
    <footer class="text-sm text-slate-500 py-4 px-6 md:px-8 mt-auto border-t border-slate-200/60 bg-transparent flex flex-wrap justify-between items-center gap-4">
      <div>
        &copy; 2024 Oficina Moderna. Todos os direitos reservados.
      </div>
      <div class="flex gap-4 font-medium">
        <a href="#" class="hover:text-blue-600 transition-colors">Suporte</a>
        <span class="text-slate-300">|</span>
        <a href="#" class="hover:text-blue-600 transition-colors">Termos de Uso</a>
      </div>
    </footer>
  `
})
export class FooterComponent {}
