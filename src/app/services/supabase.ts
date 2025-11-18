import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject, Observable } from 'rxjs';
import { Perfil } from '../models/perfil.model';

@Injectable({
  providedIn: 'root'
})
export class SupabaseService {
  private supabase: SupabaseClient;
  private currentUserSubject = new BehaviorSubject<User | null>(null);
  private currentProfileSubject = new BehaviorSubject<Perfil | null>(null);

  public currentUser$ = this.currentUserSubject.asObservable();
  public currentProfile$ = this.currentProfileSubject.asObservable();

  constructor() {
    this.supabase = createClient(
      environment.supabase.url,
      environment.supabase.key
    );
    
    this.loadUser();
    this.supabase.auth.onAuthStateChange((event, session) => {
      if (session?.user) {
        this.currentUserSubject.next(session.user);
        this.loadProfile(session.user.id);
      } else {
        this.currentUserSubject.next(null);
        this.currentProfileSubject.next(null);
      }
    });
  }

  get client() {
    return this.supabase;
  }

  get user() {
    return this.currentUserSubject.value;
  }

  get profile() {
    return this.currentProfileSubject.value;
  }

  private async loadUser() {
    const { data: { user } } = await this.supabase.auth.getUser();
    this.currentUserSubject.next(user);
    if (user) {
      await this.loadProfile(user.id);
    }
  }

  private async loadProfile(userId: string) {
    const { data, error } = await this.supabase
      .from('perfiles')
      .select('*')
      .eq('id', userId)
      .single();
    
    if (data && !error) {
      this.currentProfileSubject.next(data);
    }
  }

  async signUp(email: string, password: string, nombre: string) {
    const { data, error } = await this.supabase.auth.signUp({
      email,
      password,
    });

    if (error) throw error;

    if (data.user) {
      // Crear perfil
      const { error: profileError } = await this.supabase
        .from('perfiles')
        .insert({
          id: data.user.id,
          email: data.user.email,
          nombre,
          rol: 'usuario_registrado'
        });

      if (profileError) throw profileError;
    }

    return data;
  }

  async signIn(email: string, password: string) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email,
      password,
    });

    if (error) throw error;
    return data;
  }

  async signOut() {
    const { error } = await this.supabase.auth.signOut();
    if (error) throw error;
  }

  async uploadFile(bucket: string, path: string, file: File) {
    const { data, error } = await this.supabase.storage
      .from(bucket)
      .upload(path, file, {
        cacheControl: '3600',
        upsert: true
      });

    if (error) throw error;
    return data;
  }

  async deleteFile(bucket: string, path: string) {
    const { error } = await this.supabase.storage
      .from(bucket)
      .remove([path]);

    if (error) throw error;
  }

  getPublicUrl(bucket: string, path: string) {
    const { data } = this.supabase.storage
      .from(bucket)
      .getPublicUrl(path);
    
    return data.publicUrl;
  }
}