import * as SecureStore from 'expo-secure-store';

const CLAVE_URL = 'anden.puente.url';
const CLAVE_CODIGO = 'anden.puente.codigo';
const ESPERA_MS = 95_000;

export interface PuenteClaude {
  codigo: string;
  url: string;
}

/**
 * la dirección del puente si es de la red local (192.168.x.x, 10.x.x.x, 172.16 a 31, o un nombre .local) y lleva puerto;
 * así nadie puede apuntar la app a un servidor de internet por error y mandarle las preguntas
 */
export function urlDelPuente(texto: string): string | null {
  const limpia = texto.trim().replace(/\/+$/, '');
  const m = /^(https?):\/\/([a-z0-9.-]+):(\d{2,5})$/i.exec(limpia);
  if (!m) return null;
  const host = m[2]!;
  const puerto = Number(m[3]);
  if (puerto < 1 || puerto > 65535) return null;
  if (/\.local$/i.test(host))
    return `${m[1]!.toLowerCase()}://${host}:${puerto}`;
  const partes = host.split('.').map(Number);
  if (
    partes.length !== 4 ||
    partes.some((p) => !Number.isInteger(p) || p < 0 || p > 255)
  )
    return null;
  const [a, b] = partes as [number, number, number, number];
  const privada =
    a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168);
  return privada ? `${m[1]!.toLowerCase()}://${host}:${puerto}` : null;
}

/** el código de emparejamiento que muestra el puente: 48 letras y números */
export function codigoDelPuente(texto: string): string | null {
  const limpio = texto.trim().toLowerCase();
  return /^[0-9a-f]{48}$/.test(limpio) ? limpio : null;
}

export async function leerPuente(): Promise<PuenteClaude | null> {
  try {
    const url = await SecureStore.getItemAsync(CLAVE_URL);
    const codigo = await SecureStore.getItemAsync(CLAVE_CODIGO);
    return url && codigo ? { codigo, url } : null;
  } catch {
    return null;
  }
}

export async function guardarPuente(puente: PuenteClaude): Promise<void> {
  await SecureStore.setItemAsync(CLAVE_URL, puente.url);
  await SecureStore.setItemAsync(CLAVE_CODIGO, puente.codigo);
}

export async function borrarPuente(): Promise<void> {
  await SecureStore.deleteItemAsync(CLAVE_URL);
  await SecureStore.deleteItemAsync(CLAVE_CODIGO);
}

async function pedir(
  puente: PuenteClaude,
  ruta: string,
  cuerpo?: unknown,
): Promise<{ texto?: string; error?: string; ok?: boolean }> {
  const control = new AbortController();
  const reloj = setTimeout(() => control.abort(), ESPERA_MS);
  try {
    const respuesta = await fetch(`${puente.url}${ruta}`, {
      ...(cuerpo !== undefined
        ? { body: JSON.stringify(cuerpo), method: 'POST' }
        : { method: 'GET' }),
      headers: {
        Authorization: `Bearer ${puente.codigo}`,
        'Content-Type': 'application/json',
      },
      signal: control.signal,
    });
    const datos = (await respuesta.json().catch(() => ({}))) as {
      error?: string;
      ok?: boolean;
      texto?: string;
    };
    if (!respuesta.ok)
      throw new Error(datos.error ?? `error ${respuesta.status}`);
    return datos;
  } finally {
    clearTimeout(reloj);
  }
}

/** ¿el puente responde y el código es el correcto? */
export async function probarPuente(puente: PuenteClaude): Promise<boolean> {
  try {
    return (await pedir(puente, '/estado')).ok === true;
  } catch {
    return false;
  }
}

/** le pregunta a Claude Code, con la suscripción de la Mac, por el puente; falla si no responde */
export async function preguntarPorPuente(
  puente: PuenteClaude,
  instrucciones: string,
  pregunta: string,
): Promise<string> {
  const { texto } = await pedir(puente, '/preguntar', {
    instrucciones,
    pregunta,
  });
  if (typeof texto !== 'string' || texto.trim() === '')
    throw new Error('sin respuesta');
  return texto.trim();
}
