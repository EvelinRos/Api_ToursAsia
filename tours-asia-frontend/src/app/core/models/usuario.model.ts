export interface Usuario {
  id:         number;
  email:      string;
  first_name: string;
  last_name:  string;
  is_staff:   boolean;
}

/** Endpoint /api/usuarios/ (solo admin) */
export interface UsuarioAdmin {
  id:             number;
  email:          string;
  first_name:     string;
  last_name:      string;
  phone:          string;
  country:        string;
  is_staff:       boolean;
  is_active:      boolean;
  created_at:     string;
  reservas_count: number;
}
