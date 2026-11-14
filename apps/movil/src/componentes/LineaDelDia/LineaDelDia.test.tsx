import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { Salida } from '@/datos/salidas';
import { renderPantalla } from '@/pruebas/render';

import { LineaDelDia } from './LineaDelDia';

const AHORA = new Date(2026, 10, 13, 9, 0);

function salida(id: string, hora: number, libres = 10): Salida {
  return {
    puntoEncuentro: '764M4PPX+HH',
    asientosLibres: libres,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 1',
    rutaId: 'rut_1',
    salida: new Date(2026, 10, 13, hora, 0),
    servicio: 'ordinario',
    tarifa: 70,
    ventaAbierta: true,
    viajeId: id,
  };
}

describe('LineaDelDia', () => {
  it('pone una marca por salida y dice cuántos asientos quedan', async () => {
    const p = await renderPantalla(
      <LineaDelDia
        ahora={AHORA}
        esHoy
        salidas={[salida('a', 10, 8), salida('b', 15, 2)]}
      />,
    );
    expect(
      p.getByLabelText('Salida a Boaco a las 10:00 a. m., 8 asientos libres'),
    ).toBeTruthy();
    expect(
      p.getByLabelText('Salida a Boaco a las 3:00 p. m., 2 asientos libres'),
    ).toBeTruthy();
  });

  it('tocar una marca abre ese viaje', async () => {
    const alElegir = jest.fn();
    const p = await renderPantalla(
      <LineaDelDia
        ahora={AHORA}
        alElegir={alElegir}
        esHoy
        salidas={[salida('a', 10)]}
      />,
    );
    await fireEvent.press(p.getByRole('button', { name: /a las 10:00/ }));
    expect(alElegir).toHaveBeenCalledWith('a');
  });

  it('marca la hora actual solo si el día es hoy', async () => {
    const hoy = await renderPantalla(
      <LineaDelDia ahora={AHORA} esHoy salidas={[salida('a', 10)]} />,
    );
    expect(hoy.getByLabelText('Ahora')).toBeTruthy();
    const otro = await renderPantalla(
      <LineaDelDia ahora={AHORA} esHoy={false} salidas={[salida('a', 10)]} />,
    );
    expect(otro.queryByLabelText('Ahora')).toBeNull();
  });

  it('sin salidas no dibuja nada', async () => {
    const p = await renderPantalla(
      <LineaDelDia ahora={AHORA} esHoy salidas={[]} />,
    );
    expect(p.queryByTestId('linea-del-dia')).toBeNull();
  });

  it('agrupa las salidas por momento del día', async () => {
    const p = await renderPantalla(
      <LineaDelDia
        ahora={AHORA}
        esHoy
        salidas={[salida('a', 7), salida('b', 15), salida('c', 20)]}
      />,
    );
    expect(p.getByText('Mañana')).toBeTruthy();
    expect(p.getByText('Tarde')).toBeTruthy();
    expect(p.getByText('Noche')).toBeTruthy();
  });

  it('dice a qué hora sale la que sigue', async () => {
    const p = await renderPantalla(
      <LineaDelDia
        ahora={AHORA}
        esHoy
        salidas={[salida('a', 7), salida('b', 15)]}
      />,
    );
    expect(p.getByText('La que sigue sale a las 3:00 p. m.')).toBeTruthy();
  });

  it('muestra los asientos libres de cada salida sobre su barra', async () => {
    const p = await renderPantalla(
      <LineaDelDia ahora={AHORA} esHoy salidas={[salida('a', 10, 8)]} />,
    );
    expect(p.getByText('8')).toBeTruthy();
    expect(p.getByText('BOA')).toBeTruthy();
  });
});
