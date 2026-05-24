import { Tour } from './tour.model';

export interface ReservaHistorial {
  id:                  number;
  accion:              'creada' | 'confirmada' | 'rechazada' | 'cancelada';
  realizada_por_email: string;
  nota:                string;
  created_at:          string;
}

export interface Reserva {
  id:                number;
  tour:              Tour;
  user:              number | null;
  date:              string;
  time_slot:         string;
  adults:            number;
  children:          number;
  language:          string;
  customer_name:     string;
  customer_lastname: string;
  customer_email:    string;
  customer_phone:    string;
  customer_country:  string;
  notes:             string;
  total_amount:      number;
  status:            'pendiente' | 'confirmada' | 'rechazada' | 'cancelada';
  historial:         ReservaHistorial[];
  created_at:        string;
  updated_at:        string;
}
