import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { crearMuestra, VIAJE_BOACO } from '@/datos/muestra';
import { armarSalidas, type Salida } from '@/datos/salidas';

import { TarjetaProximoViaje } from './TarjetaProximoViaje';

const AHORA = new Date(2026, 10, 2, 14, 20);
let boaco: Salida;

beforeAll(() => {
  const salidas = armarSalidas(crearMuestra(AHORA), AHORA);
  boaco = salidas.find((salida) => salida.viajeId === VIAJE_BOACO) as Salida;
});

describe('TarjetaProximoViaje', () => {
  it('muestra destino, andén, servicio y hora', async () => {
    const pantalla = await render(
      <TarjetaProximoViaje
        ahora={AHORA}
        alVerBoleto={() => undefined}
        salida={boaco}
      />,
    );
    expect(pantalla.getByText('Boaco')).toBeTruthy();
    expect(pantalla.getByText('Andén 3 · Ordinario')).toBeTruthy();
    expect(pantalla.getByText('2:40 p. m.')).toBeTruthy();
  });

  it('cuenta los minutos que faltan para salir', async () => {
    const pantalla = await render(
      <TarjetaProximoViaje
        ahora={AHORA}
        alVerBoleto={() => undefined}
        salida={boaco}
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
        salida={boaco}
      />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Elegir asiento' }),
    );
    expect(alVerBoleto).toHaveBeenCalledTimes(1);
  });
});
