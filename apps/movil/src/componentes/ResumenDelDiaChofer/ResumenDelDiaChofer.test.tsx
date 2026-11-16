import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { Salida } from '@/datos/salidas';
import { renderPantalla } from '@/pruebas/render';

import {
  ResumenDelDiaChofer,
  type PropiedadesResumenDelDiaChofer,
} from './ResumenDelDiaChofer';

const PROXIMO = {
  destino: 'Boaco',
  origen: 'Managua',
  placa: 'M 222-114',
  salida: new Date(2026, 10, 16, 15, 30),
  viajeId: 'via_2',
} as unknown as Salida;

function dibujar(extra: Partial<PropiedadesResumenDelDiaChofer> = {}) {
  return renderPantalla(
    <ResumenDelDiaChofer
      alAbrirProximo={jest.fn()}
      cobrado={450}
      pasajeros={18}
      proximo={PROXIMO}
      viajes={3}
      {...extra}
    />,
  );
}

describe('ResumenDelDiaChofer', () => {
  it('muestra los viajes, los pasajeros y lo cobrado', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('3')).toBeTruthy();
    expect(pantalla.getByText('18')).toBeTruthy();
    expect(pantalla.getByText('C$ 450')).toBeTruthy();
  });

  it('muestra el viaje que sigue con su hora, ruta y placa', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('3:30')).toBeTruthy();
    expect(pantalla.getByText('Managua → Boaco')).toBeTruthy();
    expect(pantalla.getByText('M 222-114')).toBeTruthy();
  });

  it('tocar el viaje que sigue lo abre', async () => {
    const alAbrirProximo = jest.fn();
    const pantalla = await dibujar({ alAbrirProximo });
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Abrir el viaje a Boaco' }),
    );
    expect(alAbrirProximo).toHaveBeenCalledWith('via_2');
  });

  it('sin viaje que siga lo dice', async () => {
    const pantalla = await dibujar({ proximo: null });
    expect(
      pantalla.getByText('No te quedan viajes por hacer hoy.'),
    ).toBeTruthy();
  });
});
