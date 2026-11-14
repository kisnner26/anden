import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { Salida } from '@/datos/salidas';
import { renderPantalla } from '@/pruebas/render';

import { AtajosDelDia } from './AtajosDelDia';

const SALIDA: Salida = {
  puntoEncuentro: '764M4PPX+HH',
  asientosLibres: 12,
  choferId: 'cho_1',
  codigoDestino: 'BOA',
  destino: 'Boaco',
  estado: 'programado',
  minutosAtraso: 0,
  origen: 'Managua',
  placa: 'M 1',
  rutaId: 'rut_1',
  salida: new Date(2026, 10, 13, 14, 30),
  servicio: 'ordinario',
  tarifa: 65,
  ventaAbierta: true,
  viajeId: 'via_1',
};

describe('AtajosDelDia', () => {
  it('muestra la más barata, la más temprana y la que tiene más espacio', async () => {
    const p = await renderPantalla(
      <AtajosDelDia
        atajos={{ masBarata: SALIDA, masLibre: SALIDA, masTemprana: SALIDA }}
      />,
    );
    expect(p.getByText('C$ 65')).toBeTruthy();
    expect(p.getByText('2:30 p. m.')).toBeTruthy();
    expect(p.getByText('12 libres')).toBeTruthy();
  });

  it('tocar un atajo abre esa salida', async () => {
    const alAbrir = jest.fn();
    const p = await renderPantalla(
      <AtajosDelDia
        alAbrir={alAbrir}
        atajos={{ masBarata: SALIDA, masLibre: null, masTemprana: null }}
      />,
    );
    await fireEvent.press(p.getByRole('button', { name: /^Más barata/ }));
    expect(alAbrir).toHaveBeenCalledWith('via_1');
  });

  it('sin ninguna salida útil no dibuja nada', async () => {
    const p = await renderPantalla(
      <AtajosDelDia
        atajos={{ masBarata: null, masLibre: null, masTemprana: null }}
      />,
    );
    expect(p.queryByTestId('atajos-del-dia')).toBeNull();
  });
});
