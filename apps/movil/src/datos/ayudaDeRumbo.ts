import type { SenalDeAyuda } from './senalesDeAyuda';
import { t } from '@/textos/t';

/** en qué pantalla está la persona, dicho como lo entendería alguien que no ve la app, para guiar mejor la ayuda */
export type PantallaDeAyuda =
  | 'ajustes'
  | 'boleto'
  | 'busqueda'
  | 'general'
  | 'horarios'
  | 'ingreso'
  | 'pasajeros'
  | 'recibir'
  | 'rutas'
  | 'transferir'
  | 'viajar'
  | 'viaje-conductor';

const RUTAS: readonly (readonly [RegExp, PantallaDeAyuda])[] = [
  [/^\/ingresar/, 'ingreso'],
  [/^\/ajustes/, 'ajustes'],
  [/^\/boleto\//, 'boleto'],
  [/^\/transferir\//, 'transferir'],
  [/^\/recibir/, 'recibir'],
  [/^\/buscar/, 'busqueda'],
  [/^\/viaje\/.*\/pasajeros/, 'pasajeros'],
  [/^\/conductor\/viaje\//, 'viaje-conductor'],
  [/^\/horarios/, 'horarios'],
  [/^\/rutas/, 'rutas'],
  [/^\/viajar/, 'viajar'],
];

export function pantallaDeRuta(ruta: string): PantallaDeAyuda {
  return RUTAS.find(([patron]) => patron.test(ruta))?.[1] ?? 'general';
}

const NOMBRES: Record<PantallaDeAyuda, string> = {
  ajustes: 'los ajustes de la app',
  boleto: 'un boleto',
  busqueda: 'el buscador de salidas',
  general: 'la app',
  horarios: 'los horarios de salidas',
  ingreso: 'el ingreso a la cuenta',
  pasajeros: 'el paso donde se escriben los datos de los pasajeros',
  recibir: 'la pantalla para recibir un boleto con un código',
  rutas: 'las rutas',
  transferir: 'la pantalla para pasar un boleto a otra persona',
  viajar: 'el inicio',
  'viaje-conductor': 'el viaje del conductor con el mapa',
};

export function nombreDePantalla(pantalla: PantallaDeAyuda): string {
  return NOMBRES[pantalla];
}

/** ayudas concretas para los apuros más comunes en cada pantalla; el resto cae en la ayuda general del motivo */
const ESPECIFICAS: Partial<
  Record<PantallaDeAyuda, Partial<Record<SenalDeAyuda, string>>>
> = {
  ajustes: {
    toquesRepetidos:
      'Los ajustes se guardan al primer toque. Si un interruptor no cambia, esperá un segundo y mirá si quedó en su lugar.',
  },
  ingreso: {
    errorIngreso:
      'Revisá que tu usuario y tu contraseña estén bien escritos. Con el ojito podés ver lo que escribís.',
    toquesRepetidos:
      'Si el botón no avanza, revisá que los dos campos tengan algo escrito. Con el ojito podés ver la contraseña.',
  },
  recibir: {
    errorFormulario:
      'El código tiene 8 letras y números. Pedile a quien te lo pasó que lo mande de nuevo y pegalo completo.',
  },
  pasajeros: {
    errorFormulario:
      'Cada asiento necesita nombre y apellido de quien viaja. Revisá los campos marcados en rojo.',
  },
  transferir: {
    toquesRepetidos:
      'Compartí el código con el botón de abajo y esperá: el boleto sale solo cuando la otra persona lo recibe.',
  },
};

/** la ayuda lista para mostrar de inmediato según en qué se trabó la persona y dónde; la IA la mejora si está disponible */
export function ayudaPorDefecto(
  motivo: SenalDeAyuda,
  pantalla: PantallaDeAyuda = 'general',
): string {
  return ESPECIFICAS[pantalla]?.[motivo] ?? t(`mascota.ayuda.${motivo}`);
}

/** lo que se le cuenta a la IA sobre en qué anda la persona, sin datos personales */
export function descripcionDelApuro(motivo: SenalDeAyuda): string {
  switch (motivo) {
    case 'errorIngreso':
      return 'no logra iniciar sesión: ya se equivocó varias veces con el usuario o la contraseña';
    case 'errorFormulario':
      return 'un formulario no la deja avanzar porque faltan datos o están mal escritos';
    case 'reservaFallida':
      return 'no pudo reservar porque el asiento que quería se ocupó justo antes';
    case 'sinConexion':
      return 'se quedó sin internet y la app muestra solo lo guardado';
    case 'toquesRepetidos':
      return 'toca varias veces el mismo lugar de la pantalla y siente que no responde';
  }
}

const PROHIBIDAS = /\b(rumbo|soy|sos|tranquil[oa]|hola|claro|por supuesto)\b/i;

/**
 * si lo que devolvió el modelo sirve de ayuda: una frase directa, ni muy corta ni muy larga, que no se presente, no
 * salude ni diga quién es. Si no, se queda la ayuda escrita
 */
export function esRespuestaUtil(texto: string): boolean {
  const limpio = texto.trim();
  if (limpio.length < 28 || limpio.length > 190) return false;
  if (PROHIBIDAS.test(limpio)) return false;
  if (/[?¿]/.test(limpio)) return false;
  if (/\p{Extended_Pictographic}/u.test(limpio)) return false;
  return /[.!]$/.test(limpio);
}
