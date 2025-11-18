import { Injectable } from '@angular/core';
import { createClient, SupabaseClient, User } from '@supabase/supabase-js';
import { environment } from '../../environments/environment';
import { BehaviorSubject } from 'rxjs';
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
      environment.supabase.key,
      {
        auth: {
          persistSession: true,
          autoRefreshToken: true,
          detectSessionInUrl: true,
          flowType: 'pkce',
          storageKey: 'sb-auth-token',
          storage: window.localStorage
        },
        global: {
          headers: {
            'Accept': 'application/json',
            'Content-Type': 'application/json'
          }
        }
      }
    );
    
    this.initializeAuth();
  }

  private async initializeAuth() {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      
      if (session?.user) {
        this.currentUserSubject.next(session.user);
        await this.loadProfile(session.user.id);
      }

      this.supabase.auth.onAuthStateChange(async (event, session) => {
        console.log('Auth event:', event);
        
        if (session?.user) {
          this.currentUserSubject.next(session.user);
          await this.loadProfile(session.user.id);
        } else {
          this.currentUserSubject.next(null);
          this.currentProfileSubject.next(null);
        }
      });
    } catch (error) {
      console.error('Error initializing auth:', error);
      this.currentUserSubject.next(null);
      this.currentProfileSubject.next(null);
    }
  }

  private async loadProfile(userId: string) {
    try {
      const { data, error } = await this.supabase
        .from('perfiles')
        .select('*')
        .eq('id', userId)
        .single();

      if (error) {
        console.error('Error loading profile:', error);
        this.currentProfileSubject.next(null);
        return;
      }

      this.currentProfileSubject.next(data);
    } catch (error) {
      console.error('Error loading profile:', error);
      this.currentProfileSubject.next(null);
    }
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

  async isAuthenticated(): Promise<boolean> {
    try {
      const { data: { session } } = await this.supabase.auth.getSession();
      return !!session?.user;
    } catch {
      return false;
    }
  }

  // Métodos para manejo de archivos en Storage
  async uploadFile(bucket: string, path: string, file: File): Promise<{ data: any; error: any }> {
    return await this.supabase.storage.from(bucket).upload(path, file, {
      cacheControl: '3600',
      upsert: true
    });
  }

  getPublicUrl(bucket: string, path: string): string {
    const { data } = this.supabase.storage.from(bucket).getPublicUrl(path);
    return data.publicUrl;
  }

  async deleteFile(bucket: string, path: string): Promise<{ data: any; error: any }> {
    return await this.supabase.storage.from(bucket).remove([path]);
  }
}