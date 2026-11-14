/**
 * Plus Codes (Open Location Code): el código de Google Maps, como 6CCJ77GQ+XM, o su forma corta 77GQ+XM.
 * Se calcula solo con coordenadas, sin internet. Con 10 dígitos ubica un punto con unos 14 metros de precisión.
 */

const ALFABETO = '23456789CFGHJMPQRVWX';
const SEPARADOR = '+';
const POSICION_SEPARADOR = 8;
const DIGITOS_DE_PAR = 10;
const BASE = 20;
const FILAS = 5;
const COLUMNAS = 4;
const DIGITOS_DE_REJILLA = 5;
const MAXIMO_DE_DIGITOS = 15;
const PRECISION_LATITUD = 25_000_000;
const PRECISION_LONGITUD = 8_192_000;
const VALOR_DE_PAR = [20, 1, 0.05, 0.0025, 0.000125];

export interface PuntoPlus {
  lat: number;
  lng: number;
}

/**
 * las tres terminales de Andén: de ahí se completan los códigos cortos. Un código corto solo dice la
 * posición dentro de una celda de un grado, así que se prueba con cada terminal y se queda el más cercano.
 */
export const REFERENCIAS_PLUS: readonly PuntoPlus[] = [
  { lat: 12.1364, lng: -86.2514 },
  { lat: 12.4693, lng: -85.6597 },
  { lat: 12.1062, lng: -85.3636 },
];

const TRAMO = `[${ALFABETO}]`;
const BUSCAR_CODIGO = new RegExp(
  `${TRAMO}{2,8}\\${SEPARADOR}${TRAMO}{2,7}`,
  'i',
);

function limitarLatitud(lat: number): number {
  return Math.min(90, Math.max(-90, lat));
}

function normalizarLongitud(lng: number): number {
  let normal = lng;
  while (normal < -180) normal += 360;
  while (normal >= 180) normal -= 360;
  return normal;
}

function indice(letra: string): number {
  return ALFABETO.indexOf(letra.toUpperCase());
}

/** el código completo para unas coordenadas; con 10 dígitos queda como 6CCJ77GQ+XM */
export function codificarPlus(lat: number, lng: number, digitos = 10): string {
  const largo = Math.min(MAXIMO_DE_DIGITOS, Math.max(8, digitos));
  let latitud = limitarLatitud(lat);
  const longitud = normalizarLongitud(lng);
  if (latitud === 90) {
    // el polo norte queda fuera de la última celda: se baja un poco para que entre
    latitud -= 1e-9;
  }
  // con enteros se evitan los errores de redondeo de los decimales
  let latVal = Math.floor(
    Math.round((latitud + 90) * PRECISION_LATITUD * 1e6) / 1e6,
  );
  let lngVal = Math.floor(
    Math.round((longitud + 180) * PRECISION_LONGITUD * 1e6) / 1e6,
  );
  let codigo = '';
  if (largo > DIGITOS_DE_PAR) {
    for (let i = 0; i < DIGITOS_DE_REJILLA; i++) {
      codigo =
        ALFABETO[(latVal % FILAS) * COLUMNAS + (lngVal % COLUMNAS)]! + codigo;
      latVal = Math.floor(latVal / FILAS);
      lngVal = Math.floor(lngVal / COLUMNAS);
    }
  } else {
    latVal = Math.floor(latVal / FILAS ** DIGITOS_DE_REJILLA);
    lngVal = Math.floor(lngVal / COLUMNAS ** DIGITOS_DE_REJILLA);
  }
  for (let i = 0; i < DIGITOS_DE_PAR / 2; i++) {
    codigo = ALFABETO[lngVal % BASE]! + codigo;
    codigo = ALFABETO[latVal % BASE]! + codigo;
    latVal = Math.floor(latVal / BASE);
    lngVal = Math.floor(lngVal / BASE);
  }
  const unido =
    codigo.slice(0, POSICION_SEPARADOR) +
    SEPARADOR +
    codigo.slice(POSICION_SEPARADOR);
  return unido.slice(0, largo + 1);
}

/** dice si el texto es un código completo, de 8 a 15 dígitos y con el separador en su lugar */
export function esPlusCompleto(texto: string): boolean {
  const limpio = texto.trim().toUpperCase();
  if (limpio.indexOf(SEPARADOR) !== POSICION_SEPARADOR) return false;
  if (limpio.split(SEPARADOR).length !== 2) return false;
  const letras = limpio.replace(SEPARADOR, '');
  if (letras.length < 8 || letras.length > MAXIMO_DE_DIGITOS) return false;
  if (letras.length % 2 === 1 && letras.length < DIGITOS_DE_PAR) return false;
  if ([...letras].some((letra) => indice(letra) < 0)) return false;
  // la primera letra de latitud no pasa de 9 (90 grados) y la de longitud no pasa de 17 (180)
  return indice(letras[0]!) <= 8 && indice(letras[1]!) <= 17;
}

