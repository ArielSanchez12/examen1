import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { FormsModule } from '@angular/forms'; // <-- agregado
import { PlanesService } from '../../services/planes';
import { AuthService } from '../../services/auth';
import { Plan } from '../../models/plan.model';

@Component({
  selector: 'app-catalogo',
  templateUrl: './catalogo.page.html',
  styleUrls: ['./catalogo.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule, FormsModule] // <-- agregado
})
export class CatalogoPage implements OnInit {
  planes: Plan[] = [];
  planesBasico: Plan[] = [];
  planesIntermedio: Plan[] = [];
  planesPremium: Plan[] = [];
  loading = false;
  isAuthenticated = false;
  isAsesor = false;

  // <-- añadidos para el template
  searchText: string = '';
  selectedSegment: string = 'todos';
  selectedSegmento: string = 'todos';

  constructor(
    private planesService: PlanesService,
    private authService: AuthService,
    private router: Router
  ) { }

  ngOnInit() {
    this.loadPlanes();
    // getters (sin paréntesis)
    this.isAuthenticated = this.authService.isAuthenticated;
    this.isAsesor = this.authService.isAsesor;
    this.selectedSegmento = this.selectedSegment; // sincronizar con el select
  }

  private async loadPlanes() {
    this.loading = true;
    try {
      this.planes = await this.planesService.getAllPlanes();
      this.categorizarPlanes();
    } catch (error) {
      console.error('Error al cargar planes:', error);
      this.planes = [];
    } finally {
      this.loading = false;
    }
  }

  private categorizarPlanes() {
    const norm = (s?: string) => (s || '').toLowerCase();
    this.planesBasico = this.planes.filter(p => {
      const seg = norm(p.segmento);
      return seg.includes('básico') || seg.includes('basico') || seg.includes('entrada');
    });
    this.planesIntermedio = this.planes.filter(p => {
      const seg = norm(p.segmento);
      return seg.includes('medio') || seg.includes('estándar') || seg.includes('estandar');
    });
    this.planesPremium = this.planes.filter(p => {
      const seg = norm(p.segmento);
      return seg.includes('premium') || seg.includes('alto');
    });
  }

  // Getter usado por el template (planesFiltrados)
  get planesFiltrados(): Plan[] {
    const base =
      this.selectedSegment === 'basico' ? this.planesBasico :
        this.selectedSegment === 'intermedio' ? this.planesIntermedio :
          this.selectedSegment === 'premium' ? this.planesPremium :
            this.planes;

    const q = this.searchText.trim().toLowerCase();
    if (!q) return base;

    return base.filter(p => {
      const nombre = (p.nombre || '').toLowerCase();
      const desc = (p.descripcion || '').toLowerCase();
      return nombre.includes(q) || desc.includes(q);
    });
  }

  // Si el template llama este método, no falla (no hace falta lógica adicional)
  onSearchChange() {
    // intencionalmente vacío; el binding bidireccional ya actualiza planesFiltrados
  }

  onSegmentChange(event: any) {
    this.selectedSegment = event?.detail?.value || 'todos';
    this.selectedSegmento = this.selectedSegment; // mantener ambos en sync
  }

  // El template usa onSegmentoChange()
  onSegmentoChange() {
    this.selectedSegment = this.selectedSegmento;
  }

  // Usados por el template
  getSegmentos(): string[] {
    return ['todos', 'basico', 'intermedio', 'premium'];
  }

  irAlPlan(planId: string) {
    this.router.navigate(['/detalle-plan', planId]);
  }

  // El template usa irADetalle()
  irADetalle(planId: string) {
    this.irAlPlan(planId);
  }

  // El template usa irADashboard()
  irADashboard() {
    this.router.navigate(['/asesor/dashboard']);
  }

  reloadPlanes() {
    this.loadPlanes();
  }

  irALogin() {
    this.router.navigate(['/login']);
  }
}