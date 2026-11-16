import { timingSafeEqual } from 'node:crypto';

/** ¿la dirección es de la red local? el puente solo atiende a equipos de la misma casa u oficina */
export function esRedLocal(direccion: string | undefined): boolean {
  if (!direccion) return false;
  const limpia = direccion.replace(/^::ffff:/, '');
  if (limpia === '127.0.0.1' || limpia === '::1') return true;
  const partes = limpia.split('.').map(Number);
  if (partes.length !== 4 || partes.some((p) => !Number.isInteger(p) || p < 0 || p > 255)) {
    // IPv6 de enlace local (fe80::) y única local (fc00::/7)
    return /^fe80:/i.test(limpia) || /^f[cd][0-9a-f]{2}:/i.test(limpia);
  }
  const [a, b] = partes as [number, number, number, number];
  return a === 10 || (a === 172 && b >= 16 && b <= 31) || (a === 192 && b === 168) || (a === 169 && b === 254);
}

/** compara el código recibido con el esperado sin dar pistas por el tiempo que tarda */
export function codigoValido(recibido: string | undefined, esperado: string): boolean {
  if (!recibido) return false;
  const a = Buffer.from(recibido);
  const b = Buffer.from(esperado);
  return a.length === b.length && timingSafeEqual(a, b);
}

/** saca el código de una cabecera "Authorization: Bearer <código>" */
export function codigoDeCabecera(cabecera: string | undefined): string | undefined {
  const m = /^Bearer ([0-9a-f]{16,128})$/i.exec(cabecera ?? '');
  return m?.[1];
}

/** un límite simple de pedidos por minuto para que un equipo de la red no sature el puente */
export function crearLimite(maximo: number, ventanaMs = 60_000, ahora: () => number = Date.now) {
  let marcas: number[] = [];
  return (): boolean => {
    const t = ahora();
    marcas = marcas.filter((m) => t - m < ventanaMs);
    if (marcas.length >= maximo) return false;
    marcas.push(t);
    return true;
  };
}
