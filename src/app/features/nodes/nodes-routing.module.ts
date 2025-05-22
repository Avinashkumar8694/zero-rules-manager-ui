import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { NodesListComponent } from './components/nodes-list/nodes-list.component';

const routes: Routes = [
  {
    path: '',
    component: NodesListComponent
  }
];

@NgModule({
  imports: [RouterModule.forChild(routes)],
  exports: [RouterModule]
})
export class NodesRoutingModule { }