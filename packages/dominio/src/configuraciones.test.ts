import { describe, expect, it } from 'vitest';

import { PLANOS, asientosDe } from './configuraciones';
import { esquemaAsiento } from './esquemas';
import { CONFIGURACIONES_BUS, type ConfiguracionBus } from './tipos';

const TOTAL: Record<ConfiguracionBus, number> = {
  micro15: 15,
  coaster26: 26,
  bus45: 45,
};

describe.each(CONFIGURACIONES_BUS)('configuración %s', (configuracion) => {
  const plano = PLANOS[configuracion];
  const asientos = asientosDe(configuracion);

  it('tiene exactamente su número de asientos', () => {
    expect(asientos).toHaveLength(TOTAL[configuracion]);
  });

  it('numera de 1 a n sin huecos ni repetidos', () => {
    expect(asientos.map((asiento) => asiento.numero)).toEqual(
      Array.from({ length: asientos.length }, (_, i) => i + 1),
    );
  });

  it('numera de arriba abajo y de izquierda a derecha', () => {
    const posiciones = asientos.map((a) => a.fila * 100 + a.columna);
    expect(posiciones).toEqual([...posiciones].sort((a, b) => a - b));
  });

  it('pone cada asiento sobre una casilla de asiento, sin repetir posición', () => {
    const vistos = new Set<string>();
    for (const { fila, columna } of asientos) {
      expect(plano[fila]?.[columna]).toBe('asiento');
      vistos.add(`${fila}:${columna}`);
    }
    expect(vistos.size).toBe(asientos.length);
  });

  it('tiene todas las filas del mismo ancho, un volante y una puerta', () => {
    const ancho = plano[0]?.length ?? 0;
    expect(plano.every((fila) => fila.length === ancho)).toBe(true);
    expect(plano.flat().filter((c) => c === 'volante')).toHaveLength(1);
    expect(plano.flat().filter((c) => c === 'puerta').length).toBeGreaterThan(
      0,
    );
  });

  it('produce asientos que cumplen el esquema del dominio', () => {
    for (const asiento of asientos) {
      expect(esquemaAsiento.safeParse(asiento).success).toBe(true);
    }
  });

  it('deja los preferenciales solo en las dos primeras filas con asientos', () => {
    const filasConAsientos = [...new Set(asientos.map((a) => a.fila))].sort(
      (a, b) => a - b,
    );
    const filasPreferenciales = filasConAsientos.slice(0, 2);

    for (const asiento of asientos) {
      const esPreferencial = asiento.tipo === 'preferencial';
      expect(esPreferencial).toBe(filasPreferenciales.includes(asiento.fila));
    }
  });

  it('marca ventana en los bordes y pasillo en el resto', () => {
    const ultima = (plano[0]?.length ?? 1) - 1;
    for (const asiento of asientos) {
      if (asiento.tipo === 'preferencial') continue;
      const enBorde = asiento.columna === 0 || asiento.columna === ultima;
      expect(asiento.tipo).toBe(enBorde ? 'ventana' : 'pasillo');
    }
  });
});

describe('asientosDe', () => {
  it('en la coaster de 26 los asientos 1 a 5 son preferenciales', () => {
    const preferenciales = asientosDe('coaster26')
      .filter((a) => a.tipo === 'preferencial')
      .map((a) => a.numero);
    expect(preferenciales).toEqual([1, 2, 3, 4, 5]);
  });

  it('en la coaster de 26 el 9 es de ventana, el 8 junto al pasillo y el 24 del medio de atrás son de pasillo', () => {
    const coaster = asientosDe('coaster26');
    expect(coaster.find((a) => a.numero === 9)?.tipo).toBe('ventana');
    expect(coaster.find((a) => a.numero === 8)?.tipo).toBe('pasillo');
    expect(coaster.find((a) => a.numero === 24)?.tipo).toBe('pasillo');
  });

  it('devuelve una copia nueva en cada llamada', () => {
    expect(asientosDe('micro15')).not.toBe(asientosDe('micro15'));
  });
});
