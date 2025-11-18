import { Injectable } from '@angular/core';
import { SupabaseService } from './supabase';
import { AuthService } from './auth';
import { BehaviorSubject } from 'rxjs';
import { RealtimeChannel } from '@supabase/supabase-js';
import { Mensaje } from '../models/mensaje.model';

@Injectable({
  providedIn: 'root'
})
export class ChatService {
  private mensajesSubject = new BehaviorSubject<Mensaje[]>([]);
  public mensajes$ = this.mensajesSubject.asObservable();
  private channel: RealtimeChannel | null = null;

  constructor(
    private supabase: SupabaseService,
    private auth: AuthService
  ) { }

  async getMensajes(contratacionId: string): Promise<Mensaje[]> {
    try {
      const { data, error } = await this.supabase.client
        .from('mensajes_chat')
        .select(`
          *,
          remitente:perfiles!mensajes_chat_remitente_id_fkey(id, nombre, email)
        `)
        .eq('contratacion_id', contratacionId)
        .order('created_at', { ascending: true });

      if (error) throw error;

      this.mensajesSubject.next(data || []);
      return data || [];
    } catch (error) {
      console.error('Error al cargar mensajes:', error);
      return [];
    }
  }

  subscribeToMessages(contratacionId: string) {
    this.unsubscribeFromMessages();

    this.channel = this.supabase.client
      .channel(`chat-${contratacionId}`)
      .on(
        'postgres_changes',
        {
          event: 'INSERT',
          schema: 'public',
          table: 'mensajes_chat',
          filter: `contratacion_id=eq.${contratacionId}`
        },
        async (payload: any) => {
          const mensaje = await this.supabase.client
            .from('mensajes_chat')
            .select(`
              *,
              remitente:perfiles!mensajes_chat_remitente_id_fkey(id, nombre, email)
            `)
            .eq('id', payload.new['id'])
            .single();

          if (mensaje.data) {
            const mensajesActuales = this.mensajesSubject.value;
            this.mensajesSubject.next([...mensajesActuales, mensaje.data]);
          }
        }
      )
      .subscribe();
  }

  async enviarMensaje(contratacionId: string, mensaje: string) {
    try {
      const { error } = await this.supabase.client
        .from('mensajes_chat')
        .insert([
          {
            contratacion_id: contratacionId,
            remitente_id: this.auth.currentUser?.id,
            mensaje: mensaje
          }
        ]);

      if (error) throw error;
    } catch (error) {
      console.error('Error al enviar mensaje:', error);
      throw error;
    }
  }

  unsubscribeFromMessages() {
    if (this.channel) {
      this.supabase.client.removeChannel(this.channel);
      this.channel = null;
    }
  }
}