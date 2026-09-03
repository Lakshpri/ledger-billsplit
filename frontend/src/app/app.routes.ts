import { Routes } from '@angular/router';
import { authGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  { path: '', redirectTo: 'groups', pathMatch: 'full' },
  {
    path: 'login',
    loadComponent: () => import('./features/auth/login/login.component').then(m => m.LoginComponent)
  },
  {
    path: 'register',
    loadComponent: () => import('./features/auth/register/register.component').then(m => m.RegisterComponent)
  },
  {
    path: 'groups',
    canActivate: [authGuard],
    loadComponent: () => import('./features/groups/group-list/group-list.component').then(m => m.GroupListComponent)
  },
  {
    path: 'groups/new',
    canActivate: [authGuard],
    loadComponent: () => import('./features/groups/group-create/group-create.component').then(m => m.GroupCreateComponent)
  },
  {
    path: 'groups/:id',
    canActivate: [authGuard],
    loadComponent: () => import('./features/groups/group-detail/group-detail.component').then(m => m.GroupDetailComponent)
  },
  { path: '**', redirectTo: 'groups' }
];
