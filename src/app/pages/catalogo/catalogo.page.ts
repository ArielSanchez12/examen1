import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { PlanesService } from '../../services/planes';
import { AuthService } from '../../services/auth';
import { Plan } from '../../models/plan.model';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule]
})
export class CatalogoPage implements OnInit {
  planes: Plan[] = [];
  planesFiltrados: Plan[] = [];
  loading = false;
  searchText = '';
  selectedSegmento = '';
  isAuthenticated = false;
  isAsesor = false;

  constructor(
    private planesService: PlanesService,
    private authService: AuthService,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPlanes();
    this.checkAuth();
  }

  private checkAuth() {
    this.isAuthenticated = this.authService.isAuthenticated;
    this.isAsesor = this.authService.isAsesor;
  }

  private async loadPlanes() {
    this.loading = true;
    try {
      this.planes = await this.planesService.getAllPlanes();
      this.filtrar();
    } catch (error) {
      console.error('Error al cargar planes:', error);
    } finally {
      this.loading = false;
    }
  }

  filtrar() {
    let filtrados = this.planes;

    if (this.searchText) {
      const search = this.searchText.toLowerCase();
      filtrados = filtrados.filter(p =>
        p.nombre.toLowerCase().includes(search) ||
        p.descripcion?.toLowerCase().includes(search)
      );
    }

    if (this.selectedSegmento) {
      filtrados = filtrados.filter(p => p.segmento === this.selectedSegmento);
    }

    this.planesFiltrados = filtrados;
  }

  onSearchChange() {
    this.filtrar();
  }

  onSegmentoChange() {
    this.filtrar();
  }

  irADetalle(id: string) {
    this.router.navigate(['/detalle-plan', id]);
  }

  irALogin() {
    this.router.navigate(['/login']);
  }

  irADashboard() {
    this.router.navigate(['/asesor/dashboard']);
  }

  getSegmentos() {
    const segmentos = new Set(this.planes.map(p => p.segmento));
    return Array.from(segmentos);
  }
}