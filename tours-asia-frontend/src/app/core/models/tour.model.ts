import { Destino } from './destino.model';

export interface Tour {
  id: number;
  destino: Destino;
  name: string;
  duration: number;
  price: number;
  photo_url: string;
  description: string;
  what_includes: string[];
  what_not_includes: string[];
  meeting_point: string;
  time_slots: string[];
  is_popular: boolean;
  rating: number;
  reviews_count: number;
}
