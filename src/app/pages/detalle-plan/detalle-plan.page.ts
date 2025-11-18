import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlanesService } from '../../services/planes';
import { ContratacionesService } from '../../services/contrataciones';
import { AuthService } from '../../services/auth';
import { Plan } from '../../models/plan.model';

@Component({
  selector: 'app-detalle-plan',
  templateUrl: './detalle-plan.page.html',
  styleUrls: ['./detalle-plan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class DetallePlanPage implements OnInit {
  plan: Plan | null = null;
  loading = false;
  contratando = false;
  isAuthenticated = false;
  isAsesor = false;
  planId: string = '';

  constructor(
    private route: ActivatedRoute,
    private router: Router,
    private planesService: PlanesService,
    private contratacionesService: ContratacionesService,
    private authService: AuthService,
    private alertController: AlertController
  ) {}

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.planId = params['id'];
      this.loadPlan();
    });
    this.isAuthenticated = this.authService.isAuthenticated;
    this.isAsesor = this.authService.isAsesor;
  }

  private async loadPlan() {
    this.loading = true;
    try {
      this.plan = await this.planesService.getPlanById(this.planId);
    } catch (error) {
      console.error('Error al cargar plan:', error);
    } finally {
      this.loading = false;
    }
  }

  async contratarPlan() {
    if (!this.isAuthenticated) {
      const alert = await this.alertController.create({
        header: 'Contratar Plan',
        message: 'Debes iniciar sesión para contratar un plan',
        buttons: [
          { text: 'Cancelar', role: 'cancel' },
          { text: 'Iniciar Sesión', handler: () => this.router.navigate(['/login']) }
        ]
      });
      await alert.present();
      return;
    }

    this.contratando = true;
    try {
      await this.contratacionesService.crearContratacion(this.planId);
      const alert = await this.alertController.create({
        header: 'Éxito',
        message: 'Plan contratado correctamente. Revisa tus contrataciones.',
        buttons: [
          { text: 'Aceptar', handler: () => this.router.navigate(['/mis-contrataciones']) }
        ]
      });
      await alert.present();
    } catch (error) {
      const alert = await this.alertController.create({
        header: 'Error',
        message: 'No se pudo contratar el plan. Intenta más tarde.',
        buttons: ['Aceptar']
      });
      await alert.present();
    } finally {
      this.contratando = false;
    }
  }

  async editarPlan() {
    this.router.navigate(['/asesor/crear-plan', this.planId]);
  }

  goBack() {
    this.router.navigate(['/catalogo']);
  }
}