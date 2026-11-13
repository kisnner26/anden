export interface PosicionBus {
  lat: number;
  lng: number;
  /** metros por segundo; nulo si el teléfono no la da */
  velocidadMs: number | null;
  registradaEn: string;
}

/** todo lo que se sabe en un momento; es un objeto nuevo en cada cambio, así quien lo lee sabe cuándo recalcular */
export interface InstantaneaTransmision {
  activos: readonly string[];
  posiciones: ReadonlyMap<string, PosicionBus>;
  version: number;
}

/** pasado este tiempo sin posiciones nuevas, la unidad se considera sin señal */
export const SEGUNDOS_SIN_SENAL = 90;

/**
 * lo que necesita la app para que un conductor comparta su viaje y los pasajeros lo vean; hoy lo
 * cumple `crearTransmisionLocal` y más adelante Supabase Realtime, con las mismas pruebas
 */
export interface ServicioTransmision {
  activos(): readonly string[];
  detener(viajeId: string): void;
  /** el estado completo; cambia de identidad solo cuando algo cambia, para usarlo con `useSyncExternalStore` */
  instantanea(): InstantaneaTransmision;
  iniciar(viajeId: string, choferId: string): void;
  publicar(viajeId: string, posicion: PosicionBus): void;
  /** avisa cada vez que algo cambia; devuelve cómo dejar de escuchar */
  suscribir(oyente: () => void): () => void;
  ultima(viajeId: string): PosicionBus | null;
  /** número que sube con cada cambio, para saber si hay algo nuevo que leer */
  version(): number;
}

export function sinSenal(
  posicion: PosicionBus | null,
  ahora: Date,
  segundos: number = SEGUNDOS_SIN_SENAL,
): boolean {
  if (!posicion) return true;
  return (
    ahora.getTime() - new Date(posicion.registradaEn).getTime() >
    segundos * 1000
  );
}

/** transmisión en memoria: vive mientras la app está abierta; sirve para probar los dos roles en un teléfono */
export function crearTransmisionLocal(): ServicioTransmision {
  const activos = new Map<string, string>();
  const posiciones = new Map<string, PosicionBus>();
  const oyentes = new Set<() => void>();
  let version = 0;
  let instantanea: InstantaneaTransmision = {
    activos: [],
    posiciones: new Map(),
    version: 0,
  };

  function avisar() {
    version += 1;
    instantanea = {
      activos: [...activos.keys()],
      posiciones: new Map(posiciones),
      version,
    };
    oyentes.forEach((oyente) => oyente());
  }

  return {
    activos: () => [...activos.keys()],
    detener(viajeId) {
      if (!activos.delete(viajeId)) return;
      posiciones.delete(viajeId);
      avisar();
    },
    instantanea: () => instantanea,
    iniciar(viajeId, choferId) {
      activos.set(viajeId, choferId);
      avisar();
    },
    publicar(viajeId, posicion) {
      if (!activos.has(viajeId)) return;
      posiciones.set(viajeId, posicion);
      avisar();
    },
    suscribir(oyente) {
      oyentes.add(oyente);
      return () => {
        oyentes.delete(oyente);
      };
    },
    ultima: (viajeId) => posiciones.get(viajeId) ?? null,
    version: () => version,
  };
}

/** la transmisión que usa toda la app */
export const TRANSMISION: ServicioTransmision = crearTransmisionLocal();
