import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';

const routes: Routes = [
  {
    path: 'categories',
    loadChildren: () => import('./features/categories/categories.module').then(m => m.CategoriesModule)
  },
  {
    path: 'nodes',
    loadChildren: () => import('./features/nodes/nodes.module').then(m => m.NodesModule)
  },
  {
    path: 'element-showcase',
    loadChildren: () => import('./features/element-showcase/element-showcase.module').then(m => m.ElementShowcaseModule)
  },
  {
    path: '',
    redirectTo: 'categories',
    pathMatch: 'full'
  }
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
