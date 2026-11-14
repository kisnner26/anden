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

describe('orbe con satélites', () => {
  it('un orbe grande dibuja sus luces orbitando en todos los estados', async () => {
    for (const estado of [
      'reposo',
      'escuchando',
      'pensando',
      'hablando',
    ] as const) {
      const p = await renderPantalla(<OrbeIA estado={estado} tamano={120} />);
      expect(p.toJSON()).not.toBeNull();
    }
  });

  it('uno chico no carga con satélites para no recargar la barra de mensaje', async () => {
    const chico = await renderPantalla(<OrbeIA tamano={28} />);
    const grande = await renderPantalla(<OrbeIA tamano={120} />);
    expect(JSON.stringify(grande.toJSON()).length).toBeGreaterThan(
      JSON.stringify(chico.toJSON()).length,
    );
  });
});
