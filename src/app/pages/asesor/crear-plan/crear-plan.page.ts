import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { IonicModule, AlertController } from '@ionic/angular';
import { ActivatedRoute, Router, RouterModule } from '@angular/router';
import { PlanesService } from '../../../services/planes';
import { Plan } from '../../../models/plan.model';

@Component({
  selector: 'app-crear-plan',
  templateUrl: './crear-plan.page.html',
  styleUrls: ['./crear-plan.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, ReactiveFormsModule, RouterModule]
})
export class CrearPlanPage implements OnInit {
  planForm: FormGroup;
  loading = false;
  enviando = false;
  isEditing = false;
  planId: string | null = null;
  imagenSeleccionada: File | null = null;
  imagenPreview: string | null = null;
  imagenActual: string | null = null;

  constructor(
    private fb: FormBuilder,
    private planesService: PlanesService,
    private route: ActivatedRoute,
    private router: Router,
    private alertController: AlertController
  ) {
    this.planForm = this.fb.group({
      nombre: ['', [Validators.required, Validators.minLength(3)]],
      precio: ['', [Validators.required, Validators.min(0)]],
      datos: ['', Validators.required],
      minutos: ['', Validators.required],
      sms: ['', Validators.required],
      velocidad_4g: [''],
      velocidad_5g: [''],
      redes_sociales: [''],
      whatsapp: [''],
      llamadas_internacionales: [''],
      roaming: [''],
      descripcion: [''],
      segmento: ['', Validators.required],
      publico_objetivo: [''],
      activo: [true]
    });
  }

  ngOnInit() {
    this.route.params.subscribe(params => {
      if (params['id']) {
        this.isEditing = true;
        this.planId = params['id'];
        this.loadPlan();
      }
    });
  }

  private async loadPlan() {
    this.loading = true;
    try {
      const plan = await this.planesService.getPlanById(this.planId!);
      if (plan) {
        this.planForm.patchValue({
          nombre: plan.nombre,
          precio: plan.precio,
          datos: plan.datos,
          minutos: plan.minutos,
          sms: plan.sms,
          velocidad_4g: plan.velocidad_4g || '',
          velocidad_5g: plan.velocidad_5g || '',
          redes_sociales: plan.redes_sociales || '',
          whatsapp: plan.whatsapp || '',
          llamadas_internacionales: plan.llamadas_internacionales || '',
          roaming: plan.roaming || '',
          descripcion: plan.descripcion || '',
          segmento: plan.segmento || '',
          publico_objetivo: plan.publico_objetivo || '',
          activo: plan.activo !== false
        });
        this.imagenActual = plan.imagen_url || null;
      }
    } catch (error) {
      console.error('Error al cargar plan:', error);
    } finally {
      this.loading = false;
    }
  }

  onImagenSeleccionada(event: any) {
    const file = event.target.files[0];
    if (file) {
      // Validar tamaño (5MB)
      if (file.size > 5 * 1024 * 1024) {
        this.mostrarError('La imagen no debe exceder 5MB');
        return;
      }

      // Validar tipo
      if (!['image/jpeg', 'image/png'].includes(file.type)) {
        this.mostrarError('Solo se aceptan imágenes JPG y PNG');
        return;
      }

      this.imagenSeleccionada = file;

      // Preview
      const reader = new FileReader();
      reader.onload = (e: any) => {
        this.imagenPreview = e.target.result;
      };
      reader.readAsDataURL(file);
    }
  }

  async onGuardar() {
    if (this.planForm.invalid) {
      this.mostrarError('Por favor completa todos los campos requeridos');
      return;
    }

    this.enviando = true;

    try {
      const planData: Plan = this.planForm.value;

      if (this.isEditing && this.planId) {
        await this.planesService.updatePlan(this.planId, planData, this.imagenSeleccionada || undefined);
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Plan actualizado correctamente',
          buttons: [{ text: 'Aceptar', handler: () => this.router.navigate(['/asesor/dashboard']) }]
        });
        await alert.present();
      } else {
        await this.planesService.createPlan(planData, this.imagenSeleccionada || undefined);
        const alert = await this.alertController.create({
          header: 'Éxito',
          message: 'Plan creado correctamente',
          buttons: [{ text: 'Aceptar', handler: () => this.router.navigate(['/asesor/dashboard']) }]
        });
        await alert.present();
      }
    } catch (error: any) {
      this.mostrarError(error.message || 'Error al guardar el plan');
    } finally {
      this.enviando = false;
    }
  }

  private async mostrarError(mensaje: string) {
    const alert = await this.alertController.create({
      header: 'Error',
      message: mensaje,
      buttons: ['Aceptar']
    });
    await alert.present();
  }

  goBack() {
    this.router.navigate(['/asesor/dashboard']);
  }

  eliminarImagenSeleccionada() {
    this.imagenSeleccionada = null;
    this.imagenPreview = null;
  }
}