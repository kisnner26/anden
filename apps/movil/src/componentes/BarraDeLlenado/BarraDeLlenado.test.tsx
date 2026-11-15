import { describe, expect, it } from '@jest/globals';

import type { Salida } from '@/datos/salidas';
import { renderPantalla } from '@/pruebas/render';

import { BarraDeLlenado } from './BarraDeLlenado';

function salida(parcial: Partial<Salida>): Salida {
  return {
    asientosLibres: 6,
    asientosTotales: 30,
    destino: 'Boaco',
    salida: new Date(2026, 10, 15, 14, 0),
    ventaAbierta: true,
    ...parcial,
  } as Salida;
}

describe('BarraDeLlenado', () => {
  it('dice cuántos faltan para que el bus salga', async () => {
    const p = await renderPantalla(<BarraDeLlenado salida={salida({})} />);
    expect(p.getByText('Faltan 6 para que salga.')).toBeTruthy();
    expect(p.getByLabelText('24 de 30 asientos vendidos')).toBeTruthy();
    expect(p.getByRole('button', { name: 'Invitar a alguien' })).toBeTruthy();
  });

  it('en singular cuando falta uno', async () => {
    const p = await renderPantalla(
      <BarraDeLlenado salida={salida({ asientosLibres: 1 })} />,
    );
    expect(p.getByText('Falta 1 para que salga.')).toBeTruthy();
  });

  it('lleno no invita a nadie', async () => {
    const p = await renderPantalla(
      <BarraDeLlenado salida={salida({ asientosLibres: 0 })} />,
    );
    expect(
      p.getByText('El bus está lleno: sale en cualquier momento.'),
    ).toBeTruthy();
    expect(p.queryByRole('button', { name: 'Invitar a alguien' })).toBeNull();
  });

  it('sin el total de asientos o con la venta cerrada no dibuja nada', async () => {
    const a = await renderPantalla(
      <BarraDeLlenado salida={salida({ asientosTotales: undefined })} />,
    );
    expect(a.queryByTestId('barra-de-llenado')).toBeNull();
    const b = await renderPantalla(
      <BarraDeLlenado salida={salida({ ventaAbierta: false })} />,
    );
    expect(b.queryByTestId('barra-de-llenado')).toBeNull();
  });
});
