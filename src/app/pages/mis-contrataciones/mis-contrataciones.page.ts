import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // ← AGREGAR
import { RouterModule, Router } from '@angular/router';
import { ContratacionesService } from '../../services/contrataciones';
import { Contratacion } from '../../models/contratacion.model';

@Component({
  selector: 'app-mis-contrataciones',
  templateUrl: './mis-contrataciones.page.html',
  styleUrls: ['./mis-contrataciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule] // ← AGREGAR FormsModule
})
export class MisContratacionesPage implements OnInit {
  contrataciones: Contratacion[] = [];
  loading = false;
  selectedFilter = 'todas';

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
      this.contrataciones = await this.contratacionesService.getContratacionesUsuario();
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
      case 'aprobada':
        return 'success';
      case 'rechazada':
        return 'danger';
      case 'pendiente':
        return 'warning';
      default:
        return 'medium';
    }
  }

  getEstadoTexto(estado: string) {
    switch (estado) {
      case 'aprobada':
        return 'Aprobada';
      case 'rechazada':
        return 'Rechazada';
      case 'pendiente':
        return 'Pendiente';
      default:
        return estado;
    }
  }

  irAlChat(contratacionId: string) {
    this.router.navigate(['/chat', contratacionId]);
  }

  irAlDetallePlan(planId: string) {
    this.router.navigate(['/detalle-plan', planId]);
  }

  reloadContrataciones() {
    this.loadContrataciones();
  }
}