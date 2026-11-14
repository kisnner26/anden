import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import type { Salida } from '@/datos/salidas';
import { renderPantalla } from '@/pruebas/render';

import { CarruselSalidas } from './CarruselSalidas';

const AHORA = new Date(2026, 10, 13, 9, 0);

function salida(id: string, hora: number, extra: Partial<Salida> = {}): Salida {
  return {
    puntoEncuentro: '764M4PPX+HH',
    asientosLibres: 10,
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
    ...extra,
  };
}

describe('CarruselSalidas', () => {
  it('muestra una tarjeta por salida con la hora, el destino y la tarifa', async () => {
    const p = await renderPantalla(
      <CarruselSalidas
        ahora={AHORA}
        esHoy
        salidas={[
          salida('a', 10, { tarifa: 70 }),
          salida('b', 15, { tarifa: 90 }),
        ]}
      />,
    );
    expect(p.getByText('10:00')).toBeTruthy();
    expect(p.getByText('3:00')).toBeTruthy();
    expect(p.getByText('C$ 70')).toBeTruthy();
    expect(p.getByText('C$ 90')).toBeTruthy();
    expect(p.getAllByText('Boaco')).toHaveLength(2);
  });

  it('cada tarjeta se anuncia con su destino, hora y asientos', async () => {
    const p = await renderPantalla(
      <CarruselSalidas
        ahora={AHORA}
        esHoy
        salidas={[salida('a', 10, { asientosLibres: 8 })]}
      />,
    );
    expect(
      p.getByLabelText('Salida a Boaco a las 10:00 a. m., 8 asientos libres'),
    ).toBeTruthy();
  });

  it('tocar una tarjeta abre ese viaje', async () => {
    const alElegir = jest.fn();
    const p = await renderPantalla(
      <CarruselSalidas
        ahora={AHORA}
        alElegir={alElegir}
        esHoy
        salidas={[salida('a', 10)]}
      />,
    );
    await fireEvent.press(p.getByRole('button', { name: /a las 10:00/ }));
    expect(alElegir).toHaveBeenCalledWith('a');
  });

  it('hoy marca la que sigue con la cuenta regresiva y apaga la que ya salió', async () => {
    const p = await renderPantalla(
      <CarruselSalidas
        ahora={AHORA}
        esHoy
        salidas={[
          salida('pasada', 7),
          salida('sigue', 10),
          salida('luego', 16),
        ]}
      />,
    );
    expect(p.getAllByTestId('salida-pasada')).toHaveLength(1);
    expect(p.getAllByTestId('salida-proxima')).toHaveLength(1);
    expect(p.getAllByTestId('salida-futura')).toHaveLength(1);
    expect(p.getByText('en 60 min')).toBeTruthy();
  });

  it('otro día ninguna se marca como pasada ni como la que sigue', async () => {
    const p = await renderPantalla(
      <CarruselSalidas
        ahora={AHORA}
        esHoy={false}
        salidas={[salida('a', 7), salida('b', 10)]}
      />,
    );
    expect(p.queryByTestId('salida-pasada')).toBeNull();
    expect(p.queryByTestId('salida-proxima')).toBeNull();
    expect(p.getAllByTestId('salida-futura')).toHaveLength(2);
  });

  it('cuenta las salidas, en singular y plural', async () => {
    const una = await renderPantalla(
      <CarruselSalidas ahora={AHORA} esHoy salidas={[salida('a', 10)]} />,
    );
    expect(una.getByText('1 salida')).toBeTruthy();
    const varias = await renderPantalla(
      <CarruselSalidas
        ahora={AHORA}
        esHoy
        salidas={[salida('a', 10), salida('b', 11)]}
      />,
    );
    expect(varias.getByText('2 salidas')).toBeTruthy();
  });

  it('una salida sin tarifa muestra una raya y las agotadas muestran cero asientos', async () => {
    const p = await renderPantalla(
      <CarruselSalidas
        ahora={AHORA}
        esHoy
        salidas={[salida('a', 10, { asientosLibres: 0, tarifa: null })]}
      />,
    );
    expect(p.getByText('—')).toBeTruthy();
    expect(p.getByText('0')).toBeTruthy();
  });

  it('sin salidas no dibuja nada', async () => {
    const p = await renderPantalla(
      <CarruselSalidas ahora={AHORA} esHoy salidas={[]} />,
    );
    expect(p.queryByTestId('salidas-del-dia')).toBeNull();
  });

  it('reparte las tarjetas en dos columnas que llenan el ancho', async () => {
    const p = await renderPantalla(
      <CarruselSalidas
        ahora={AHORA}
        esHoy
        salidas={[salida('a', 10), salida('b', 11), salida('c', 12)]}
      />,
    );
    const tarjetas = p.getAllByTestId(/^salida-(proxima|futura|pasada)$/);
    expect(tarjetas).toHaveLength(3);
    const anchos = tarjetas.map((t) => {
      const estilo = StyleSheet.flatten(t.props.style) as { width: number };
      return estilo.width;
    });
    expect(new Set(anchos).size).toBe(1);
    expect(anchos[0]).toBeGreaterThan(120);
  });
});
