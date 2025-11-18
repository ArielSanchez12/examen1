import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { Plan } from '../models/plan.model';
import { BehaviorSubject } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class PlanesService {
  private planesSubject = new BehaviorSubject<Plan[]>([]);
  public planes$ = this.planesSubject.asObservable();

  constructor(private supabase: SupabaseService) {
    this.loadPlanes();
    this.subscribeToChanges();
  }

  private async loadPlanes() {
    const { data, error } = await this.supabase.client
      .from('planes_moviles')
      .select('*')
      .eq('activo', true)
      .order('precio', { ascending: true });

    if (data && !error) {
      this.planesSubject.next(data);
    }
  }

  private subscribeToChanges() {
    this.supabase.client
      .channel('planes_changes')
      .on(
        'postgres_changes',
        {
          event: '*',
          schema: 'public',
          table: 'planes_moviles'
        },
        () => {
          this.loadPlanes();
        }
      )
      .subscribe();
  }

  async getAllPlanes() {
    const { data, error } = await this.supabase.client
      .from('planes_moviles')
      .select('*')
      .order('precio', { ascending: true });

    if (error) throw error;
    return data || [];
  }

  async getPlanById(id: string) {
    const { data, error } = await this.supabase.client
      .from('planes_moviles')
      .select('*')
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async createPlan(plan: Plan, imagen?: File) {
    let imagenUrl = '';

    if (imagen) {
      const fileName = `${Date.now()}_${imagen.name}`;
      const filePath = `planes/${fileName}`;
      
      await this.supabase.uploadFile('planes-imagenes', filePath, imagen);
      imagenUrl = this.supabase.getPublicUrl('planes-imagenes', filePath);
    }

    const { data, error } = await this.supabase.client
      .from('planes_moviles')
      .insert({
        ...plan,
        imagen_url: imagenUrl,
        updated_at: new Date().toISOString()
      })
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async updatePlan(id: string, plan: Partial<Plan>, imagen?: File) {
    let imagenUrl = plan.imagen_url;

    if (imagen) {
      // Eliminar imagen anterior si existe
      if (plan.imagen_url) {
        const oldPath = plan.imagen_url.split('/').slice(-2).join('/');
        await this.supabase.deleteFile('planes-imagenes', oldPath);
      }

      const fileName = `${Date.now()}_${imagen.name}`;
      const filePath = `planes/${fileName}`;
      
      await this.supabase.uploadFile('planes-imagenes', filePath, imagen);
      imagenUrl = this.supabase.getPublicUrl('planes-imagenes', filePath);
    }

    const { data, error } = await this.supabase.client
      .from('planes_moviles')
      .update({
        ...plan,
        imagen_url: imagenUrl,
        updated_at: new Date().toISOString()
      })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }

  async deletePlan(id: string) {
    const plan = await this.getPlanById(id);
    
    if (plan?.imagen_url) {
      const oldPath = plan.imagen_url.split('/').slice(-2).join('/');
      await this.supabase.deleteFile('planes-imagenes', oldPath);
    }

    const { error } = await this.supabase.client
      .from('planes_moviles')
      .delete()
      .eq('id', id);

    if (error) throw error;
  }

  async togglePlanActivo(id: string, activo: boolean) {
    const { error } = await this.supabase.client
      .from('planes_moviles')
      .update({ activo })
      .eq('id', id);

    if (error) throw error;
  }
}