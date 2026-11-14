import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { Salida } from '@/datos/salidas';
import { renderPantalla } from '@/pruebas/render';

import { TarjetaSalidaIA } from './TarjetaSalidaIA';

const SALIDA: Salida = {
  puntoEncuentro: '764M4PPX+HH',
  asientosLibres: 7,
  choferId: 'cho_1',
  codigoDestino: 'BOA',
  destino: 'Boaco',
  estado: 'programado',
  minutosAtraso: 0,
  origen: 'Managua',
  placa: 'M 1',
  rutaId: 'rut_1',
  salida: new Date(2026, 10, 13, 15, 30),
  servicio: 'expreso',
  tarifa: 70,
  ventaAbierta: true,
  viajeId: 'via_1',
};

describe('TarjetaSalidaIA', () => {
  it('muestra el trayecto, la hora, la tarifa y los asientos', async () => {
    const p = await renderPantalla(
      <TarjetaSalidaIA alAbrir={() => undefined} salida={SALIDA} />,
    );
    expect(p.getByText('Managua → Boaco')).toBeTruthy();
    expect(p.getByText('3:30')).toBeTruthy();
    expect(p.getByText('C$ 70')).toBeTruthy();
    expect(p.getByText('7')).toBeTruthy();
  });

  it('al tocarla abre ese viaje', async () => {
    const alAbrir = jest.fn();
    const p = await renderPantalla(
      <TarjetaSalidaIA alAbrir={alAbrir} salida={SALIDA} />,
    );
    await fireEvent.press(
      p.getByRole('button', { name: /^Salida de Managua a Boaco/ }),
    );
    expect(alAbrir).toHaveBeenCalledWith('via_1');
  });

  it('sin tarifa lo dice en vez de mostrar C$ null', async () => {
    const p = await renderPantalla(
      <TarjetaSalidaIA
        alAbrir={() => undefined}
        salida={{ ...SALIDA, tarifa: null }}
      />,
    );
    expect(p.getByText('Sin tarifa')).toBeTruthy();
  });
});
