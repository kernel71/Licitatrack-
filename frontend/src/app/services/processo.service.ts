import { Injectable, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable } from 'rxjs';
import { environment } from '../../environments/environment';
import { ProcessoLicitatorio, CriarProcessoDTO } from '../models/processo.model';

@Injectable({
  providedIn: 'root'
})
export class ProcessoService {
  private readonly http = inject(HttpClient);
  private readonly baseUrl = `${environment.apiUrl}/processos`;

  listar(): Observable<ProcessoLicitatorio[]> {
    return this.http.get<ProcessoLicitatorio[]>(this.baseUrl);
  }

  criar(dto: CriarProcessoDTO): Observable<ProcessoLicitatorio> {
    return this.http.post<ProcessoLicitatorio>(this.baseUrl, dto);
  }
}

