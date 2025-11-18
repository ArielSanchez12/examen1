import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  constructor(
    private supabase: SupabaseService,
    private router: Router
  ) {}

  get currentUser() {
    return this.supabase.user;
  }

  get currentProfile() {
    return this.supabase.profile;
  }

  get isAuthenticated() {
    return !!this.supabase.user;
  }

  get isAsesor() {
    return this.supabase.profile?.rol === 'asesor_comercial';
  }

  get isUsuarioRegistrado() {
    return this.supabase.profile?.rol === 'usuario_registrado';
  }

  async signUp(email: string, password: string, nombre: string) {
    try {
      await this.supabase.signUp(email, password, nombre);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signIn(email: string, password: string) {
    try {
      await this.supabase.signIn(email, password);
      
      // Redirigir según rol
      setTimeout(() => {
        if (this.isAsesor) {
          this.router.navigate(['/asesor/dashboard']);
        } else {
          this.router.navigate(['/catalogo']);
        }
      }, 500);
      
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      await this.supabase.signOut();
      this.router.navigate(['/catalogo']);
      return { success: true };
    } catch (error: any) {
      return { success: false, error: error.message };
    }
  }
}