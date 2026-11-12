import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';
import { useReducedMotion, withSpring } from 'react-native-reanimated';

import { reproducirSonido } from '@/datos/sonidos';

import { renderPantalla } from '@/pruebas/render';
import { ReservaConfirmada } from './ReservaConfirmada';

interface MockSimulado {
  mockClear: () => void;
  mockReturnValue: (valor: boolean) => void;
}

jest.mock('@/datos/sonidos', () => ({
  reproducirSonido: jest.fn(async () => undefined),
}));

const animar = withSpring as unknown as MockSimulado;
const reducir = useReducedMotion as unknown as MockSimulado;

beforeEach(() => {
  animar.mockClear();
  jest.mocked(reproducirSonido).mockClear();
  reducir.mockReturnValue(false);
});

describe('ReservaConfirmada', () => {
  it('muestra el código de abordaje y no se cierra sola', async () => {
    const pantalla = await renderPantalla(
      <ReservaConfirmada codigo="K7RM4QX9" />,
    );

    expect(
      pantalla.getByLabelText('Reserva lista. Código de abordaje: K7RM4QX9'),
    ).toBeTruthy();
    expect(pantalla.getByText('K7RM4QX9')).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: 'Ver mi boleto' }),
    ).toBeTruthy();
  });

  it('explica cómo usar el boleto al subir', async () => {
    const pantalla = await renderPantalla(
      <ReservaConfirmada codigo="K7RM4QX9" />,
    );
    expect(
      pantalla.getByText(/Mostrá el código o el QR al subir/),
    ).toBeTruthy();
  });

  it('abre el boleto o vuelve a la lista según el botón', async () => {
    const alVerBoleto = jest.fn();
    const alListo = jest.fn();
    const pantalla = await renderPantalla(
      <ReservaConfirmada
        alListo={alListo}
        alVerBoleto={alVerBoleto}
        codigo="K7RM4QX9"
      />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Ver mi boleto' }),
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Listo' }));
    expect(alVerBoleto).toHaveBeenCalledTimes(1);
    expect(alListo).toHaveBeenCalledTimes(1);
  });

  it('anuncia inmediatamente el resultado completo', async () => {
    const pantalla = await renderPantalla(
      <ReservaConfirmada codigo="P3NS6TW4" />,
    );

    const resumen = pantalla.getByLabelText(/P3NS6TW4/);
    expect(resumen.props.accessibilityLiveRegion).toBe('assertive');
    expect(resumen.props.accessible).toBe(true);
  });

  it('hace rebotar el sello al llegar', async () => {
    await renderPantalla(<ReservaConfirmada codigo="P3NS6TW4" />);

    expect(animar).toHaveBeenCalledWith(1, expect.objectContaining({}));
  });

  it('suena el sello de confirmación', async () => {
    await renderPantalla(<ReservaConfirmada codigo="P3NS6TW4" />);

    expect(reproducirSonido).toHaveBeenCalledWith('confirmacion');
  });

  it('no anima el sello al reducir movimiento', async () => {
    reducir.mockReturnValue(true);
    await renderPantalla(<ReservaConfirmada codigo="P3NS6TW4" />);

    expect(animar).not.toHaveBeenCalled();
  });
});
