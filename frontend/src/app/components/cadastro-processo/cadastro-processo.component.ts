import { Component, OnInit, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ActivatedRoute, Router, RouterLink } from '@angular/router';
import { ProcessoService } from '../../services/processo.service';
import { CriarProcessoDTO, EditarProcessoDTO } from '../../models/processo.model';

@Component({
  selector: 'app-cadastro-processo',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro-processo.component.html',
  styleUrl: './cadastro-processo.component.scss'
})
export class CadastroProcessoComponent implements OnInit {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly processoService = inject(ProcessoService);

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);
  isEditMode = signal<boolean>(false);
  isLoading = signal<boolean>(false);
  loadError = signal<string | null>(null);
  processoId: number | null = null;

  readonly situacoesDisponiveis = [
    'Planejado',
    'Em andamento',
    'Concluido',
    'Cancelado'
  ];

  readonly modalidadesIniciais = [
    'Pregão Eletrônico',
    'Pregão Presencial',
    'Concorrência',
    'Concurso',
    'Leilão',
    'Diálogo Competitivo',
    'Dispensa de Licitação',
    'Inexigibilidade de Licitação',
    'Inexigibilidade'
  ];

  readonly secretariasIniciais = [
    'Secretaria de Administração',
    'Secretaria de Educação',
    'Secretaria de Saúde',
    'Secretaria de Infraestrutura',
    'Secretaria de Assistência Social',
    'Secretaria de Finanças',
    'Secretaria de Meio Ambiente',
    'Secretaria de Cultura'
  ];

  modalidadesOpcoes = signal<string[]>(this.modalidadesIniciais);
  secretariasOpcoes = signal<string[]>(this.secretariasIniciais);

  form: FormGroup = this.fb.group({
    numero: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^\d{3}\/\d{4}$/)]],
    objeto: ['', [Validators.required]],
    modalidade: ['', [Validators.required, Validators.maxLength(50)]],
    secretaria: ['', [Validators.required, Validators.maxLength(100)]],
    dataAbertura: ['', [Validators.required]],
    situacao: ['Planejado', [Validators.required, Validators.maxLength(20)]]
  });

  ngOnInit(): void {
    const idParam = this.route.snapshot.paramMap.get('id');
    if (idParam !== null) {
      this.isEditMode.set(true);
      const id = Number(idParam);
      if (!idParam || isNaN(id) || id <= 0 || !Number.isInteger(id)) {
        this.loadError.set('Identificador de processo inválido.');
        return;
      }
      this.processoId = id;
      this.carregarProcesso(id);
    }
  }

  carregarProcesso(id: number): void {
    this.isLoading.set(true);
    this.loadError.set(null);
    this.errorMessage.set(null);

    this.processoService.buscarPorId(id).subscribe({
      next: (dados) => {
        this.isLoading.set(false);
        if (dados.modalidade && !this.modalidadesOpcoes().includes(dados.modalidade)) {
          this.modalidadesOpcoes.update(lista => [dados.modalidade, ...lista]);
        }
        if (dados.secretaria && !this.secretariasOpcoes().includes(dados.secretaria)) {
          this.secretariasOpcoes.update(lista => [dados.secretaria, ...lista]);
        }
        const dataFormatada = dados.dataAbertura ? dados.dataAbertura.substring(0, 10) : '';
        this.form.patchValue({
          numero: dados.numero,
          objeto: dados.objeto,
          modalidade: dados.modalidade,
          secretaria: dados.secretaria,
          dataAbertura: dataFormatada,
          situacao: dados.situacao
        });
      },
      error: (err) => {
        this.isLoading.set(false);
        if (err.status === 404) {
          this.loadError.set('Processo não encontrado.');
        } else if (err.status === 0) {
          this.loadError.set('Falha de conexão com o servidor. Verifique se a API backend está em execução na porta 5299.');
        } else if (err.status >= 500) {
          this.loadError.set('Erro interno no servidor ao carregar os dados do processo.');
        } else {
          this.loadError.set('Não foi possível carregar os dados do processo para edição.');
        }
      }
    });
  }

  tentarNovamente(): void {
    if (this.processoId) {
      this.carregarProcesso(this.processoId);
    }
  }

  isFieldInvalid(fieldName: string): boolean {
    const field = this.form.get(fieldName);
    return !!(field && field.invalid && (field.dirty || field.touched));
  }

  onSubmit(): void {
    if (this.form.invalid) {
      this.form.markAllAsTouched();
      return;
    }

    this.isSubmitting.set(true);
    this.errorMessage.set(null);

    const formVal = this.form.value;

    if (this.isEditMode() && this.processoId) {
      const dto: EditarProcessoDTO = {
        numero: formVal.numero.trim(),
        objeto: formVal.objeto.trim(),
        modalidade: formVal.modalidade.trim(),
        secretaria: formVal.secretaria.trim(),
        dataAbertura: formVal.dataAbertura
      };

      this.processoService.atualizar(this.processoId, dto).subscribe({
        next: (atualizado) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/processos', atualizado.id]);
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.status === 0) {
            this.errorMessage.set('Falha de conexão com o servidor. Verifique se a API backend está em execução na porta 5299.');
          } else if (err.status === 409) {
            this.errorMessage.set(err.error?.mensagem || `Já existe um processo com o número '${dto.numero}'.`);
          } else if (err.status === 404) {
            this.errorMessage.set('O processo não foi encontrado para atualização.');
          } else if (err.status === 400) {
            const backendMsg = err.error?.mensagem || (typeof err.error === 'string' ? err.error : null);
            this.errorMessage.set(backendMsg || 'Dados inválidos. Verifique as informações preenchidas.');
          } else if (err.status >= 500) {
            this.errorMessage.set('Erro interno no servidor ao atualizar o processo. Tente novamente mais tarde.');
          } else {
            this.errorMessage.set('Erro inesperado ao atualizar o processo.');
          }
        }
      });
    } else {
      const dto: CriarProcessoDTO = {
        numero: formVal.numero.trim(),
        objeto: formVal.objeto.trim(),
        modalidade: formVal.modalidade.trim(),
        secretaria: formVal.secretaria.trim(),
        dataAbertura: formVal.dataAbertura,
        situacao: formVal.situacao
      };

      this.processoService.criar(dto).subscribe({
        next: (criado) => {
          this.isSubmitting.set(false);
          this.router.navigate(['/processos'], {
            state: { mensagem: `Processo nº ${criado.numero} cadastrado com sucesso!` }
          });
        },
        error: (err) => {
          this.isSubmitting.set(false);
          if (err.status === 0) {
            this.errorMessage.set('Falha de conexão com o servidor. Verifique se a API backend está em execução na porta 5299.');
          } else if (err.status === 409) {
            this.errorMessage.set(err.error?.mensagem || `Já existe um processo com o número '${dto.numero}'.`);
          } else if (err.status === 400) {
            const backendMsg = err.error?.mensagem || (typeof err.error === 'string' ? err.error : null);
            this.errorMessage.set(backendMsg || 'Dados inválidos. Verifique as informações preenchidas.');
          } else if (err.status >= 500) {
            this.errorMessage.set('Erro interno no servidor ao cadastrar o processo. Tente novamente mais tarde.');
          } else {
            this.errorMessage.set('Erro inesperado ao cadastrar o processo.');
          }
        }
      });
    }
  }
}