/** dice si es un código corto, como 77GQ+XM: sin las primeras letras de la zona */
export function esPlusCorto(texto: string): boolean {
  const limpio = texto.trim().toUpperCase();
  const posicion = limpio.indexOf(SEPARADOR);
  if (posicion < 2 || posicion >= POSICION_SEPARADOR || posicion % 2 === 1) {
    return false;
  }
  if (limpio.split(SEPARADOR).length !== 2) return false;
  const letras = limpio.replace(SEPARADOR, '');
  return (
    letras.length >= posicion + 2 &&
    letras.length - 0 <= MAXIMO_DE_DIGITOS - (POSICION_SEPARADOR - posicion) &&
    [...letras].every((letra) => indice(letra) >= 0)
  );
}

/** el centro de la celda que describe un código completo; nulo si no es válido */
export function decodificarPlus(texto: string): PuntoPlus | null {
  if (!esPlusCompleto(texto)) return null;
  const letras = texto.trim().toUpperCase().replace(SEPARADOR, '');
  let lat = -90;
  let lng = -180;
  const pares = Math.min(letras.length, DIGITOS_DE_PAR);
  for (let i = 0; i < pares; i += 2) {
    lat += indice(letras[i]!) * VALOR_DE_PAR[i / 2]!;
    lng += indice(letras[i + 1]!) * VALOR_DE_PAR[i / 2]!;
  }
  let alto = VALOR_DE_PAR[Math.ceil(pares / 2) - 1]!;
  let ancho = alto;
  if (letras.length > DIGITOS_DE_PAR) {
    let filaAlto = alto;
    let colAncho = alto;
    for (let i = DIGITOS_DE_PAR; i < letras.length; i++) {
      filaAlto /= FILAS;
      colAncho /= COLUMNAS;
      const valor = indice(letras[i]!);
      lat += Math.floor(valor / COLUMNAS) * filaAlto;
      lng += (valor % COLUMNAS) * colAncho;
    }
    alto = filaAlto;
    ancho = colAncho;
  }
  return { lat: lat + alto / 2, lng: lng + ancho / 2 };
}

/** completa un código corto con una referencia, como hace Google Maps con la localidad */
function completarCon(corto: string, referencia: PuntoPlus): string | null {
  const limpio = corto.trim().toUpperCase();
  const relleno = POSICION_SEPARADOR - limpio.indexOf(SEPARADOR);
  const resolucion = BASE ** (2 - relleno / 2);
  const mitad = resolucion / 2;
  const prefijo = codificarPlus(referencia.lat, referencia.lng).slice(
    0,
    relleno,
  );
  const completo = prefijo + limpio;
  const area = decodificarPlus(completo);
  if (!area) return null;
  let { lat, lng } = area;
  if (referencia.lat + mitad < lat && lat - resolucion >= -90) {
    lat -= resolucion;
  } else if (referencia.lat - mitad > lat && lat + resolucion <= 90) {
    lat += resolucion;
  }
  if (referencia.lng + mitad < lng) lng -= resolucion;
  else if (referencia.lng - mitad > lng) lng += resolucion;
  return codificarPlus(lat, lng, completo.replace(SEPARADOR, '').length);
}

/** completa un código corto con la terminal que deje el punto más cerca de ella */
export function completarPlus(
  corto: string,
  referencias: readonly PuntoPlus[] = REFERENCIAS_PLUS,
): string | null {
  if (!esPlusCorto(corto)) return null;
  let mejor: string | null = null;
  let menor = Infinity;
  for (const referencia of referencias) {
    const candidato = completarCon(corto, referencia);
    const punto = candidato ? decodificarPlus(candidato) : null;
    if (!candidato || !punto) continue;
    const distancia =
      (punto.lat - referencia.lat) ** 2 + (punto.lng - referencia.lng) ** 2;
    if (distancia < menor) {
      menor = distancia;
      mejor = candidato;
    }
  }
  return mejor;
}

/**
 * lo que el conductor pega o escribe, a un código completo: acepta mayúsculas o minúsculas, con o sin la
 * localidad ("77GQ+XM Managua, Nicaragua"); nulo si no hay un código válido
 */
export function leerPlus(entrada: string): string | null {
  const encontrado = BUSCAR_CODIGO.exec(entrada.trim());
  if (!encontrado) return null;
  const codigo = encontrado[0].toUpperCase();
  if (esPlusCompleto(codigo)) return codigo;
  return completarPlus(codigo);
}

/** el enlace que abre el punto en Google Maps, o en la app de mapas del teléfono */
export function enlaceDeMapa(codigo: string): string | null {
  const punto = decodificarPlus(codigo);
  if (!punto) return null;
  return `https://www.google.com/maps/search/?api=1&query=${punto.lat.toFixed(6)},${punto.lng.toFixed(6)}`;
}
