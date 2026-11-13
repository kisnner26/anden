import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { BoletoGuardado } from '@/datos/reserva';
import { renderPantalla } from '@/pruebas/render';

import { ResumenPlus } from './ResumenPlus';

const BOLETOS = [
  {
    boleto: { estado: 'vigente', id: 'a', precio: 70 },
    resumen: {
      destino: 'Boaco',
      origen: 'Mercado Mayoreo',
      salida: new Date(2026, 10, 3).toISOString(),
    },
  },
  {
    boleto: { estado: 'vigente', id: 'b', precio: 70 },
    resumen: {
      destino: 'Boaco',
      origen: 'Mercado Mayoreo',
      salida: new Date(2026, 10, 9).toISOString(),
    },
  },
] as unknown as BoletoGuardado[];

describe('ResumenPlus', () => {
  it('con Plus muestra las cuatro cifras', async () => {
    const pantalla = await renderPantalla(
      <ResumenPlus boletos={BOLETOS} plus />,
    );
    expect(pantalla.getByText('C$ 140')).toBeTruthy();
    expect(pantalla.getByText('Boaco')).toBeTruthy();
    expect(pantalla.getByText('Noviembre')).toBeTruthy();
    expect(pantalla.getByText(/^\d+ km$/)).toBeTruthy();
    expect(pantalla.queryByText('Ver qué incluye Plus')).toBeNull();
  });

  it('sin Plus las cifras están bloqueadas y se invita a conocerlo', async () => {
    const alAbrirPlus = jest.fn();
    const pantalla = await renderPantalla(
      <ResumenPlus alAbrirPlus={alAbrirPlus} boletos={BOLETOS} plus={false} />,
    );
    expect(pantalla.queryByText('C$ 140')).toBeNull();
    expect(pantalla.getByText('C$ —')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: /Mirá cuánto viajaste/ }),
    );
    expect(alAbrirPlus).toHaveBeenCalledTimes(1);
  });
});
