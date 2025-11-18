import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { FormsModule } from '@angular/forms'; // ← AGREGAR
import { RouterModule } from '@angular/router';
import { ContratacionesService } from '../../../services/contrataciones';
import { Contratacion } from '../../../models/contratacion.model';

@Component({
  selector: 'app-contrataciones',
  templateUrl: './contrataciones.page.html',
  styleUrls: ['./contrataciones.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule] // ← AGREGAR FormsModule
})
export class ContratacionesPage implements OnInit {
  contrataciones: Contratacion[] = [];
  loading = false;
  selectedFilter = 'pendiente';

  constructor(
    private contratacionesService: ContratacionesService,
    private alertController: AlertController
  ) { }

  ngOnInit() {
    this.loadContrataciones();
  }

  private async loadContrataciones() {
    this.loading = true;
    try {
      this.contrataciones = await this.contratacionesService.getAllContrataciones();
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

  async cambiarEstado(contratacion: Contratacion, nuevoEstado: string) {
    try {
      await this.contratacionesService.updateEstado(contratacion.id!, nuevoEstado as any);
      contratacion.estado = nuevoEstado as any;

      const alert = await this.alertController.create({
        header: 'Éxito',
        message: `Contratación ${nuevoEstado}`,
        buttons: ['Aceptar']
      });
      await alert.present();
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo actualizar el estado',
        buttons: ['Aceptar']
      });
      await alert.present();
    }
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

  reloadContrataciones() {
    this.loadContrataciones();
  }
}