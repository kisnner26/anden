import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { CifraQueSube } from './CifraQueSube';

describe('CifraQueSube', () => {
  it('describe su valor y su meta a los lectores de pantalla', async () => {
    const p = await renderPantalla(
      <CifraQueSube etiqueta="Ciudades" meta="/ 3" valor={2} />,
    );
    expect(p.getByLabelText('Ciudades: 2 / 3')).toBeTruthy();
    expect(p.getByText('Ciudades')).toBeTruthy();
  });
});
