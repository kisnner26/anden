import { beforeEach, describe, expect, it } from '@jest/globals';
import { useReducedMotion, withTiming } from 'react-native-reanimated';

import { renderPantalla } from '@/pruebas/render';
import { movimiento } from '@/tema/movimiento';

import { ReservaConfirmada } from './ReservaConfirmada';

interface MockSimulado {
  mockClear: () => void;
  mockReturnValue: (valor: boolean) => void;
}

const animar = withTiming as unknown as MockSimulado;
const reducir = useReducedMotion as unknown as MockSimulado;

beforeEach(() => {
  animar.mockClear();
  reducir.mockReturnValue(false);
});

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

  it('anima el sello con la duración del tema', async () => {
    await renderPantalla(<ReservaConfirmada codigo="P3NS6TW4" />);

    expect(animar).toHaveBeenCalledWith(1, {
      duration: movimiento.confirmacionReserva,
    });
  });

  it('no anima el sello al reducir movimiento', async () => {
    reducir.mockReturnValue(true);
    await renderPantalla(<ReservaConfirmada codigo="P3NS6TW4" />);

    expect(animar).not.toHaveBeenCalled();
  });
});
