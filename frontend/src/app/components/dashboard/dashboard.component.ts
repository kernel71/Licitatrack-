import { Component, OnInit, inject, signal, computed } from '@angular/core';
import { RouterLink } from '@angular/router';
import { ProcessoService } from '../../services/processo.service';
import { ProcessoLicitatorio } from '../../models/processo.model';

@Component({
  selector: 'app-dashboard',
  imports: [RouterLink],
  templateUrl: './dashboard.component.html',
  styleUrl: './dashboard.component.scss'
})
export class DashboardComponent implements OnInit {
  private readonly processoService = inject(ProcessoService);

  processos = signal<ProcessoLicitatorio[]>([]);
  isLoading = signal<boolean>(true);
  errorMessage = signal<string | null>(null);

  totalProcessos = computed(() => this.processos().length);
  processosPlanejados = computed(() =>
    this.processos().filter(p => p.situacao?.toLowerCase() === 'planejado').length
  );
  processosEmAndamento = computed(() =>
    this.processos().filter(p => p.situacao?.toLowerCase() === 'em andamento').length
  );
  processosConcluidos = computed(() =>
    this.processos().filter(p => p.situacao?.toLowerCase() === 'concluido' || p.situacao?.toLowerCase() === 'concluído').length
  );
  processosCancelados = computed(() =>
    this.processos().filter(p => p.situacao?.toLowerCase() === 'cancelado').length
  );

  ngOnInit(): void {
    this.carregarDados();
  }

  carregarDados(): void {
    this.isLoading.set(true);
    this.errorMessage.set(null);

    this.processoService.listar().subscribe({
      next: (dados) => {
        this.processos.set(dados || []);
        this.isLoading.set(false);
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 0) {
          this.errorMessage.set('Falha de conexão com o servidor. Verifique se a API backend está em execução na porta 5299.');
        } else if (err.status >= 500) {
          this.errorMessage.set('Erro interno no servidor ao carregar os dados do dashboard.');
        } else {
          this.errorMessage.set(`Não foi possível carregar os dados do dashboard (HTTP ${err.status || 'erro'}).`);
        }
      }
    });
  }
}
