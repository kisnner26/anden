import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { Salida } from '@/datos/salidas';
import { renderPantalla } from '@/pruebas/render';

import { BuscarPasajeros } from './BuscarPasajeros';

const AHORA = new Date('2026-11-16T08:00:00');

function viaje(id: string, destino: string, libres = 10): Salida {
  return {
    asientosLibres: libres,
    choferId: 'cho_1',
    codigoDestino: 'XXX',
    destino,
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 123456',
    puntoEncuentro: '',
    rutaId: 'rut_1',
    salida: new Date('2026-11-16T10:30:00'),
    servicio: 'ordinario',
    tarifa: 66,
    ventaAbierta: true,
    viajeId: id,
  };
}

describe('BuscarPasajeros', () => {
  it('es un botón grande que despliega los viajes y los minutos', async () => {
    const alBuscar = jest.fn();
    const p = await renderPantalla(
      <BuscarPasajeros
        ahora={AHORA}
        alBuscar={alBuscar}
        fallo={false}
        viajes={[viaje('v1', 'Boaco'), viaje('v2', 'Juigalpa')]}
      />,
    );
    await fireEvent.press(p.getByRole('button', { name: 'Buscar pasajeros' }));
    expect(p.getByText('Managua → Boaco')).toBeTruthy();
    expect(p.getByText('Managua → Juigalpa')).toBeTruthy();
    await fireEvent.press(p.getByRole('button', { name: '30 min, Juigalpa' }));
    expect(alBuscar).toHaveBeenCalledWith('v2', 30, 10);
  });

  it('no ofrece buscar en un viaje lleno ni muestra nada sin viajes', async () => {
    const p = await renderPantalla(
      <BuscarPasajeros
        ahora={AHORA}
        alBuscar={jest.fn()}
        fallo={false}
        viajes={[viaje('v1', 'Boaco', 0)]}
      />,
    );
    expect(p.queryByRole('button', { name: 'Buscar pasajeros' })).toBeNull();
  });

  it('avisa si no se pudo contactar al servidor', async () => {
    const p = await renderPantalla(
      <BuscarPasajeros
        ahora={AHORA}
        alBuscar={jest.fn()}
        fallo
        viajes={[viaje('v1', 'Boaco')]}
      />,
    );
    expect(p.getByText('No se pudo avisar. Revisá tu conexión.')).toBeTruthy();
  });
});
