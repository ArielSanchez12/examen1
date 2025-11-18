import { Perfil } from './perfil.model';

export interface Mensaje {
  id?: string;
  contratacion_id: string;
  remitente_id: string;
  mensaje: string;
  created_at?: string;
  // Relación
  remitente?: Perfil;
}