import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';
import type { ReactNode } from 'react';
import { Text } from 'react-native';

import { CLAVE_PERFIL, ProveedorPerfil } from '@/datos/ProveedorPerfil';
import { ProveedorReserva } from '@/datos/ProveedorReserva';
import type { BoletoGuardado } from '@/datos/reserva';
import { ContextoBoletos } from '@/datos/useBoletos';
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

  it('marca el nombre inválido junto a su asiento', async () => {
    const pantalla = await dibujar();
    await fireEvent.changeText(
      pantalla.getByLabelText('Nombre completo · Asiento 8'),
      'A1',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ir al pago' }));
    expect(
      pantalla.getAllByText('Escribí un nombre de 2 a 80 letras.').length,
    ).toBeGreaterThan(0);
    expect(
      pantalla.getByLabelText('Nombre completo · Asiento 8').props[
        'aria-invalid'
      ],
    ).toBe(true);
  });

  it('no avanza con una cédula de formato incorrecto', async () => {
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
      '0010101900001A',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ir al pago' }));
    expect(alContinuar).not.toHaveBeenCalled();
    expect(
      pantalla.getByText('Usá el formato 001-010190-0001A o dejala vacía.'),
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

describe('Pasajeros repetidos en el mismo viaje', () => {
  it('no deja poner a la misma persona en dos asientos de la compra', async () => {
    const alContinuar = jest.fn();
    const pantalla = await dibujar({ alContinuar });
    await fireEvent.changeText(
      pantalla.getByLabelText('Nombre completo · Asiento 8'),
      'Ana Ruiz',
    );
    await fireEvent.changeText(
      pantalla.getByLabelText('Nombre completo · Asiento 9'),
      'ana  ruiz',
    );
    expect(
      pantalla.getAllByText(
        'Esta persona ya tiene boleto en este viaje. Escribí el nombre de otra persona.',
      ).length,
    ).toBeGreaterThan(0);
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ir al pago' }));
    expect(alContinuar).not.toHaveBeenCalled();
  });

  it('no deja comprar otro boleto a quien ya tiene uno vigente en el viaje', async () => {
    const alContinuar = jest.fn();
    const existente = {
      boleto: {
        estado: 'vigente',
        pasajero: { esMenorEnBrazos: false, nombre: 'Kisnner Obando' },
        viajeId: 'via_2',
      },
    } as unknown as BoletoGuardado;
    const pantalla = await renderPantalla(
      <ContextoBoletos.Provider
        value={{
          boletos: [existente],
          cancelar: async () => undefined,
          cargando: false,
          reservar: async () => ({ error: 'viaje-inexistente', ok: false }),
          validar: async () => undefined,
        }}
      >
        <ProveedorReserva>
          <Pasajeros
            alContinuar={alContinuar}
            alVolver={() => undefined}
            asientos={[8]}
            viajeId="via_2"
          />
        </ProveedorReserva>
      </ContextoBoletos.Provider>,
    );
    await fireEvent.changeText(
      pantalla.getByLabelText('Nombre completo · Asiento 8'),
      'Kisnner Obando',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ir al pago' }));
    expect(alContinuar).not.toHaveBeenCalled();
    // otra persona sí puede comprar en el mismo viaje
    await fireEvent.changeText(
      pantalla.getByLabelText('Nombre completo · Asiento 8'),
      'Alondra Obando',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Ir al pago' }));
    expect(alContinuar).toHaveBeenCalledTimes(1);
  });
});
