import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProcessoLicitatorio, CriarProcessoDTO, EditarProcessoDTO, HistoricoProcesso } from '../models/processo.model';

@Injectable({
  providedIn: 'root'
})
export class ProcessoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/processos`;

  listar(): Observable<ProcessoLicitatorio[]> {
    return this.http.get<ProcessoLicitatorio[]>(this.baseUrl);
  }

  buscarPorId(id: number): Observable<ProcessoLicitatorio> {
    return this.http.get<ProcessoLicitatorio>(`${this.baseUrl}/${id}`);
  }

  listarHistorico(id: number): Observable<HistoricoProcesso[]> {
    return this.http.get<HistoricoProcesso[]>(`${this.baseUrl}/${id}/historico`);
  }

  atualizarSituacao(id: number, situacao: string): Observable<ProcessoLicitatorio> {
    return this.http.patch<ProcessoLicitatorio>(`${this.baseUrl}/${id}/situacao`, { situacao });
  }

  criar(dto: CriarProcessoDTO): Observable<ProcessoLicitatorio> {
    return this.http.post<ProcessoLicitatorio>(this.baseUrl, dto);
  }

  atualizar(id: number, dto: EditarProcessoDTO): Observable<ProcessoLicitatorio> {
    return this.http.put<ProcessoLicitatorio>(`${this.baseUrl}/${id}`, dto);
  }
}

