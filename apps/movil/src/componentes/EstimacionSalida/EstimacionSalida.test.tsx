import { afterEach, describe, expect, it } from '@jest/globals';

import { VIAJE_BOACO } from '@/datos/muestra';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { EstimacionSalida } from './EstimacionSalida';

afterEach(() => reiniciarMuestra());

describe('EstimacionSalida', () => {
  it('explica que el bus sale al llenarse y muestra lo vendido', async () => {
    const pantalla = await renderPantalla(
      <EstimacionSalida viajeId={VIAJE_BOACO} />,
    );
    expect(pantalla.getByText('Cuándo sale')).toBeTruthy();
    expect(pantalla.getByText(/Se pone en andén a las/)).toBeTruthy();
    expect(pantalla.getByText(/asientos vendidos/)).toBeTruthy();
    expect(
      pantalla.getByText(
        'El interlocal no tiene hora fija: sale cuando se llena.',
      ),
    ).toBeTruthy();
  });

  it('no dibuja nada para un viaje que no existe', async () => {
    const pantalla = await renderPantalla(
      <EstimacionSalida viajeId="no_existe" />,
    );
    expect(pantalla.queryByText('Cuándo sale')).toBeNull();
  });
});
