import { cobradoPorDia, rankingDeConductores, resumir } from './analitica';
import { dinero } from './formato';
import type { Datos } from '../tipos';

/** dónde corre el puente de Claude Code: por defecto, esta misma Mac */
export const DIRECCION_POR_DEFECTO = 'http://127.0.0.1:4780';

export interface ConexionClaude {
  codigo: string;
  direccion: string;
}

/** la dirección del puente sin barra final; nulo si no es http o https con equipo y puerto */
export function direccionDelPuente(texto: string): string | null {
  try {
    const url = new URL(texto.trim());
    if (url.protocol !== 'http:' && url.protocol !== 'https:') return null;
    if (url.pathname !== '/' || url.search !== '' || url.hash !== '')
      return null;
    if (url.port === '') return null;
    return `${url.protocol}//${url.host}`;
  } catch {
    return null;
  }
}

/** el código de emparejamiento son 48 caracteres hexadecimales */
export function codigoDelPuente(texto: string): string | null {
  const limpio = texto.trim().toLowerCase();
  return /^[0-9a-f]{48}$/.test(limpio) ? limpio : null;
}

type DatosParaClaude = Pick<
  Datos,
  'alertas' | 'boletos' | 'cierres' | 'encomiendas' | 'viajes'
>;

/**
 * un resumen en texto de la operación para que Claude conteste con datos reales; solo números y claves de
 * viajes y conductores: nunca nombres de pasajeros, cédulas, teléfonos ni fotos
 */
export function contextoDeCooperativa(
  d: DatosParaClaude,
  hoy: Date = new Date(),
): string {
  const r = resumir(d);
  const dias = cobradoPorDia(d.cierres, 7, hoy)
    .map(({ dia, total }) => `${dia}: ${dinero(total)}`)
    .join('; ');
  const ranking = rankingDeConductores(d.cierres)
    .slice(0, 5)
    .map(
      (c) =>
        `${c.chofer}: ${dinero(c.cobrado)} en ${c.viajes} viajes con ${c.pasajeros} pasajeros`,
    )
    .join('; ');
  return [
    `Hoy es ${hoy.toDateString()}.`,
    `Viajes activos: ${r.viajesActivos}. Viajes cerrados: ${r.viajesCerrados}.`,
    `Cobrado en total: ${dinero(r.cobrado)}. Por cobrar: ${dinero(r.porCobrar)}. Pasajeros llevados: ${r.pasajeros}.`,
    `Ocupación media de los viajes activos: ${Math.round(r.ocupacionMedia * 100)} %.`,
    `Encomiendas abiertas: ${r.encomiendasAbiertas}. Alertas sin atender: ${r.alertasPendientes}.`,
    `Cobrado por día (últimos 7): ${dias}.`,
    ranking === '' ? '' : `Conductores que más cobraron: ${ranking}.`,
  ]
    .filter((linea) => linea !== '')
    .join('\n');
}

/** las reglas con las que Claude contesta en el panel: breve, en español y solo con lo que se le da */
export function instruccionesDeCooperativa(contexto: string): string {
  return [
    'Sos el asistente del panel de la cooperativa de buses interlocales Andén, en Nicaragua.',
    'Respondé en español, con voseo, directo y breve: primero la respuesta y, si ayuda, un dato más.',
    'Usá solo los datos de abajo. Si algo no está ahí, decí que no lo sabés; no inventes cifras.',
    'Los montos son córdobas (C$).',
    '',
    'Datos de la operación:',
    contexto,
  ].join('\n');
}

/** el tiempo que se espera la respuesta: el puente da hasta 90 segundos, esto le deja un margen */
export const ESPERA_MAXIMA_MS = 100_000;

/** le pregunta a Claude Code por el puente; falla con un mensaje corto que se puede mostrar tal cual */
export async function preguntarAClaude(
  conexion: ConexionClaude,
  instrucciones: string,
  pregunta: string,
  pedir: typeof fetch = fetch,
): Promise<string> {
  let respuesta: Response;
  try {
    respuesta = await pedir(`${conexion.direccion}/preguntar`, {
      body: JSON.stringify({ instrucciones, pregunta }),
      headers: {
        Authorization: `Bearer ${conexion.codigo}`,
        'Content-Type': 'application/json',
      },
      method: 'POST',
      signal: AbortSignal.timeout(ESPERA_MAXIMA_MS),
    });
  } catch {
    throw new Error(
      'No se pudo hablar con el puente. Revisá que esté encendido y que la dirección sea la correcta.',
    );
  }
  if (respuesta.status === 401)
    throw new Error('El código de emparejamiento no es el correcto.');
  if (respuesta.status === 403)
    throw new Error('El puente solo atiende a equipos de tu red local.');
  const cuerpo = (await respuesta.json().catch(() => null)) as {
    error?: string;
    texto?: string;
  } | null;
  if (!respuesta.ok || typeof cuerpo?.texto !== 'string')
    throw new Error(cuerpo?.error ?? 'Claude no pudo responder ahora.');
  return cuerpo.texto.trim();
}
