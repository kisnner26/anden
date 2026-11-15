import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { CieloDelTrayecto } from './CieloDelTrayecto';

const MANAGUA = { lat: 12.13413, lng: -86.1933 };

describe('CieloDelTrayecto', () => {
  it('dice de noche cuando sale de noche', async () => {
    const p = await renderPantalla(
      <CieloDelTrayecto
        duracionMin={60}
        lugar={MANAGUA}
        salida={new Date('2026-11-16T03:00:00Z')}
      />,
    );
    expect(p.getByLabelText('Sale de noche y llega de noche.')).toBeTruthy();
  });

  it('un viaje de día lo dice', async () => {
    const p = await renderPantalla(
      <CieloDelTrayecto
        duracionMin={60}
        lugar={MANAGUA}
        salida={new Date('2026-11-15T17:00:00Z')}
      />,
    );
    expect(p.getByLabelText('Sale de día y llega de día.')).toBeTruthy();
  });
});
