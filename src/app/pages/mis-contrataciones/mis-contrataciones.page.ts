import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms';
import { RouterModule, Router } from '@angular/router';
import { ContratacionesService } from '../../services/contrataciones';
import { Contratacion } from '../../models/models';

@Component({
  selector: 'app-mis-contrataciones',
  templateUrl: './mis-contrataciones.page.html',
  styleUrls: ['./mis-contrataciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule]
})
export class MisContratacionesPage implements OnInit {
  contrataciones: Contratacion[] = [];
  loading = false;
  selectedFilter: string = 'todas';

  constructor(
    private contratacionesService: ContratacionesService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadContrataciones();
  }

  private async loadContrataciones() {
    this.loading = true;
    try {
      this.contrataciones = await this.contratacionesService.getMisContrataciones();
    } catch (error) {
      console.error('Error al cargar contrataciones:', error);
    } finally {
      this.loading = false;
    }
  }

  getContratacionesFiltradas() {
    if (this.selectedFilter === 'todas') {
      return this.contrataciones;
    }
    return this.contrataciones.filter(c => c.estado === this.selectedFilter);
  }

  getEstadoColor(estado: string) {
    switch (estado) {
      case 'aceptado': // FIX: antes 'aprobada'
        return 'success';
      case 'rechazado':
        return 'danger';
      case 'pendiente':
        return 'warning';
      case 'cancelado':
        return 'medium';
      default:
        return 'medium';
    }
  }

  getEstadoTexto(estado: string) {
    switch (estado) {
      case 'aceptado':
        return 'Aceptado';
      case 'rechazado':
        return 'Rechazado';
      case 'pendiente':
        return 'Pendiente';
      case 'cancelado':
        return 'Cancelado';
      default:
        return estado;
    }
  }

  irAlChat(contratacionId: number) { // FIX tipo number y ruta
    this.router.navigate(['/pages/chat', contratacionId]);
  }

  irAlDetallePlan(planId: number) { // FIX tipo number y ruta
    this.router.navigate(['/pages/detalle-plan', planId]);
  }

  reloadContrataciones() {
    this.loadContrataciones();
  }

  onSegmentChange(ev: any) {
    const v = ev.detail?.value;
    this.selectedFilter = (v ?? 'todas').toString();
  }
}