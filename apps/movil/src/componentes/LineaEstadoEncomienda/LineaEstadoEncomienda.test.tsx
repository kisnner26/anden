import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { LineaEstadoEncomienda } from './LineaEstadoEncomienda';

describe('LineaEstadoEncomienda', () => {
  it('muestra las cuatro etapas del envío', async () => {
    const pantalla = await renderPantalla(<LineaEstadoEncomienda />);
    for (const etapa of [
      'Solicitada',
      'Confirmada',
      'En el bus',
      'Entregada',
    ]) {
      expect(pantalla.getByText(etapa)).toBeTruthy();
    }
  });

  it('se anuncia con la etapa en la que va', async () => {
    const pantalla = await renderPantalla(
      <LineaEstadoEncomienda cumplidas={3} />,
    );
    expect(
      pantalla.getByRole('progressbar', { name: 'En el bus' }).props
        .accessibilityValue,
    ).toMatchObject({ max: 4, now: 3 });
  });
});
