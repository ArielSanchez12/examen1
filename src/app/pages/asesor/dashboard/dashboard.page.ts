import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { PlanesService } from '../../../services/planes';
import { AuthService } from '../../../services/auth';
import { Plan } from '../../../models/plan.model';

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class DashboardPage implements OnInit {
  planes: Plan[] = [];
  loading = false;
  nombre = '';

  constructor(
    private planesService: PlanesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPlanes();
    const profile = this.authService.currentProfile;
    this.nombre = profile?.nombre || 'Asesor';
  }

  private async loadPlanes() {
    this.loading = true;
    try {
      this.planes = await this.planesService.getAllPlanes();
    } catch (error) {
      console.error('Error al cargar planes:', error);
    } finally {
      this.loading = false;
    }
  }

  irACrearPlan() {
    this.router.navigate(['/asesor/crear-plan']);
  }

  irAEditarPlan(id: string) {
    this.router.navigate(['/asesor/crear-plan', id]);
  }

  async togglePlanActivo(plan: Plan, event: any) {
    const nuevoEstado = event.detail.checked;
    try {
      await this.planesService.togglePlanActivo(plan.id!, nuevoEstado);
      plan.activo = nuevoEstado;
    } catch (error) {
      console.error('Error al actualizar plan:', error);
      event.detail.checked = !nuevoEstado;
    }
  }

  irAContrataciones() {
    this.router.navigate(['/asesor/contrataciones']);
  }

  irAChats() {
    this.router.navigate(['/asesor/chats']);
  }

  irAlPerfil() {
    this.router.navigate(['/perfil']);
  }

  reloadPlanes() {
    this.loadPlanes();
  }
}