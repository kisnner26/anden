import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { Celda } from '@/datos/mapaDeCalor';
import { renderPantalla } from '@/pruebas/render';

import { MapaDeCalor } from './MapaDeCalor';

const HOY = new Date(2026, 10, 15);
const MANANA = new Date(2026, 10, 16);

function celda(
  dia: Date,
  franja: Celda['franja'],
  extra: Partial<Celda>,
): Celda {
  return { dia, franja, holgura: null, libres: null, salidas: 0, ...extra };
}

const CELDAS: Celda[] = [
  celda(HOY, 'manana', { holgura: 0.8, libres: 24, salidas: 2 }),
  celda(HOY, 'tarde', { holgura: 0.1, libres: 3, salidas: 1 }),
  celda(MANANA, 'manana', { holgura: 0.3, libres: 9, salidas: 3 }),
  celda(HOY, 'noche', {}),
];

function dibujar(alElegirDia: (d: Date) => void = () => undefined) {
  return renderPantalla(
    <MapaDeCalor
      alElegirDia={alElegirDia}
      celdas={CELDAS}
      dias={[HOY, MANANA]}
      seleccionado={HOY}
    />,
  );
}

describe('MapaDeCalor', () => {
  it('describe cada casilla con el día, la franja, los buses y la disponibilidad', async () => {
    const p = await dibujar();
    expect(
      p.getByLabelText('dom 15, Mañana: 2 buses, hay lugar de sobra'),
    ).toBeTruthy();
    expect(p.getByLabelText('dom 15, Tarde: 1 bus, casi lleno')).toBeTruthy();
    expect(
      p.getByLabelText('lun 16, Mañana: 3 buses, queda poco lugar'),
    ).toBeTruthy();
  });

  it('una franja sin salidas dice que no hay buses', async () => {
    const p = await dibujar();
    expect(p.getByLabelText('dom 15, Noche: sin buses')).toBeTruthy();
  });

  it('tocar una casilla lleva a ese día', async () => {
    const alElegirDia = jest.fn();
    const p = await dibujar(alElegirDia);
    await fireEvent.press(
      p.getByLabelText('lun 16, Mañana: 3 buses, queda poco lugar'),
    );
    expect(alElegirDia).toHaveBeenCalledWith(MANANA);
  });

  it('marca el día seleccionado', async () => {
    const p = await dibujar();
    expect(
      p.getByLabelText('dom 15, Tarde: 1 bus, casi lleno').props
        .accessibilityState,
    ).toMatchObject({ selected: true });
  });
});
