import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { IonicModule, AlertController } from '@ionic/angular';
import { RouterModule, Router } from '@angular/router';
import { AuthService } from '../../services/auth';
import { SupabaseService } from '../../services/supabase';

@Component({
  selector: 'app-perfil',
  templateUrl: './perfil.page.html',
  styleUrls: ['./perfil.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, RouterModule]
})
export class PerfilPage implements OnInit {
  nombre = '';
  email = '';
  rol = '';
  isLoading = false;

  constructor(
    private authService: AuthService,
    private supabaseService: SupabaseService,
    private alertController: AlertController,
    private router: Router
  ) {}

  ngOnInit() {
    this.loadPerfil();
  }

  private loadPerfil() {
    const profile = this.authService.currentProfile;
    if (profile) {
      this.nombre = profile.nombre || '';
      this.email = profile.email || '';
      this.rol = profile.rol || '';
    }
  }

  async cerrarSesion() {
    const alert = await this.alertController.create({
      header: 'Cerrar Sesión',
      message: '¿Estás seguro de que deseas cerrar sesión?',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Cerrar Sesión',
          handler: async () => {
            this.isLoading = true;
            const result = await this.authService.signOut();
            if (result.success) {
              this.router.navigate(['/catalogo']);
            } else {
              const errAlert = await this.alertController.create({
                header: 'Error',
                message: result.error || 'No se pudo cerrar sesión',
                buttons: ['Aceptar']
              });
              await errAlert.present();
            }
            this.isLoading = false;
          }
        }
      ]
    });
    await alert.present();
  }

  irAlCatalogo() {
    this.router.navigate(['/catalogo']);
  }

  getRolTexto() {
    if (this.rol === 'asesor_comercial') {
      return 'Asesor Comercial';
    }
    return 'Usuario Registrado';
  }

  getRolColor() {
    return this.rol === 'asesor_comercial' ? 'success' : 'primary';
  }
}