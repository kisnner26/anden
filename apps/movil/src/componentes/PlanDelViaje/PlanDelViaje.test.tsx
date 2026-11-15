import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { planDelViaje } from '@/datos/planViaje';
import { renderPantalla } from '@/pruebas/render';

import { PlanDelViaje } from './PlanDelViaje';

const SALIDA = new Date(2026, 10, 15, 14, 0);
const AHORA = new Date(2026, 10, 15, 13, 0);

describe('PlanDelViaje', () => {
  it('muestra los pasos con su hora y resalta el siguiente', async () => {
    const p = await renderPantalla(
      <PlanDelViaje ahora={AHORA} pasos={planDelViaje(SALIDA, 120, null)} />,
    );
    expect(
      p.getByLabelText(
        'Estar en el punto de encuentro, 1:45 p. m., el siguiente paso',
      ),
    ).toBeTruthy();
    expect(p.getByLabelText('Sale el bus, 2:00 p. m.')).toBeTruthy();
    expect(p.getByLabelText('Llegada estimada, 4:00 p. m.')).toBeTruthy();
  });

  it('sin el paso de casa ofrece calcularlo', async () => {
    const alCalcular = jest.fn();
    const p = await renderPantalla(
      <PlanDelViaje
        ahora={AHORA}
        alCalcularDeCasa={alCalcular}
        pasos={planDelViaje(SALIDA, 120, null)}
      />,
    );
    await fireEvent.press(
      p.getByRole('button', { name: 'Calcular cuándo salir de casa' }),
    );
    expect(alCalcular).toHaveBeenCalledTimes(1);
  });

  it('con el paso de casa ya no ofrece calcular', async () => {
    const p = await renderPantalla(
      <PlanDelViaje
        ahora={AHORA}
        alCalcularDeCasa={() => undefined}
        pasos={planDelViaje(SALIDA, 120, 5000)}
      />,
    );
    expect(p.getByText('Salir de casa')).toBeTruthy();
    expect(
      p.queryByRole('button', { name: 'Calcular cuándo salir de casa' }),
    ).toBeNull();
  });

  it('avisa si no se pudo leer la ubicación', async () => {
    const p = await renderPantalla(
      <PlanDelViaje
        ahora={AHORA}
        fallo
        pasos={planDelViaje(SALIDA, 120, null)}
      />,
    );
    expect(p.getByText(/No pude leer tu ubicación/)).toBeTruthy();
  });
});
