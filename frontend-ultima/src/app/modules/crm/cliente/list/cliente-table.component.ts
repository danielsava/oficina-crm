import { Component, ChangeDetectionStrategy, inject, signal, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterModule } from '@angular/router';
import { ClienteService } from '../cliente.service';
import { Cliente } from '../cliente.model';
import { TableModule } from 'primeng/table';
import { ButtonModule } from 'primeng/button';
import { CardModule } from 'primeng/card';
import { ToolbarModule } from 'primeng/toolbar';

@Component({
  selector: 'app-cliente-table',
  standalone: true,
  imports: [CommonModule, RouterModule, TableModule, ButtonModule, CardModule, ToolbarModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './cliente-table.component.html'
})
export class ClienteTableComponent implements OnInit {
  private clienteService = inject(ClienteService);

  clientes = signal<Cliente[]>([]);
  carregando = signal<boolean>(true);

  ngOnInit() {
    this.carregarClientes();
  }

  carregarClientes() {
    this.carregando.set(true);
    this.clienteService.listarTodos().subscribe({
      next: (dados) => {
        this.clientes.set(dados);
        this.carregando.set(false);
      },
      error: () => {
        this.carregando.set(false);
      }
    });
  }

  excluir(id: string | undefined) {
    if (!id) return;
    if (confirm('Tem certeza que deseja excluir este cliente?')) {
      this.carregando.set(true);
      this.clienteService.excluir(id).subscribe({
        next: () => this.carregarClientes(),
        error: () => this.carregando.set(false)
      });
    }
  }
}
