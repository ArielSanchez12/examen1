import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { Mensaje } from '../models/mensaje.model';
import { BehaviorSubject, RealtimeChannel } from '@supabase/supabase-js';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private mensajesSubject = new BehaviorSubject<Mensaje[]>([]);
  public mensajes$ = this.mensajesSubject.asObservable();
  private channel?: RealtimeChannel;

  constructor(private supabase: SupabaseService) {}

  async enviarMensaje(contratacionId: string, mensaje: string) {
    const userId = this.supabase.user?.id;
    if (!userId) throw new Error('Usuario no autenticado');

    const { data, error } = await this.supabase.client
      .from('mensajes_chat')
      .insert({
        contratacion_id: contratacionId,
        remitente_id: userId,
        mensaje
      })
      .select(`
        *,
        remitente:perfiles(*)
      `)
      .single();

    if (error) throw error;
    return data;
  }

  async getMensajes(contratacionId: string) {
    const { data, error } = await this.supabase.client
      .from('mensajes_chat')
      .select(`
        *,
        remitente:perfiles(*)
      `)
      .eq('contratacion_id', contratacionId)
      .order('created_at', { ascending: true });

    if (error) throw error;
    this.mensajesSubject.next(data || []);
    return data || [];
  }

  subscribeToMessages(contratacionId: string) {
    this.channel = this.supabase.client
      .channel(`chat_${contratacionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
          filter: `contratacion_id=eq.${contratacionId}`
        },
        async (payload) => {
          const { data } = await this.supabase.client
            .from('mensajes_chat')
            .select(`
              *,
              remitente:perfiles(*)
            `)
            .eq('id', payload.new.id)
            .single();

          if (data) {
            const mensajes = this.mensajesSubject.value;
            this.mensajesSubject.next([...mensajes, data]);
          }
        }
      )
      .subscribe();
  }

  unsubscribeFromMessages() {
    if (this.channel) {
      this.supabase.client.removeChannel(this.channel);
      this.channel = undefined;
    }
    this.mensajesSubject.next([]);
  }
}