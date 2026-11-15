import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { ResumenDeTramo } from '@/datos/resumenDeLaRed';
import { renderPantalla } from '@/pruebas/render';

import { RedViva } from './RedViva';

const TRAMOS: ResumenDeTramo[] = [
  {
    ciudad: 'Boaco',
    libresEnLaProxima: 12,
    proxima: new Date(2026, 10, 15, 14, 40),
    salidasHoy: 3,
  },
  { ciudad: 'Juigalpa', libresEnLaProxima: null, proxima: null, salidasHoy: 0 },
];

function dibujar(
  alElegir: (c: 'Boaco' | 'Juigalpa') => void = () => undefined,
) {
  return renderPantalla(
    <RedViva alElegir={alElegir} ciudad="Boaco" tramos={TRAMOS} />,
  );
}

describe('RedViva', () => {
  it('cada tramo dice cuándo sale el próximo bus y cuántos asientos quedan', async () => {
    const p = await dibujar();
    expect(
      p.getByLabelText(
        'Hacia Boaco: próximo bus a las 2:40 p. m., 12 asientos libres',
      ),
    ).toBeTruthy();
  });

  it('un tramo sin salidas lo dice', async () => {
    const p = await dibujar();
    expect(
      p.getByLabelText('Hacia Juigalpa: sin salidas por ahora'),
    ).toBeTruthy();
  });

  it('tocar el tramo elige esa ciudad', async () => {
    const alElegir = jest.fn();
    const p = await dibujar(alElegir);
    await fireEvent.press(
      p.getByLabelText('Hacia Juigalpa: sin salidas por ahora'),
    );
    expect(alElegir).toHaveBeenCalledWith('Juigalpa');
  });

  it('tocar el nombre de la ciudad también la elige', async () => {
    const alElegir = jest.fn();
    const p = await dibujar(alElegir);
    await fireEvent.press(p.getByRole('button', { name: 'Juigalpa' }));
    expect(alElegir).toHaveBeenCalledWith('Juigalpa');
  });
});
