import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { ProcessoService } from '../../services/processo.service';
import { ProcessoLicitatorio, HistoricoProcesso } from '../../models/processo.model';

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

  novaSituacao = signal<string>('');
  isUpdating = signal<boolean>(false);
  sucessoUpdateMessage = signal<string | null>(null);
  updateErrorMessage = signal<string | null>(null);

  historico = signal<HistoricoProcesso[]>([]);
  isLoadingHistorico = signal<boolean>(false);
  historicoError = signal<string | null>(null);

  readonly situacoesDisponiveis = [
    { valor: 'Planejado', label: 'Planejado' },
    { valor: 'Em andamento', label: 'Em andamento' },
    { valor: 'Concluido', label: 'Concluído' },
    { valor: 'Cancelado', label: 'Cancelado' }
  ];

  processoId: number | null = null;

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
    this.sucessoUpdateMessage.set(null);
    this.updateErrorMessage.set(null);

    this.processoService.buscarPorId(id).subscribe({
      next: (dados) => {
        this.processo.set(dados);
        this.novaSituacao.set(dados.situacao);
        this.isLoading.set(false);
        this.carregarHistorico(id);
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

  carregarHistorico(id: number): void {
    this.isLoadingHistorico.set(true);
    this.historicoError.set(null);

    this.processoService.listarHistorico(id).subscribe({
      next: (dados) => {
        this.historico.set(dados || []);
        this.isLoadingHistorico.set(false);
      },
      error: (err) => {
        this.isLoadingHistorico.set(false);
        if (err.status === 0) {
          this.historicoError.set('Falha de conexão com o servidor ao consultar o histórico.');
        } else if (err.status >= 500) {
          this.historicoError.set('Erro interno no servidor ao carregar o histórico de alterações.');
        } else {
          this.historicoError.set(`Não foi possível carregar o histórico (HTTP ${err.status || 'erro'}).`);
        }
      }
    });
  }

  onSituacaoChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.novaSituacao.set(target.value);
    this.sucessoUpdateMessage.set(null);
    this.updateErrorMessage.set(null);
  }

  salvarSituacao(): void {
    if (this.isUpdating() || !this.processoId) return;

    const situacao = this.novaSituacao();
    if (!situacao || situacao === this.processo()?.situacao) return;

    this.isUpdating.set(true);
    this.sucessoUpdateMessage.set(null);
    this.updateErrorMessage.set(null);

    this.processoService.atualizarSituacao(this.processoId, situacao).subscribe({
      next: (processoAtualizado) => {
        this.processo.set(processoAtualizado);
        this.novaSituacao.set(processoAtualizado.situacao);
        this.sucessoUpdateMessage.set('Situação atualizada com sucesso!');
        this.isUpdating.set(false);
        this.carregarHistorico(this.processoId!);
      },
      error: (err) => {
        this.isUpdating.set(false);
        if (err.status === 400) {
          this.updateErrorMessage.set('Situação inválida. Selecione uma opção válida.');
        } else if (err.status === 404) {
          this.updateErrorMessage.set('O processo não foi encontrado para atualização.');
        } else if (err.status === 0) {
          this.updateErrorMessage.set('Falha de conexão com o servidor. Verifique se a API backend está em execução.');
        } else if (err.status >= 500) {
          this.updateErrorMessage.set('Erro interno no servidor ao atualizar a situação.');
        } else {
          this.updateErrorMessage.set(`Não foi possível atualizar a situação (HTTP ${err.status || 'erro'}).`);
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
