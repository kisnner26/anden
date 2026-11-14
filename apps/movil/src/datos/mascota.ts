import AsyncStorage from '@react-native-async-storage/async-storage';

import { formatoDuracion } from './formato';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export const CLAVE_MASCOTA = 'anden.mascota';
export const CLAVE_CONSEJOS_VISTOS = 'anden.mascotaVistos';

/** el ánimo de Pito: cambia su cara y cómo se mueve */
export type Humor =
  'alerta' | 'celebrando' | 'dormido' | 'feliz' | 'pensando' | 'saludando';

export type PantallaMascota = 'boletos' | 'horarios' | 'rutas' | 'viajar';

export interface ContextoMascota {
  ahora: Date;
  /** el boleto vigente que sale primero; nulo si no hay */
  boletoProximo: { destino: string; minutos: number; punto: string } | null;
  haySalidasHoy: boolean;
  nombre: string;
  pantalla: PantallaMascota;
  /** hay un viaje ya hecho al que todavía no se le dejó opinión */
  porCalificar: boolean;
  sinBoletos: boolean;
}

export interface Consejo {
  humor: Humor;
  /** cambia con el contenido para que un consejo nuevo no quede tapado por uno ya visto */
  id: string;
  texto: string;
}

/** un punto de encuentro corto para decirlo en voz alta: los últimos siete signos */
function puntoCorto(punto: string): string {
  return punto === '' ? '' : punto.slice(-7);
}

function saludoDeLaHora(hora: number, nombre: string): string {
  const clave =
    hora < 12
      ? 'mascota.saludoManana'
      : hora < 18
        ? 'mascota.saludoTarde'
        : 'mascota.saludoNoche';
  return rellenar(t(clave), { nombre });
}

/**
 * lo que Pito le dice a la persona en cada pantalla, según lo que tenga en marcha: lo urgente primero (un bus
 * por salir), después lo útil (calificar, un truco) y, si no hay nada, un saludo; nunca dos veces lo mismo el
 * mismo día
 */
export function consejoDeLaMascota(contexto: ContextoMascota): Consejo | null {
  const { boletoProximo, nombre, pantalla } = contexto;
  const hora = contexto.ahora.getHours();

  if (
    boletoProximo &&
    boletoProximo.minutos >= 0 &&
    boletoProximo.minutos <= 15
  ) {
    return {
      humor: 'alerta',
      id: `inminente:${boletoProximo.destino}`,
      texto: rellenar(t('mascota.inminente'), {
        destino: boletoProximo.destino,
        minutos: boletoProximo.minutos,
        punto: puntoCorto(boletoProximo.punto),
      }),
    };
  }
  if (
    boletoProximo &&
    boletoProximo.minutos > 15 &&
    boletoProximo.minutos <= 180
  ) {
    return {
      humor: 'feliz',
      id: `pronto:${boletoProximo.destino}`,
      texto: rellenar(t('mascota.pronto'), {
        destino: boletoProximo.destino,
        tiempo: formatoDuracion(boletoProximo.minutos),
      }),
    };
  }
  if (contexto.porCalificar) {
    return {
      humor: 'pensando',
      id: 'calificar',
      texto: t('mascota.calificar'),
    };
  }

  switch (pantalla) {
    case 'viajar':
      if (hora >= 21 || hora < 4) {
        return {
          humor: 'dormido',
          id: 'tarde-noche',
          texto: t('mascota.noche'),
        };
      }
      return {
        humor: 'saludando',
        id: `saludo:${hora < 12 ? 'm' : hora < 18 ? 't' : 'n'}`,
        texto: saludoDeLaHora(hora, nombre),
      };
    case 'boletos':
      return contexto.sinBoletos
        ? {
            humor: 'pensando',
            id: 'sin-boletos',
            texto: t('mascota.sinBoletos'),
          }
        : {
            humor: 'feliz',
            id: 'truco-arrastrar',
            texto: t('mascota.trucoArrastrar'),
          };
    case 'horarios':
      return contexto.haySalidasHoy
        ? {
            humor: 'feliz',
            id: 'truco-deslizar',
            texto: t('mascota.trucoDeslizar'),
          }
        : {
            humor: 'dormido',
            id: 'sin-salidas-hoy',
            texto: t('mascota.sinSalidasHoy'),
          };
    case 'rutas':
      return {
        humor: 'pensando',
        id: 'truco-rutas',
        texto: t('mascota.trucoRutas'),
      };
  }
}

/** los consejos ya mostrados: cada id con el día en que se vio */
export type ConsejosVistos = Readonly<Record<string, string>>;

function claveDelDia(fecha: Date): string {
  const mes = String(fecha.getMonth() + 1).padStart(2, '0');
  const dia = String(fecha.getDate()).padStart(2, '0');
  return `${fecha.getFullYear()}-${mes}-${dia}`;
}

/** un consejo se muestra una vez por día */
export function yaSeVioHoy(
  vistos: ConsejosVistos,
  id: string,
  ahora: Date,
): boolean {
  return vistos[id] === claveDelDia(ahora);
}

export function marcarVisto(
  vistos: ConsejosVistos,
  id: string,
  ahora: Date,
): ConsejosVistos {
  const hoy = claveDelDia(ahora);
  // se conservan solo los de hoy: la lista no crece con los días
  const deHoy = Object.fromEntries(
    Object.entries(vistos).filter(([, dia]) => dia === hoy),
  );
  return { ...deHoy, [id]: hoy };
}

export async function leerMascotaActiva(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_MASCOTA)) === '1';
  } catch {
    return false;
  }
}

export async function guardarMascotaActiva(activa: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_MASCOTA, activa ? '1' : '0');
}

export async function leerConsejosVistos(): Promise<ConsejosVistos> {
  try {
    const crudo = await AsyncStorage.getItem(CLAVE_CONSEJOS_VISTOS);
    const valor: unknown = crudo === null ? {} : JSON.parse(crudo);
    return typeof valor === 'object' && valor !== null && !Array.isArray(valor)
      ? (valor as ConsejosVistos)
      : {};
  } catch {
    return {};
  }
}

export async function guardarConsejosVistos(
  vistos: ConsejosVistos,
): Promise<void> {
  await AsyncStorage.setItem(CLAVE_CONSEJOS_VISTOS, JSON.stringify(vistos));
}
