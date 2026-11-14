import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { FotoDestino } from './FotoDestino';

describe('FotoDestino', () => {
  it('usa la foto del destino', async () => {
    const p = await renderPantalla(<FotoDestino destino="Juigalpa" />);
    expect(p.getByLabelText('Foto de Juigalpa')).toBeTruthy();
  });

  it('si el destino no tiene foto usa la de la ciudad de salida', async () => {
    const p = await renderPantalla(
      <FotoDestino destino="Granada" origen="Managua" />,
    );
    expect(p.getByLabelText('Foto de Granada')).toBeTruthy();
  });

  it('sin ninguna foto no se anuncia como imagen', async () => {
    const p = await renderPantalla(
      <FotoDestino destino="Granada" origen="León" />,
    );
    expect(p.queryByLabelText('Foto de Granada')).toBeNull();
  });
});
