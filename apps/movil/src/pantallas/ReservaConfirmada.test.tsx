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

  it('anuncia inmediatamente el resultado completo', async () => {
    const pantalla = await renderPantalla(
      <ReservaConfirmada codigo="P3NS6TW4" />,
    );

    const resumen = pantalla.getByLabelText(/P3NS6TW4/);
    expect(resumen.props.accessibilityLiveRegion).toBe('assertive');
    expect(resumen.props.accessible).toBe(true);
  });
});
