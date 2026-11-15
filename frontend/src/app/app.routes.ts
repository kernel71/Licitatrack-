import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { DashboardComponent } from './components/dashboard/dashboard.component';
import { ProcessosComponent } from './components/processos/processos.component';
import { CadastroProcessoComponent } from './components/cadastro-processo/cadastro-processo.component';
import { DetalhesProcessoComponent } from './components/detalhes-processo/detalhes-processo.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'dashboard', pathMatch: 'full' },
      { path: 'dashboard', component: DashboardComponent },
      { path: 'processos', component: ProcessosComponent },
      { path: 'processos/novo', component: CadastroProcessoComponent },
      { path: 'processos/:id/editar', component: CadastroProcessoComponent },
      { path: 'processos/:id', component: DetalhesProcessoComponent }
    ]
  },
  { path: '**', redirectTo: 'dashboard' }
];
