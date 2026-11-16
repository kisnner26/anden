import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { Salida } from '@/datos/salidas';
import { renderPantalla } from '@/pruebas/render';
import { t } from '@/textos/t';

import { HorariosSimple } from './HorariosSimple';

const mockAhora = new Date(2026, 10, 13, 10, 0);
let mockLista: Salida[] = [];

function salida(id: string, hora: number, extra: Partial<Salida> = {}): Salida {
  return {
    asientosLibres: 9,
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
    tarifa: 66,
    ventaAbierta: true,
    viajeId: id,
    ...extra,
  };
}

jest.mock('@/datos/useSalidas', () => ({
  useSalidas: () => ({ ahora: mockAhora, salidas: mockLista }),
}));

beforeEach(() => {
  mockLista = [];
});

describe('HorariosSimple', () => {
  it('muestra las próximas salidas como botones gigantes', async () => {
    mockLista = [salida('a', 12), salida('b', 15, { destino: 'Juigalpa' })];
    const pantalla = await renderPantalla(
      <HorariosSimple alAbrirViaje={jest.fn()} alSalir={jest.fn()} />,
    );
    expect(pantalla.getByText('Boaco')).toBeTruthy();
    expect(pantalla.getByText('Juigalpa')).toBeTruthy();
    expect(
      pantalla.getByText(t('pantallasSimples.horariosProxima')),
    ).toBeTruthy();
  });

  it('cada salida dice la hora, el precio y los asientos', async () => {
    mockLista = [salida('a', 12)];
    const pantalla = await renderPantalla(
      <HorariosSimple alAbrirViaje={jest.fn()} alSalir={jest.fn()} />,
    );
    expect(pantalla.getByText('12:00 p. m. · C$ 66 · quedan 9')).toBeTruthy();
  });

  it('tocar una salida abre el viaje', async () => {
    mockLista = [salida('a', 12)];
    const alAbrirViaje = jest.fn();
    const pantalla = await renderPantalla(
      <HorariosSimple alAbrirViaje={alAbrirViaje} alSalir={jest.fn()} />,
    );
    await fireEvent.press(pantalla.getByText('Boaco'));
    expect(alAbrirViaje).toHaveBeenCalledWith('a');
  });

  it('no muestra salidas que ya salieron, llenas ni con la venta cerrada', async () => {
    mockLista = [
      salida('pasada', 8),
      salida('llena', 12, { asientosLibres: 0 }),
      salida('cerrada', 13, { ventaAbierta: false }),
    ];
    const pantalla = await renderPantalla(
      <HorariosSimple alAbrirViaje={jest.fn()} alSalir={jest.fn()} />,
    );
    expect(pantalla.queryByText('Boaco')).toBeNull();
    expect(pantalla.getByText(t('pantallasSimples.horariosSin'))).toBeTruthy();
  });
});
