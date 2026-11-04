import { Routes } from '@angular/router';
import { LayoutComponent } from './shared/components/layout/layout.component';
import { ProcessosComponent } from './components/processos/processos.component';
import { CadastroProcessoComponent } from './components/cadastro-processo/cadastro-processo.component';

export const routes: Routes = [
  {
    path: '',
    component: LayoutComponent,
    children: [
      { path: '', redirectTo: 'processos', pathMatch: 'full' },
      { path: 'processos', component: ProcessosComponent },
      { path: 'processos/novo', component: CadastroProcessoComponent }
    ]
  },
  { path: '**', redirectTo: 'processos' }
];
