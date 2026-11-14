import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { ActividadIA } from './ActividadIA';

describe('ActividadIA', () => {
  it('dice qué está consultando el asistente', async () => {
    const p = await renderPantalla(
      <ActividadIA actividad="Buscando salidas" />,
    );
    expect(p.getByText('Buscando salidas…')).toBeTruthy();
  });
});
