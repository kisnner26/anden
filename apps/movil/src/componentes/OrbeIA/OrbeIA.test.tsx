import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { OrbeIA } from './OrbeIA';
import { PuntosPensando } from '../PuntosPensando';

describe('animaciones de la IA', () => {
  it('el orbe se dibuja quieto y pensando sin romperse', async () => {
    const quieto = await renderPantalla(<OrbeIA />);
    expect(quieto.toJSON()).not.toBeNull();
    const pensando = await renderPantalla(<OrbeIA pensando tamano={48} />);
    expect(pensando.toJSON()).not.toBeNull();
  });

  it('los puntos de pensar se dibujan', async () => {
    const pantalla = await renderPantalla(<PuntosPensando />);
    expect(pantalla.toJSON()).not.toBeNull();
  });
});
