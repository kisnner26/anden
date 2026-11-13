import AsyncStorage from '@react-native-async-storage/async-storage';

export const CLAVE_MEMORIA_IA = 'anden.iaMemoria';
export const CLAVE_MEMORIA_ACTIVA = 'anden.iaMemoriaActiva';

const MAXIMO_PREGUNTAS = 8;

/** lo que la IA recuerda de esta persona para mejorar las sugerencias; vive solo en el teléfono, por cuenta */
export interface MemoriaIA {
  /** cuántas veces se mencionó cada destino en las preguntas y reservas */
  destinos: Record<string, number>;
  /** a qué hora del día suele usar el asistente: 24 contadores */
  horas: number[];
  /** las últimas preguntas distintas, la más nueva primero */
  preguntas: string[];
  usos: number;
}

export const MEMORIA_VACIA: MemoriaIA = {
  destinos: {},
  horas: Array.from({ length: 24 }, () => 0),
  preguntas: [],
  usos: 0,
};

export function claveMemoriaDe(cuenta: string | null): string {
  return cuenta ? `${CLAVE_MEMORIA_IA}.${cuenta}` : CLAVE_MEMORIA_IA;
}

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** lee lo guardado sin confiar en su forma */
export function leerMemoria(guardado: string | null): MemoriaIA {
  if (!guardado) return MEMORIA_VACIA;
  try {
    const valor = JSON.parse(guardado) as Partial<MemoriaIA>;
    const horas =
      Array.isArray(valor.horas) && valor.horas.length === 24
        ? valor.horas.map((n) => (typeof n === 'number' && n >= 0 ? n : 0))
        : MEMORIA_VACIA.horas;
    const destinos: Record<string, number> = {};
    for (const [nombre, cuenta] of Object.entries(valor.destinos ?? {})) {
      if (typeof cuenta === 'number' && cuenta > 0) destinos[nombre] = cuenta;
    }
    return {
      destinos,
      horas,
      preguntas: Array.isArray(valor.preguntas)
        ? valor.preguntas.filter((p): p is string => typeof p === 'string')
        : [],
      usos: typeof valor.usos === 'number' && valor.usos > 0 ? valor.usos : 0,
    };
  } catch {
    return MEMORIA_VACIA;
  }
}

/** suma una pregunta: los destinos que menciona, la hora y la pregunta misma */
export function registrarPregunta(
  memoria: MemoriaIA,
  pregunta: string,
  destinosConocidos: readonly string[],
  ahora: Date,
): MemoriaIA {
  const buscado = sinTildes(pregunta);
  const destinos = { ...memoria.destinos };
  for (const destino of destinosConocidos) {
    if (buscado.includes(sinTildes(destino))) {
      destinos[destino] = (destinos[destino] ?? 0) + 1;
    }
  }
  const horas = [...memoria.horas];
  horas[ahora.getHours()] = (horas[ahora.getHours()] ?? 0) + 1;
  const limpia = pregunta.trim();
  return {
    destinos,
    horas,
    preguntas: [
      limpia,
      ...memoria.preguntas.filter((previa) => previa !== limpia),
    ].slice(0, MAXIMO_PREGUNTAS),
    usos: memoria.usos + 1,
  };
}

/** suma un destino cuando la persona reserva, que dice más que una pregunta */
export function registrarReserva(
  memoria: MemoriaIA,
  destino: string,
): MemoriaIA {
  return {
    ...memoria,
    destinos: {
      ...memoria.destinos,
      [destino]: (memoria.destinos[destino] ?? 0) + 2,
    },
  };
}

/** el destino del que más se habla; nulo si todavía no hay ninguno */
export function destinoHabitual(memoria: MemoriaIA): string | null {
  const ordenados = Object.entries(memoria.destinos).sort(
    (a, b) => b[1] - a[1] || a[0].localeCompare(b[0], 'es'),
  );
  return ordenados[0]?.[0] ?? null;
}

export type MomentoDelDia = 'madrugada' | 'manana' | 'tarde' | 'noche';

export function momentoDelDia(hora: number): MomentoDelDia {
  if (hora < 5) return 'madrugada';
  if (hora < 12) return 'manana';
  if (hora < 18) return 'tarde';
  return 'noche';
}

/** en qué momento del día suele usar la app; nulo con muy pocos usos */
export function momentoHabitual(memoria: MemoriaIA): MomentoDelDia | null {
  if (memoria.usos < 3) return null;
  const cuenta: Record<MomentoDelDia, number> = {
    madrugada: 0,
    manana: 0,
    noche: 0,
    tarde: 0,
  };
  memoria.horas.forEach((veces, hora) => {
    cuenta[momentoDelDia(hora)] += veces;
  });
  const [mejor] = Object.entries(cuenta).sort((a, b) => b[1] - a[1]);
  return mejor && mejor[1] > 0 ? (mejor[0] as MomentoDelDia) : null;
}

/** lo que se le cuenta al modelo de esta persona, en una línea; vacío si no hay nada que contar */
export function resumenParaModelo(memoria: MemoriaIA): string {
  const partes: string[] = [];
  const destino = destinoHabitual(memoria);
  if (destino) partes.push(`su destino habitual es ${destino}`);
  const momento = momentoHabitual(memoria);
  if (momento) partes.push(`suele usar la app en la ${momento}`);
  return partes.length === 0 ? '' : `Sobre esta persona: ${partes.join(', ')}.`;
}

export async function leerMemoriaGuardada(
  cuenta: string | null,
): Promise<MemoriaIA> {
  try {
    return leerMemoria(await AsyncStorage.getItem(claveMemoriaDe(cuenta)));
  } catch {
    return MEMORIA_VACIA;
  }
}

export async function guardarMemoria(
  cuenta: string | null,
  memoria: MemoriaIA,
): Promise<void> {
  await AsyncStorage.setItem(claveMemoriaDe(cuenta), JSON.stringify(memoria));
}

export async function borrarMemoria(cuenta: string | null): Promise<void> {
  await AsyncStorage.removeItem(claveMemoriaDe(cuenta));
}

/** si la persona deja que la IA recuerde; encendido por defecto, pero solo actúa con la IA activada */
export async function leerMemoriaActiva(): Promise<boolean> {
  try {
    return (await AsyncStorage.getItem(CLAVE_MEMORIA_ACTIVA)) !== '0';
  } catch {
    return true;
  }
}

export async function guardarMemoriaActiva(activa: boolean): Promise<void> {
  await AsyncStorage.setItem(CLAVE_MEMORIA_ACTIVA, activa ? '1' : '0');
}
