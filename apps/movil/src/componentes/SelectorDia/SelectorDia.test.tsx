import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { diasDeReserva } from '@/datos/dias';
import { renderPantalla } from '@/pruebas/render';

import { SelectorDia } from './SelectorDia';

const AHORA = new Date(2026, 10, 12, 15, 30);
const DIAS = diasDeReserva(AHORA);

describe('SelectorDia', () => {
  it('rotula hoy, mañana y los demás días con su día de la semana y número', async () => {
    const pantalla = await renderPantalla(
      <SelectorDia
        ahora={AHORA}
        alElegir={() => undefined}
        dias={DIAS}
        seleccionado={DIAS[0]!}
      />,
    );
    expect(pantalla.getByRole('button', { name: 'Hoy' })).toBeTruthy();
    expect(pantalla.getByRole('button', { name: 'Mañana' })).toBeTruthy();
    expect(pantalla.getByRole('button', { name: 'sáb 14' })).toBeTruthy();
    expect(pantalla.getAllByRole('button')).toHaveLength(7);
  });

  it('marca el día elegido', async () => {
    const pantalla = await renderPantalla(
      <SelectorDia
        ahora={AHORA}
        alElegir={() => undefined}
        dias={DIAS}
        seleccionado={DIAS[1]!}
      />,
    );
    expect(
      pantalla.getByRole('button', { name: 'Mañana' }).props.accessibilityState
        .selected,
    ).toBe(true);
    expect(
      pantalla.getByRole('button', { name: 'Hoy' }).props.accessibilityState
        .selected,
    ).toBe(false);
  });

  it('avisa el día que se toca', async () => {
    const alElegir = jest.fn();
    const pantalla = await renderPantalla(
      <SelectorDia
        ahora={AHORA}
        alElegir={alElegir}
        dias={DIAS}
        seleccionado={DIAS[0]!}
      />,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Mañana' }));
    expect(alElegir).toHaveBeenCalledWith(DIAS[1]);
  });
});
