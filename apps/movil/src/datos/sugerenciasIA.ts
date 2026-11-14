import { destinoHabitual, momentoDelDia, type MemoriaIA } from './memoriaIA';

export interface FactoresSugerencia {
  ahora: Date;
  /** el boleto vigente que sale primero, si lo hay */
  boletoProximo: { destino: string; minutosParaSalir: number } | null;
  /** destinos con salidas por venir, los más frecuentes primero */
  destinos: readonly string[];
  memoria: MemoriaIA;
  /** cambia en cada apertura para que las preguntas roten */
  semilla: number;
  /** con el modo turista se suman preguntas sobre qué visitar */
  turista?: boolean;
}

interface Candidata {
  clave: string;
  peso: number;
  texto: string;
}

/** un generador pseudoaleatorio simple y repetible a partir de la semilla */
function azarDe(semilla: number): () => number {
  let estado = semilla >>> 0;
  return () => {
    estado = (estado + 0x6d2b79f5) >>> 0;
    let t = estado;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
}

/**
 * las tres preguntas que se ofrecen ahora: pesan el boleto que se acerca, la hora del día, el
 * destino habitual y lo que se preguntó antes, y una semilla las hace rotar entre aperturas
 */
export function sugerenciasDelMomento(f: FactoresSugerencia): string[] {
  const momento = momentoDelDia(f.ahora.getHours());
  const finDeSemana = f.ahora.getDay() === 0 || f.ahora.getDay() === 6;
  const habitual = destinoHabitual(f.memoria);
  const candidatas: Candidata[] = [];
  const sumar = (clave: string, texto: string, peso: number) =>
    candidatas.push({ clave, peso, texto });

  if (f.boletoProximo) {
    const { destino, minutosParaSalir } = f.boletoProximo;
    if (minutosParaSalir <= 180) {
      sumar('anden', `¿Dónde me subo al bus a ${destino}?`, 11);
      sumar('falta', '¿Cuánto falta para que salga mi bus?', 10);
    } else {
      sumar('boleto', '¿Cuándo sale mi boleto?', 7);
    }
  } else {
    const destino = habitual ?? f.destinos[0];
    if (destino) {
      sumar('proximo', `¿Cuál es el próximo bus a ${destino}?`, 8);
    }
  }
  if (habitual) {
    sumar('asientos-habitual', `¿Quedan asientos a ${habitual} hoy?`, 7);
  }
  if (momento === 'manana') sumar('temprano', '¿Qué bus sale más temprano?', 5);
  if (momento === 'noche' || momento === 'madrugada') {
    sumar('noche', '¿Hay salidas esta noche?', 6);
  }
  if (finDeSemana) sumar('barata', '¿Cuál es la salida más barata hoy?', 6);
  else sumar('barata', '¿Cuál es la salida más barata hoy?', 4);
  sumar('rapido', '¿Qué bus es el más rápido?', 3);
  sumar('asientos', '¿Hay asientos libres hoy?', 3);
  f.destinos.slice(0, 4).forEach((destino, indice) => {
    sumar(`precio-${destino}`, `¿Cuánto cuesta ir a ${destino}?`, 5 - indice);
  });
  if (f.turista) {
    const destino = habitual ?? f.destinos[0];
    if (destino) {
      sumar('visitar', `¿Qué puedo visitar en ${destino}?`, 12);
      sumar('comer', `¿Qué se come en ${destino}?`, 9);
    }
  }
  const anterior = f.memoria.preguntas[0];
  if (anterior && f.memoria.usos > 0) sumar('repetir', anterior, 4);

  const azar = azarDe(f.semilla);
  const puntuadas = candidatas
    .map((c) => ({ ...c, puntos: c.peso + azar() * 6 }))
    .sort((a, b) => b.puntos - a.puntos);
  const elegidas: string[] = [];
  for (const candidata of puntuadas) {
    if (elegidas.includes(candidata.texto)) continue;
    elegidas.push(candidata.texto);
    if (elegidas.length === 3) break;
  }
  return elegidas;
}
