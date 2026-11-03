import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { CLAVE_PERFIL, ProveedorPerfil } from '@/datos/ProveedorPerfil';
import { ProveedorReserva } from '@/datos/ProveedorReserva';
import { usePerfil } from '@/datos/usePerfil';
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

/** la pantalla se abre con el perfil ya cargado, como pasa en la app */
function TrasCargar({ children }: { children: ReactNode }) {
  const { cargando } = usePerfil();
  return cargando ? null : children;
}

afterEach(async () => {
  await AsyncStorage.clear();
});

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

  it('trae el nombre y la cédula del perfil en el primer asiento', async () => {
    await AsyncStorage.setItem(
      CLAVE_PERFIL,
      JSON.stringify({
        apellido: 'Mora',
        cedula: '001-010190-0001A',
        nombre: 'Ana',
      }),
    );
    const pantalla = await renderPantalla(
      <ProveedorPerfil>
        <ProveedorReserva>
          <TrasCargar>
            <Pasajeros
              alContinuar={() => undefined}
              alVolver={() => undefined}
              asientos={[8, 9]}
              viajeId="via_2"
            />
          </TrasCargar>
        </ProveedorReserva>
      </ProveedorPerfil>,
    );
    await waitFor(() =>
      expect(
        pantalla.getByLabelText('Nombre completo · Asiento 8').props.value,
      ).toBe('Ana Mora'),
    );
    expect(
      pantalla.getByLabelText('Cédula (opcional) · Asiento 8').props.value,
    ).toBe('001-010190-0001A');
    expect(
      pantalla.getByLabelText('Nombre completo · Asiento 9').props.value,
    ).toBe('');
  });

  it('un pasajero guardado llena el siguiente asiento libre', async () => {
    await AsyncStorage.setItem(
      CLAVE_PERFIL,
      JSON.stringify({
        nombre: 'Ana',
        pasajeros: [{ id: 'p1', nombre: 'Luis Rocha' }],
      }),
    );
    const pantalla = await renderPantalla(
      <ProveedorPerfil>
        <ProveedorReserva>
          <TrasCargar>
            <Pasajeros
              alContinuar={() => undefined}
              alVolver={() => undefined}
              asientos={[8, 9]}
              viajeId="via_2"
            />
          </TrasCargar>
        </ProveedorReserva>
      </ProveedorPerfil>,
    );
    await waitFor(() => expect(pantalla.getByText('Luis Rocha')).toBeTruthy());
    await fireEvent.press(pantalla.getByText('Luis Rocha'));
    expect(
      pantalla.getByLabelText('Nombre completo · Asiento 9').props.value,
    ).toBe('Luis Rocha');
  });
});
