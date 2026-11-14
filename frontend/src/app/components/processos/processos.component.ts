import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { Router, RouterLink } from '@angular/router';
import { DatePipe, NgClass } from '@angular/common';
import { ProcessoService } from '../../services/processo.service';
import { ProcessoLicitatorio } from '../../models/processo.model';

@Component({
  selector: 'app-processos',
  imports: [RouterLink, DatePipe, NgClass],
  templateUrl: './processos.component.html',
  styleUrl: './processos.component.scss'
})
export class ProcessosComponent implements OnInit {
  private readonly router = inject(Router);
  private readonly processoService = inject(ProcessoService);

  processos = signal<ProcessoLicitatorio[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);
  sucessoMessage = signal<string | null>(null);

  filtroNumero = signal<string>('');
  filtroSituacao = signal<string>('');

  processosFiltrados = computed(() => {
    const lista = this.processos();
    const termo = this.filtroNumero().trim().toLowerCase();
    const situacao = this.filtroSituacao();

    return lista.filter(p => {
      const matchNumero = !termo || p.numero.toLowerCase().includes(termo);
      const matchSituacao = !situacao || p.situacao.toLowerCase() === situacao.toLowerCase();
      return matchNumero && matchSituacao;
    });
  });

  temFiltroAtivo = computed(() => {
    return this.filtroNumero().trim().length > 0 || this.filtroSituacao().length > 0;
  });

  ngOnInit(): void {
    const navState = history.state;
    if (navState?.mensagem) {
      this.sucessoMessage.set(navState.mensagem);
      history.replaceState({ ...navState, mensagem: null }, '');
    }
    this.carregarProcessos();
  }

  carregarProcessos(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.processoService.listar().subscribe({
      next: (dados) => {
        this.processos.set(dados || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        if (err.status === 0) {
          this.errorMessage.set('Falha de conexão com o servidor. Verifique se a API backend está em execução na porta 5299.');
        } else if (err.status >= 500) {
          this.errorMessage.set('Erro interno no servidor (500) ao carregar os processos licitatórios.');
        } else {
          this.errorMessage.set(`Não foi possível carregar os processos licitatórios (HTTP ${err.status || 'erro'}).`);
        }
        this.isLoading.set(false);
      }
    });
  }

  getSituacaoClass(situacao: string): string {
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

  abrirDetalhes(id: number): void {
    this.router.navigate(['/processos', id]);
  }

  onSearchInput(event: Event): void {
    const target = event.target as HTMLInputElement;
    this.filtroNumero.set(target.value);
  }

  onSituacaoFilterChange(event: Event): void {
    const target = event.target as HTMLSelectElement;
    this.filtroSituacao.set(target.value);
  }

  limparFiltros(): void {
    this.filtroNumero.set('');
    this.filtroSituacao.set('');
  }
}
