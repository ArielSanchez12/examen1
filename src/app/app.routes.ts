import { Routes } from '@angular/router';
import { authGuard, asesorGuard, usuarioGuard } from './guards/auth-guard';

export const routes: Routes = [
  { path: '', redirectTo: 'catalogo', pathMatch: 'full' },

  { path: 'catalogo', loadComponent: () => import('./pages/catalogo/catalogo.page').then(m => m.CatalogoPage) },
  { path: 'detalle-plan/:id', loadComponent: () => import('./pages/detalle-plan/detalle-plan.page').then(m => m.DetallePlanPage) },

  { path: 'login', loadComponent: () => import('./pages/login/login.page').then(m => m.LoginPage) },
  { path: 'registro', loadComponent: () => import('./pages/registro/registro.page').then(m => m.RegistroPage) },

  { path: 'mis-contrataciones', loadComponent: () => import('./pages/mis-contrataciones/mis-contrataciones.page').then(m => m.MisContratacionesPage), canActivate: [usuarioGuard] },
  { path: 'chat/:id', loadComponent: () => import('./pages/chat/chat.page').then(m => m.ChatPage), canActivate: [authGuard] },
  { path: 'perfil', loadComponent: () => import('./pages/perfil/perfil.page').then(m => m.PerfilPage), canActivate: [authGuard] },

  { path: 'asesor/dashboard', loadComponent: () => import('./pages/asesor/dashboard/dashboard.page').then(m => m.DashboardPage), canActivate: [asesorGuard] },
  { path: 'asesor/crear-plan', loadComponent: () => import('./pages/asesor/crear-plan/crear-plan.page').then(m => m.CrearPlanPage), canActivate: [asesorGuard] },
  { path: 'asesor/crear-plan/:id', loadComponent: () => import('./pages/asesor/crear-plan/crear-plan.page').then(m => m.CrearPlanPage), canActivate: [asesorGuard] },
  { path: 'asesor/contrataciones', loadComponent: () => import('./pages/asesor/contrataciones/contrataciones.page').then(m => m.ContratacionesPage), canActivate: [asesorGuard] },
  { path: 'asesor/chats', loadComponent: () => import('./pages/asesor/chats/chats.page').then(m => m.ChatsPage), canActivate: [asesorGuard] },
];