import type { ConfiguracionBus } from './tipos';

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
