import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { RedRutas } from './RedRutas';

function dibujar(propiedades: Partial<Parameters<typeof RedRutas>[0]> = {}) {
  return renderPantalla(
    <RedRutas
      alElegirCiudad={() => undefined}
      alInvertir={() => undefined}
      seleccion={{ ciudad: 'Boaco', sentido: 'ida' }}
      {...propiedades}
    />,
  );
}

describe('RedRutas', () => {
  it('muestra las tres ciudades como botones', async () => {
    const pantalla = await dibujar();
    for (const nombre of ['Boaco', 'Managua', 'Juigalpa']) {
      expect(pantalla.getAllByRole('button', { name: nombre })[0]).toBeTruthy();
    }
  });

  it('marca la ciudad elegida', async () => {
    const pantalla = await dibujar({
      seleccion: { ciudad: 'Juigalpa', sentido: 'vuelta' },
    });
    expect(
      pantalla.getAllByRole('button', { name: 'Juigalpa' })[0]?.props
        .accessibilityState,
    ).toMatchObject({ selected: true });
    expect(
      pantalla.getAllByRole('button', { name: 'Boaco' })[0]?.props
        .accessibilityState,
    ).toMatchObject({ selected: false });
  });

  it('tocar una ciudad la elige y tocar Managua invierte el sentido', async () => {
    const alElegirCiudad = jest.fn();
    const alInvertir = jest.fn();
    const pantalla = await dibujar({ alElegirCiudad, alInvertir });
    await fireEvent.press(
      pantalla.getAllByRole('button', { name: 'Juigalpa' })[0]!,
    );
    expect(alElegirCiudad).toHaveBeenCalledWith('Juigalpa');
    await fireEvent.press(
      pantalla.getAllByRole('button', { name: 'Managua' })[0]!,
    );
    expect(alInvertir).toHaveBeenCalledTimes(1);
  });
});
