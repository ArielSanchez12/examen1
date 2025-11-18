import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { Contratacion } from '../models/contratacion.model';

@Injectable({
  providedIn: 'root'
})
export class ContratacionesService {

  constructor(private supabase: SupabaseService) {}

  async crearContratacion(planId: string, notas?: string) {
    const userId = this.supabase.user?.id;
    if (!userId) throw new Error('Usuario no autenticado');

    const { data, error } = await this.supabase.client
      .from('contrataciones')
      .insert({
        usuario_id: userId,
        plan_id: planId,
        estado: 'pendiente',
        notas
      })
      .select(`
        *,
        plan:planes_moviles(*),
        usuario:perfiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getContratacionesUsuario() {
    const userId = this.supabase.user?.id;
    if (!userId) throw new Error('Usuario no autenticado');

    const { data, error } = await this.supabase.client
      .from('contrataciones')
      .select(`
        *,
        plan:planes_moviles(*)
      `)
      .eq('usuario_id', userId)
      .order('fecha_contratacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getAllContrataciones() {
    const { data, error } = await this.supabase.client
      .from('contrataciones')
      .select(`
        *,
        plan:planes_moviles(*),
        usuario:perfiles(*)
      `)
      .order('fecha_contratacion', { ascending: false });

    if (error) throw error;
    return data || [];
  }

  async getContratacionById(id: string) {
    const { data, error } = await this.supabase.client
      .from('contrataciones')
      .select(`
        *,
        plan:planes_moviles(*),
        usuario:perfiles(*)
      `)
      .eq('id', id)
      .single();

    if (error) throw error;
    return data;
  }

  async updateEstado(id: string, estado: 'pendiente' | 'aprobada' | 'rechazada') {
    const { data, error } = await this.supabase.client
      .from('contrataciones')
      .update({ estado })
      .eq('id', id)
      .select()
      .single();

    if (error) throw error;
    return data;
  }
}