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
  ) { }

  async signUp(email: string, password: string, nombre: string, rol: 'usuario_registrado' | 'asesor_comercial' = 'usuario_registrado') {
    try {
      // PASO 1: Registrar en auth
      const { data, error } = await this.supabase.client.auth.signUp({
        email,
        password,
        options: {
          data: {
            nombre,
            rol
          }
        }
      });

      if (error) throw error;
      if (!data.user) throw new Error('No se pudo crear el usuario');

      // PASO 2: Esperar a que la sesión se establezca completamente
      await new Promise(resolve => setTimeout(resolve, 1000));

      // PASO 3: Obtener el token de sesión
      const { data: { session } } = await this.supabase.client.auth.getSession();

      if (!session) {
        // Si no hay sesión, intentar con una pausa más larga
        await new Promise(resolve => setTimeout(resolve, 2000));
      }

      // PASO 4: Insertar perfil con el usuario recién creado
      const { error: profileError } = await this.supabase.client
        .from('perfiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          nombre: nombre,
          rol: rol
        });

      if (profileError) {
        console.error('Error creando perfil:', profileError);
        throw new Error(`Error al crear el perfil: ${profileError.message}`);
      }

      return { success: true, data };
    } catch (error: any) {
      console.error('Error en registro:', error);
      return { success: false, error: error.message };
    }
  }

  async signIn(email: string, password: string) {
    try {
      const { data, error } = await this.supabase.client.auth.signInWithPassword({
        email,
        password
      });

      if (error) throw error;

      await new Promise(resolve => setTimeout(resolve, 500));

      return { success: true, data };
    } catch (error: any) {
      console.error('Error en login:', error);
      return { success: false, error: error.message };
    }
  }

  async signOut() {
    try {
      const { error } = await this.supabase.client.auth.signOut();
      if (error) throw error;

      this.router.navigate(['/catalogo']);
      return { success: true };
    } catch (error: any) {
      console.error('Error en logout:', error);
      return { success: false, error: error.message };
    }
  }

  // Propiedades síncronas
  get isAuthenticated(): boolean {
    return !!this.supabase.user;
  }

  get isAsesor(): boolean {
    return this.supabase.profile?.rol === 'asesor_comercial';
  }

  get isUsuarioRegistrado(): boolean {
    return this.supabase.profile?.rol === 'usuario_registrado';
  }

  get currentUser() {
    return this.supabase.user;
  }

  get currentProfile() {
    return this.supabase.profile;
  }

  getCurrentUser() {
    return this.supabase.user;
  }

  getCurrentProfile() {
    return this.supabase.profile;
  }
}