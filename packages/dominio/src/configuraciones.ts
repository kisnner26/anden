import type { Asiento, ConfiguracionBus, TipoAsiento } from './tipos';

/** una casilla del plano del bus visto desde arriba */
export type Celda = 'asiento' | 'pasillo' | 'puerta' | 'volante' | 'vacio';

export type Plano = readonly (readonly Celda[])[];

const CODIGOS: Record<string, Celda> = {
  A: 'asiento',
  '.': 'pasillo',
  P: 'puerta',
  V: 'volante',
  _: 'vacio',
};

/** convierte filas de texto (A asiento, . pasillo, P puerta, V volante, _ vacío) en un plano */
function plano(filas: string[]): Plano {
  return filas.map((fila) =>
    [...fila].map((codigo) => {
      const celda = CODIGOS[codigo];
      if (!celda) throw new Error(`casilla desconocida en el plano: ${codigo}`);
      return celda;
    }),
  );
}

/** el frente del bus está en la primera fila; el volante queda a la izquierda */
export const PLANOS: Record<ConfiguracionBus, Plano> = {
  micro15: plano(['V__P', 'AA.A', 'AA.A', 'AA.A', 'AA.A', 'AA.A']),
  coaster26: plano([
    'VA_PP',
    'AA.AA',
    'AA.AA',
    'AA.AA',
    'AA.AA',
    'AA.AA',
    'AAAAA',
  ]),
  bus45: plano([
    'V__PP',
    'AA.AA',
    'AA.AA',
    'AA.AA',
    'AA.AA',
    'AA.AA',
    'AA.AA',
    'AA.AA',
    'AA.AA',
    'AA.AA',
    'AA.AA',
    'AAAAA',
  ]),
};

/** filas con asientos, contadas desde el frente, que quedan como preferenciales */
const FILAS_PREFERENCIALES = 2;

/**
 * asientos de la configuración numerados desde 1, de arriba abajo y de izquierda a derecha.
 * preferencial: las primeras filas con asientos; ventana: las columnas de los bordes; el resto, pasillo.
 */
export function asientosDe(configuracion: ConfiguracionBus): Asiento[] {
  const filas = PLANOS[configuracion];
  const ultimaColumna = (filas[0]?.length ?? 1) - 1;
  const asientos: Asiento[] = [];
  let filasConAsientos = 0;

  filas.forEach((celdas, fila) => {
    const enFila = celdas.some((celda) => celda === 'asiento');
    if (enFila) filasConAsientos += 1;

    celdas.forEach((celda, columna) => {
      if (celda !== 'asiento') return;
      let tipo: TipoAsiento = 'pasillo';
      if (filasConAsientos <= FILAS_PREFERENCIALES) tipo = 'preferencial';
      else if (columna === 0 || columna === ultimaColumna) tipo = 'ventana';
      asientos.push({ numero: asientos.length + 1, fila, columna, tipo });
    });
  });

  return asientos;
}
