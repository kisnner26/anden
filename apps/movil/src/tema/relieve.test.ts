import { describe, expect, it } from '@jest/globals';

import { coloresClaros, coloresOscuros } from './colores';
import { estilosRelieve, relieve } from './relieve';

describe('relieve', () => {
  it('pone la luz arriba a la izquierda y la sombra abajo a la derecha', () => {
    for (const modo of ['claro', 'oscuro'] as const) {
      expect(relieve[modo].luz.desplazamientoX).toBeLessThan(0);
      expect(relieve[modo].luz.desplazamientoY).toBeLessThan(0);
      expect(relieve[modo].sombra.desplazamientoX).toBeGreaterThan(0);
      expect(relieve[modo].sombra.desplazamientoY).toBeGreaterThan(0);
    }
  });

  it('usa los colores de relieve del tema claro', () => {
    const estilos = estilosRelieve('claro', coloresClaros);
    expect(estilos.luz.shadowColor).toBe(coloresClaros.luzRelieve);
    expect(estilos.sombra.shadowColor).toBe(coloresClaros.sombraRelieve);
  });

  it('en oscuro la luz es casi invisible y la sombra más densa', () => {
    const estilos = estilosRelieve('oscuro', coloresOscuros);
    expect(estilos.luz.shadowOpacity).toBeLessThan(0.1);
    expect(estilos.sombra.shadowOpacity).toBeGreaterThan(0.4);
  });

  it('la mitad del desenfoque pasa a radio de sombra', () => {
    const estilos = estilosRelieve('claro', coloresClaros);
    expect(estilos.sombra.shadowRadius).toBe(
      relieve.claro.sombra.desenfoque / 2,
    );
  });
});
