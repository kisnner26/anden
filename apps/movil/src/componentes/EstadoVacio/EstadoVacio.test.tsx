import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { EstadoVacio } from './EstadoVacio';

describe('EstadoVacio', () => {
  it('muestra el título como encabezado y el detalle si hay', async () => {
    const p = await renderPantalla(
      <EstadoVacio
        detalle="Probá más tarde"
        tipo="salidas"
        titulo="Sin salidas"
      />,
    );
    expect(p.getByRole('header', { name: 'Sin salidas' })).toBeTruthy();
    expect(p.getByText('Probá más tarde')).toBeTruthy();
  });

  it('sin detalle solo muestra el título', async () => {
    const p = await renderPantalla(
      <EstadoVacio tipo="boletos" titulo="Nada aún" />,
    );
    expect(p.getByText('Nada aún')).toBeTruthy();
    expect(p.queryByText('Probá más tarde')).toBeNull();
  });

  it('lleva su ilustración', async () => {
    const p = await renderPantalla(<EstadoVacio tipo="error" titulo="Falló" />);
    expect(
      p.getByTestId('ilustracion-error', { includeHiddenElements: true }),
    ).toBeTruthy();
  });
});
