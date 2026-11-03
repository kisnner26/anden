import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { crearMuestra, VIAJE_BOACO } from '@/datos/muestra';
import { armarSalidas, type Salida } from '@/datos/salidas';

import { FilaSalida } from './FilaSalida';

const AHORA = new Date(2026, 10, 2, 14, 20);
let boaco: Salida;

beforeAll(() => {
  const salidas = armarSalidas(crearMuestra(AHORA), AHORA);
  boaco = salidas.find((salida) => salida.viajeId === VIAJE_BOACO) as Salida;
});

describe('FilaSalida', () => {
  it('se anuncia con destino, hora, servicio y andén', async () => {
    const pantalla = await render(<FilaSalida salida={boaco} />);
    expect(
      pantalla.getByRole('button', {
        name: 'Boaco, 2:40 p. m., Ordinario, andén 3',
      }),
    ).toBeTruthy();
  });

  it('avisa el viaje al presionarla', async () => {
    const alPresionar = jest.fn();
    const pantalla = await render(
      <FilaSalida alPresionar={alPresionar} salida={boaco} />,
    );
    await fireEvent.press(pantalla.getByRole('button'));
    expect(alPresionar).toHaveBeenCalledWith(boaco.viajeId);
  });

  it('muestra el destino y la hora', async () => {
    const pantalla = await render(<FilaSalida salida={boaco} />);
    expect(pantalla.getByText('Boaco')).toBeTruthy();
    expect(pantalla.getByText('2:40')).toBeTruthy();
  });

  it('muestra la placa en el taxi interlocal y no en el ordinario', async () => {
    const todas = armarSalidas(crearMuestra(AHORA), AHORA);
    const taxi = todas.find(
      (salida) => salida.servicio === 'taxi-interlocal',
    ) as Salida;
    const pantalla = await render(<FilaSalida salida={taxi} />);
    expect(
      pantalla.getByText(`Taxi interlocal · andén 6 · ${taxi.placa}`),
    ).toBeTruthy();
    const ordinario = await render(<FilaSalida salida={boaco} />);
    expect(ordinario.queryByText(new RegExp(boaco.placa))).toBeNull();
  });
});
