import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { selectionAsync } from 'expo-haptics';

import type { Salida } from '@/datos/salidas';
import { t } from '@/textos/t';

import { SelectorSalida } from './SelectorSalida';

jest.mock('expo-haptics', () => ({
  selectionAsync: jest.fn(() => Promise.resolve()),
}));

function salida(id: string, hora: number, extra: Partial<Salida> = {}): Salida {
  return {
    asientosLibres: 12,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 1',
    puntoEncuentro: 'x',
    rutaId: 'r',
    salida: new Date(2026, 10, 13, hora, 0),
    servicio: 'ordinario',
    tarifa: 70,
    ventaAbierta: true,
    viajeId: id,
    ...extra,
  };
}

beforeEach(() => {
  jest.clearAllMocks();
});

describe('SelectorSalida', () => {
  it('muestra un renglón por salida con su hora y servicio', async () => {
    const pantalla = await render(
      <SelectorSalida
        alElegir={jest.fn()}
        elegida={null}
        salidas={[salida('a', 9), salida('b', 15)]}
      />,
    );
    expect(pantalla.getAllByRole('button')).toHaveLength(2);
    expect(pantalla.getByLabelText(/^9:00 a\. m\., /)).toBeTruthy();
    expect(pantalla.getByLabelText(/^3:00 p\. m\., /)).toBeTruthy();
  });

  it('tocar una salida la elige y vibra suave', async () => {
    const alElegir = jest.fn();
    const pantalla = await render(
      <SelectorSalida
        alElegir={alElegir}
        elegida={null}
        salidas={[salida('a', 9), salida('b', 15)]}
      />,
    );
    await fireEvent.press(pantalla.getByLabelText(/^3:00 p\. m\., /));
    expect(alElegir).toHaveBeenCalledWith('b');
    expect(selectionAsync).toHaveBeenCalledTimes(1);
  });
});
