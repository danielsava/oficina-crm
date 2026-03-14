import { Component, inject } from '@angular/core';
import { ButtonModule } from 'primeng/button';
import { LayoutService } from '@/app/layout/service/layout.service';

@Component({
    standalone: true,
    selector: '[app-footer]',
    imports: [ButtonModule],
    template: ` <span class="font-medium text-lg text-muted-color">
            <img src="/layout/images/logo/footer-ultima{{ layoutService.isDarkTheme() ? '-dark.svg' : '.svg' }}" />
        </span>
        <div class="flex gap-2">
            <button pButton icon="pi pi-github" rounded text severity="secondary"></button>
            <button pButton icon="pi pi-facebook" rounded text severity="secondary"></button>
            <button pButton icon="pi pi-twitter" rounded text severity="secondary"></button>
        </div>`,
    host: {
        class: 'layout-footer'
    }
})
export class AppFooter {
    layoutService = inject(LayoutService);
}
