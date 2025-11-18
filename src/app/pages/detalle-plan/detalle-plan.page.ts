import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController, LoadingController } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlanesService } from '../../services/planes';
import { ContratacionesService } from '../../services/contrataciones';
import { AuthService } from '../../services/auth';
import { SupabaseService } from '../../services/supabase';
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
    private supabase: SupabaseService,
    private alertController: AlertController,
    private loadingController: LoadingController
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.planId = params['id'];
      this.loadPlan();
    });
    // FIX: Sin paréntesis - son getters, no métodos
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
    try {
      // Verificar autenticación usando el método async de SupabaseService
      const isAuth = await this.supabase.isAuthenticated();

      if (!isAuth) {
        const alert = await this.alertController.create({
          header: 'No autenticado',
          message: 'Debes iniciar sesión para contratar un plan',
          buttons: [
            {
              text: 'Cancelar',
              role: 'cancel'
            },
            {
              text: 'Ir a Login',
              handler: () => {
                this.router.navigate(['/login'], {
                  queryParams: { returnUrl: `/detalle-plan/${this.planId}` }
                });
              }
            }
          ]
        });
        await alert.present();
        return;
      }

      const loading = await this.loadingController.create({
        message: 'Procesando contratación...'
      });
      await loading.present();

      const result = await this.contratacionesService.crearContratacion(this.planId);

      await loading.dismiss();

      if (result.success) {
        const alert = await this.alertController.create({
          header: '✅ Contratación exitosa',
          message: 'Tu solicitud ha sido enviada. Un asesor la revisará pronto.',
          buttons: [
            {
              text: 'Ver mis contrataciones',
              handler: () => {
                this.router.navigate(['/mis-contrataciones']);
              }
            }
          ]
        });
        await alert.present();
      } else {
        const alert = await this.alertController.create({
          header: '❌ Error',
          message: result.error || 'No se pudo contratar el plan. Intenta más tarde.',
          buttons: ['OK']
        });
        await alert.present();
      }
    } catch (error: any) {
      console.error('Error en contratación:', error);
      const alert = await this.alertController.create({
        header: '❌ Error',
        message: 'Ocurrió un error inesperado',
        buttons: ['OK']
      });
      await alert.present();
    }
  }

  async editarPlan() {
    this.router.navigate(['/asesor/crear-plan', this.planId]);
  }

  goBack() {
    this.router.navigate(['/catalogo']);
  }
}