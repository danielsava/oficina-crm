import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, NonNullableFormBuilder, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { ClienteService } from '../cliente.service';

import { InputTextModule } from 'primeng/inputtext';
import { CardModule } from 'primeng/card';
import { ButtonModule } from 'primeng/button';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-cliente-form',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterModule, InputTextModule, CardModule, ButtonModule, ToolbarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cliente-form.component.html'
})
export class ClienteFormComponent implements OnInit {
  private fb = inject(NonNullableFormBuilder);
  private clienteService = inject(ClienteService);
  private route = inject(ActivatedRoute);
  private router = inject(Router);

  clienteId = signal<string | null>(null);
  salvando = signal<boolean>(false);
  carregando = signal<boolean>(false);

  form = this.fb.group({
    nome: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    documento: ['', [Validators.required]],
    telefone: ['']
  });

  ngOnInit() {
    const id = this.route.snapshot.paramMap.get('id');
    if (id) {
      this.clienteId.set(id);
      this.carregarDadosEdicao(id);
    }
  }

  carregarDadosEdicao(id: string) {
    this.carregando.set(true);
    this.clienteService.buscarPorId(id).subscribe({
      next: (cliente) => {
        this.form.patchValue(cliente);
        this.carregando.set(false);
      },
      error: () => this.carregando.set(false)
    });
  }

  salvar() {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }
    
    this.salvando.set(true);
    const formValue = this.form.getRawValue();

    const request$ = this.clienteId() 
      ? this.clienteService.atualizar(this.clienteId()!, formValue)
      : this.clienteService.salvar(formValue);

    request$.subscribe({
      next: () => {
        this.salvando.set(false);
        this.router.navigate(['/clientes']);
      },
      error: () => {
        this.salvando.set(false);
      }
    });
  }
}
