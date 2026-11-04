import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { ReservaConfirmada } from './ReservaConfirmada';

describe('ReservaConfirmada', () => {
  it('muestra el código guardado antes de abrir Boletos', async () => {
    const pantalla = await renderPantalla(
      <ReservaConfirmada codigo="K7RM4QX9" />,
    );

    expect(
      pantalla.getByLabelText(
        'Reserva lista. Código de abordaje: K7RM4QX9. Abriendo tus boletos…',
      ),
    ).toBeTruthy();
  });
});
