import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { crearMuestra } from '@/datos/muestra';
import { armarSalidas, type Salida } from '@/datos/salidas';

import { TarjetaProximoViaje } from './TarjetaProximoViaje';

const AHORA = new Date(2026, 10, 2, 14, 20);
let granada: Salida;

beforeAll(() => {
  const salidas = armarSalidas(crearMuestra(AHORA), AHORA);
  granada = salidas.find((salida) => salida.destino === 'Granada') as Salida;
});

describe('TarjetaProximoViaje', () => {
  it('muestra destino, andén, servicio y hora', async () => {
    const pantalla = await render(
      <TarjetaProximoViaje
        ahora={AHORA}
        alVerBoleto={() => undefined}
        salida={granada}
      />,
    );
    expect(pantalla.getByText('Granada')).toBeTruthy();
    expect(pantalla.getByText('Andén 4 · Ordinario')).toBeTruthy();
    expect(pantalla.getByText('2:40 p. m.')).toBeTruthy();
  });

  it('cuenta los minutos que faltan para salir', async () => {
    const pantalla = await render(
      <TarjetaProximoViaje
        ahora={AHORA}
        alVerBoleto={() => undefined}
        salida={granada}
      />,
    );
    expect(pantalla.getByText('sale en 20 min')).toBeTruthy();
  });

  it('avisa al presionar el botón de acción', async () => {
    const alVerBoleto = jest.fn();
    const pantalla = await render(
      <TarjetaProximoViaje
        ahora={AHORA}
        alVerBoleto={alVerBoleto}
        salida={granada}
      />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Elegir asiento' }),
    );
    expect(alVerBoleto).toHaveBeenCalledTimes(1);
  });
});
