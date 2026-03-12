import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { SidebarComponent } from './sidebar/sidebar';
import { TopbarComponent } from './topbar/topbar';
import { FooterComponent } from './footer/footer';

@Component({
  selector: 'app-layout',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, TopbarComponent, FooterComponent],
  template: `
    <div class="flex h-screen w-full bg-slate-100 overflow-hidden text-slate-800">
      <!-- Sidebar SidebarComponent -->
      <app-sidebar class="hidden md:flex w-64 flex-shrink-0 z-20"></app-sidebar>
      
      <!-- Main view -->
      <div class="flex flex-col flex-1 min-w-0 h-screen overflow-y-auto">
        <!-- Topbar -->
        <app-topbar class="flex-shrink-0 z-10 sticky top-0"></app-topbar>
        
        <!-- Page view -->
        <main class="flex-1 p-4 md:p-6 lg:p-8">
          <router-outlet></router-outlet>
        </main>
        
        <!-- Footer -->
        <app-footer></app-footer>
      </div>
    </div>
  `
})
export class LayoutComponent { }
