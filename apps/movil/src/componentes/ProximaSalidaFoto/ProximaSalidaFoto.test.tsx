import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { Salida } from '@/datos/salidas';
import { renderPantalla } from '@/pruebas/render';

import { ProximaSalidaFoto } from './ProximaSalidaFoto';

const AHORA = new Date(2026, 10, 13, 14, 0);
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

describe('ProximaSalidaFoto', () => {
  it('hoy dice en cuántos minutos sale y cuántos asientos hay', async () => {
    const p = await renderPantalla(
      <ProximaSalidaFoto ahora={AHORA} esHoy salida={SALIDA} />,
    );
    expect(p.getByText('Próxima salida')).toBeTruthy();
    expect(p.getByText('Boaco')).toBeTruthy();
    expect(p.getByText('Sale en 30 min · 12 libres')).toBeTruthy();
  });

  it('otro día habla de la primera salida y no de minutos', async () => {
    const p = await renderPantalla(
      <ProximaSalidaFoto ahora={AHORA} esHoy={false} salida={SALIDA} />,
    );
    expect(p.getByText('Primera salida del día')).toBeTruthy();
    expect(p.queryByText(/^Sale en/)).toBeNull();
  });

  it('con pocos asientos avisa', async () => {
    const p = await renderPantalla(
      <ProximaSalidaFoto
        ahora={AHORA}
        esHoy
        salida={{ ...SALIDA, asientosLibres: 3 }}
      />,
    );
    expect(p.getByText('Sale en 30 min · Pocos asientos')).toBeTruthy();
  });

  it('al tocarla abre el viaje', async () => {
    const alAbrir = jest.fn();
    const p = await renderPantalla(
      <ProximaSalidaFoto
        ahora={AHORA}
        alAbrir={alAbrir}
        esHoy
        salida={SALIDA}
      />,
    );
    await fireEvent.press(p.getByRole('button', { name: /^Boaco, 2:30/ }));
    expect(alAbrir).toHaveBeenCalledWith('via_1');
  });
});
