import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { HumoEscape } from './HumoEscape';

describe('HumoEscape', () => {
  it('dibuja cinco bocanadas que no reciben toques', async () => {
    const pantalla = await renderPantalla(<HumoEscape tamano={20} />);
    const hijos = pantalla.toJSON();
    expect(JSON.stringify(hijos).match(/"pointerEvents":"none"/g)).toHaveLength(
      5,
    );
  });

  it('el arranque cambia el aspecto del humo', async () => {
    const normal = await renderPantalla(<HumoEscape tamano={20} />);
    const arranque = await renderPantalla(<HumoEscape arranque tamano={20} />);
    expect(JSON.stringify(arranque.toJSON())).not.toEqual(
      JSON.stringify(normal.toJSON()),
    );
  });
});
