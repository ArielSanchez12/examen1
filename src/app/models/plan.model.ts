export interface Plan {
  id?: string;
  nombre: string;
  precio: number;
  datos: string;
  minutos: string;
  sms: string;
  velocidad_4g?: string;
  velocidad_5g?: string;
  redes_sociales?: string;
  whatsapp?: string;
  llamadas_internacionales?: string;
  roaming?: string;
  descripcion?: string;
  imagen_url?: string;
  segmento?: string;
  publico_objetivo?: string;
  activo?: boolean;
  created_at?: string;
  updated_at?: string;
}