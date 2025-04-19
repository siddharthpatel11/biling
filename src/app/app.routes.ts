import { RouterModule, Routes } from '@angular/router';
import { ListComponent } from './component/list/list.component';
import { CreateComponent } from './component/create/create.component';
import { CalcComponent } from './component/calc/calc.component';
import { NgModule } from '@angular/core';
import { LoginComponent } from './component/login/login.component';

export const routes: Routes = [
  { path: '', component: ListComponent },
  { path: 'invoice', component: ListComponent },
  { path: 'invoice/create', component: CreateComponent },
  { path: 'invoice/edit/:invoiceno', component: CreateComponent },
  {path: 'calc', component: CalcComponent },
  {path: 'login', component: LoginComponent },
  { path: '**', redirectTo: '/invoice' }
];
@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
