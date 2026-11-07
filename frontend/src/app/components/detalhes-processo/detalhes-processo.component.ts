import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { ProcessoService } from '../../services/processo.service';
import { ProcessoLicitatorio } from '../../models/processo.model';

@Component({
  selector: 'app-detalhes-processo',
  imports: [RouterLink, DatePipe, NgClass],
  templateUrl: './detalhes-processo.component.html',
  styleUrl: './detalhes-processo.component.scss'
})
export class DetalhesProcessoComponent implements OnInit {
  private readonly route = inject(ActivatedRoute);
  private readonly processoService = inject(ProcessoService);

  processo = signal<ProcessoLicitatorio | null>(null);
  isLoading = signal<boolean>(true);
  notFound = signal<boolean>(false);
  invalidId = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  private processoId: number | null = null;

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    const id = Number(idParam);

    if (!idParam || isNaN(id) || id <= 0 || !Number.isInteger(id)) {
      this.invalidId.set(true);
      this.isLoading.set(false);
      return;
    }

    this.processoId = id;
    this.carregarProcesso(id);
  }

  carregarProcesso(id: number): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);
    this.notFound.set(false);
    this.invalidId.set(false);

    this.processoService.buscarPorId(id).subscribe({
      next: (dados) => {
        this.processo.set(dados);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 404) {
          this.notFound.set(true);
        } else if (err.status === 0) {
          this.errorMessage.set('Falha de conexão com o servidor. Verifique se a API backend está em execução na porta 5299.');
        } else if (err.status >= 500) {
          this.errorMessage.set('Erro interno no servidor (500) ao carregar os detalhes do processo.');
        } else {
          this.errorMessage.set(`Não foi possível carregar os detalhes do processo (HTTP ${err.status || 'erro'}).`);
        }
      }
    });
  }

  tentarNovamente(): void {
    if (this.processoId) {
      this.carregarProcesso(this.processoId);
    }
  }

  getSituacaoClass(situacao?: string): string {
    switch (situacao?.toLowerCase()) {
      case 'planejado':
        return 'badge-planejado';
      case 'em andamento':
        return 'badge-andamento';
      case 'concluido':
      case 'concluído':
        return 'badge-concluido';
      case 'cancelado':
        return 'badge-cancelado';
      default:
        return 'badge-default';
    }
  }
}
