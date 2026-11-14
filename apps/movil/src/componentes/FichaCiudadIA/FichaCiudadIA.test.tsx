import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { FichaCiudadIA } from './FichaCiudadIA';

describe('FichaCiudadIA', () => {
  it('muestra la foto y los datos de la ficha', async () => {
    const p = await renderPantalla(<FichaCiudadIA ciudad="Boaco" />);
    expect(p.getByText('Boaco')).toBeTruthy();
    expect(p.getByText(/ciudad de dos pisos/)).toBeTruthy();
    expect(p.getByLabelText('Foto de Boaco')).toBeTruthy();
  });

  it('no dibuja nada para una ciudad sin ficha', async () => {
    const p = await renderPantalla(<FichaCiudadIA ciudad="Atlantis" />);
    expect(p.queryByTestId('ficha-ciudad-ia')).toBeNull();
  });
});
