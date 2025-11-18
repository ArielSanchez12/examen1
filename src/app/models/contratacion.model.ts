import { Plan } from './plan.model';
import { Perfil } from './perfil.model';

export interface Contratacion {
  id?: string;
  usuario_id: string;
  plan_id: string;
  estado: 'pendiente' | 'aprobada' | 'rechazada';
  fecha_contratacion?: string;
  notas?: string;
  // Relaciones (para joins)
  plan?: Plan;
  usuario?: Perfil;
}