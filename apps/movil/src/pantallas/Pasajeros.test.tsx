import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { ProveedorReserva } from '@/datos/ProveedorReserva';
import { useReserva } from '@/datos/useReserva';
import { renderPantalla } from '@/pruebas/render';

import { Pasajeros } from './Pasajeros';

function Sonda() {
  const { borrador } = useReserva();
  return <Text testID="borrador">{JSON.stringify(borrador)}</Text>;
}

function dibujar(propiedades: Partial<Parameters<typeof Pasajeros>[0]> = {}) {
  return renderPantalla(
    <ProveedorReserva>
      <Pasajeros
        alContinuar={() => undefined}
        alVolver={() => undefined}
        asientos={[8, 9]}
        viajeId="via_2"
        {...propiedades}
      />
      <Sonda />
    </ProveedorReserva>,
  );
}

describe('Pasajeros', () => {
  it('pide un nombre y una cédula opcional por cada asiento', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByLabelText('Nombre completo · Asiento 8')).toBeTruthy();
    expect(
      pantalla.getByLabelText('Cédula (opcional) · Asiento 9'),
    ).toBeTruthy();
  });

  it('no avanza y avisa si falta algún nombre', async () => {
    const alContinuar = jest.fn();
    const pantalla = await dibujar({ alContinuar });
    await fireEvent.changeText(
      pantalla.getByLabelText('Nombre completo · Asiento 8'),
      'Ana Ruiz',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ir al pago' }));
    expect(alContinuar).not.toHaveBeenCalled();
    expect(
      pantalla.getByText('Falta el nombre de algún pasajero.'),
    ).toBeTruthy();
  });

  it('guarda el borrador y avanza cuando todos tienen nombre', async () => {
    const alContinuar = jest.fn();
    const pantalla = await dibujar({ alContinuar });
    await fireEvent.changeText(
      pantalla.getByLabelText('Nombre completo · Asiento 8'),
      'Ana Ruiz',
    );
    await fireEvent.changeText(
      pantalla.getByLabelText('Nombre completo · Asiento 9'),
      'Luis Pérez',
    );
    await fireEvent.changeText(
      pantalla.getByLabelText('Cédula (opcional) · Asiento 9'),
      '001-010190-0001A',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ir al pago' }));
    expect(alContinuar).toHaveBeenCalledTimes(1);
    const borrador = JSON.parse(
      String(pantalla.getByTestId('borrador').props.children),
    );
    expect(borrador.viajeId).toBe('via_2');
    expect(borrador.pasajeros).toEqual([
      { asiento: 8, nombre: 'Ana Ruiz' },
      { asiento: 9, cedula: '001-010190-0001A', nombre: 'Luis Pérez' },
    ]);
  });

  it('vuelve con la flecha', async () => {
    const alVolver = jest.fn();
    const pantalla = await dibujar({ alVolver });
    await fireEvent.press(pantalla.getByRole('button', { name: 'Volver' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });
});
