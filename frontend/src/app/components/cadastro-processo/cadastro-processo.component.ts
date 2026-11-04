import { Component, inject, signal } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { ProcessoService } from '../../services/processo.service';
import { CriarProcessoDTO } from '../../models/processo.model';

@Component({
  selector: 'app-cadastro-processo',
  imports: [ReactiveFormsModule, RouterLink],
  templateUrl: './cadastro-processo.component.html',
  styleUrl: './cadastro-processo.component.scss'
})
export class CadastroProcessoComponent {
  private readonly fb = inject(FormBuilder);
  private readonly router = inject(Router);
  private readonly processoService = inject(ProcessoService);

  isSubmitting = signal<boolean>(false);
  errorMessage = signal<string | null>(null);

  readonly situacoesDisponiveis = [
    'Planejado',
    'Em andamento',
    'Concluido',
    'Cancelado'
  ];

  readonly modalidadesComuns = [
    'Pregão Eletrônico',
    'Pregão Presencial',
    'Concorrência',
    'Dispensa de Licitação',
    'Inexigibilidade',
    'Leilão',
    'Diálogo Competitivo'
  ];

  form: FormGroup = this.fb.group({
    numero: ['', [Validators.required, Validators.maxLength(50), Validators.pattern(/^\d{3}\/\d{4}$/)]],
    objeto: ['', [Validators.required]],
    modalidade: ['', [Validators.required, Validators.maxLength(50)]],
    secretaria: ['', [Validators.required, Validators.maxLength(100)]],
    dataAbertura: ['', [Validators.required]],
    situacao: ['Planejado', [Validators.required, Validators.maxLength(20)]]
  });

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
