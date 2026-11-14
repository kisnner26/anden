/** las filas que el panel trae del servidor; todas salen de las tablas de Supabase que comparten la app y el panel */
export interface Viaje {
  chofer_id: string;
  estado: string;
  id: string;
  placa: string;
  /** Plus Code de dónde se sube al bus; nulo en los viajes publicados antes de que existiera */
  punto_encuentro: string | null;
  ruta_id: string;
  salida: string;
  salio_en: string | null;
  servicio: string;
}
export interface Boleto {
  actualizado_en: string;
  asiento: number;
  boleto_id: string;
  contenido: {
    boleto?: {
      codigo?: string;
      compradoEn?: string;
      pasajero?: { nombre?: string };
      precio?: number;
    };
    resumen?: { destino?: string; plus?: boolean; unidadPlus?: string };
  } | null;
  estado: string;
  viaje_id: string;
}
export interface Pago {
  boleto_id: string;
  estado: string;
}
export interface Cierre {
  chofer_id: string;
  cerrado_en: string;
  cobrado: number;
  pasajeros: number;
  pendiente: number;
  viaje_id: string;
}
export interface Encomienda {
  actualizada_en: string;
  chofer_id: string | null;
  contenido: {
    codigo: string;
    descripcion: string;
    destino: string;
    origen: string;
    tamano: string;
  };
  creada_en: string;
  estado: string;
  id: string;
  motivo: string | null;
}
export interface Alerta {
  atendida: boolean;
  creada_en: string;
  id: string;
  lat: number | null;
  lng: number | null;
  nombre: string | null;
  tipo: string;
  viaje_id: string | null;
}
export interface Solicitud {
  apellido: string;
  cedula: string;
  creada_en: string;
  estado: string;
  foto_dorso: string;
  foto_frente: string;
  nombre: string;
  telefono: string;
  usuario_id: string;
}
export interface Perfil {
  chofer_id: string | null;
  creado_en: string;
  id: string;
  nombre: string;
  rol: string;
  usuario: string | null;
}
export interface PerfilChofer {
  chofer_id: string;
  foto_url: string | null;
  nombre: string;
}
export interface Transmision {
  lat: number | null;
  lng: number | null;
  viaje_id: string;
}

export interface Datos {
  alertas: Alerta[];
  boletos: Boleto[];
  cargando: boolean;
  choferes: PerfilChofer[];
  cierres: Cierre[];
  encomiendas: Encomienda[];
  pagos: Pago[];
  perfiles: Perfil[];
  recargar: () => Promise<void>;
  solicitudes: Solicitud[];
  transmisiones: Transmision[];
  viajes: Viaje[];
}
