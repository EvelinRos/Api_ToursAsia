export interface Destino {
  id: number;
  name: string;
  country: string;
  cover_url: string;
  description: string;
  highlights: string[];
  totalTours?: number;
}
