import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { ProveedorBusPropio } from '@/datos/ProveedorBusPropio';
import { ProveedorSuscripcion } from '@/datos/ProveedorSuscripcion';
import { useBusPropio } from '@/datos/useBusPropio';
import { Text } from 'react-native';
import { renderPantalla } from '@/pruebas/render';

import { Plus } from './Plus';

afterEach(async () => {
  await AsyncStorage.clear();
});

function SondaBus() {
  const { efectivo, elegido } = useBusPropio();
  return (
    <Text testID="sonda">{`${elegido ?? 'nada'}|${efectivo ?? 'nada'}`}</Text>
  );
}

function dibujar() {
  return renderPantalla(
    <ProveedorSuscripcion>
      <ProveedorBusPropio>
        <Plus alVolver={() => undefined} />
        <SondaBus />
      </ProveedorBusPropio>
    </ProveedorSuscripcion>,
  );
}

describe('Plus', () => {
  it('muestra el precio y el plan gratis al empezar', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('US$ 5')).toBeTruthy();
    expect(pantalla.getByText('al mes')).toBeTruthy();
    expect(pantalla.getByText('Estás en el plan gratis.')).toBeTruthy();
  });

  it('activa Plus y permite cancelarlo', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Activar Plus' }),
    );
    expect(await pantalla.findByText(/^Tenés Plus desde/)).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Cancelar Plus' }),
    );
    expect(await pantalla.findByText('Estás en el plan gratis.')).toBeTruthy();
  });

  it('avisa que por ahora no se cobra', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText(/sin cobro/)).toBeTruthy();
  });

  it('lista los cuatro beneficios que incluye', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Avisos a tu medida')).toBeTruthy();
    expect(pantalla.getByText('Viajes habituales sin límite')).toBeTruthy();
    expect(pantalla.getByText('Resumen de tus viajes')).toBeTruthy();
    expect(pantalla.getByText('Tu propio bus')).toBeTruthy();
  });

  it('sin Plus no deja elegir el bus', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Activá Plus para elegir tu bus.')).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: 'Coaster turquesa' }).props
        .accessibilityState,
    ).toMatchObject({ disabled: true });
  });

  it('con Plus el bus elegido se aplica y al cancelar deja de aplicarse', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Activar Plus' }),
    );
    await pantalla.findByText(/^Tenés Plus desde/);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Coaster turquesa' }),
    );
    expect(pantalla.getByTestId('sonda').props.children).toBe(
      'coaster-turquesa|coaster-turquesa',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Cancelar Plus' }),
    );
    await pantalla.findByText('Estás en el plan gratis.');
    expect(pantalla.getByTestId('sonda').props.children).toBe(
      'coaster-turquesa|nada',
    );
  });
});
