import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { GraficoBarras } from './GraficoBarras';

describe('GraficoBarras', () => {
  it('se describe para lectores de pantalla y pone las etiquetas indicadas', async () => {
    const pantalla = await renderPantalla(
      <GraficoBarras
        barras={[
          { etiqueta: '10', valor: 5 },
          { etiqueta: '11', valor: 0 },
          { etiqueta: '12', valor: 9 },
        ]}
        cadaEtiqueta={2}
        descripcion="Ganancias por día"
      />,
    );
    expect(pantalla.getByLabelText('Ganancias por día')).toBeTruthy();
    expect(pantalla.getByText('10')).toBeTruthy();
    expect(pantalla.queryByText('11')).toBeNull();
    expect(pantalla.getByText('12')).toBeTruthy();
  });

  it('aguanta una lista vacía', async () => {
    const pantalla = await renderPantalla(
      <GraficoBarras barras={[]} descripcion="Vacío" />,
    );
    expect(pantalla.getByLabelText('Vacío')).toBeTruthy();
  });
});
