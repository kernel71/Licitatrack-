export type SituacaoProcesso = 'Planejado' | 'Em andamento' | 'Concluido' | 'Cancelado';

export interface ProcessoLicitatorio {
  id: number;
  numero: string;
  objeto: string;
  modalidade: string;
  secretaria: string;
  dataAbertura: string;
  situacao: SituacaoProcesso | string;
  dataCadastro: string;
}

export interface CriarProcessoDTO {
  numero: string;
  objeto: string;
  modalidade: string;
  secretaria: string;
  dataAbertura: string;
  situacao: SituacaoProcesso | string;
}

