import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import type { Habitual } from '@/datos/habituales';
import type { Salida } from '@/datos/salidas';
import { renderPantalla } from '@/pruebas/render';

import { TarjetaHabitual } from './TarjetaHabitual';

const AHORA = new Date(2026, 10, 15, 20, 0);
const HABITUAL: Habitual = {
  destino: 'Managua',
  dias: [1, 3],
  hora: '06:00',
  id: 'hab_boaco_managua_06:00',
  origen: 'Boaco',
};

function salida(cuando: Date): Salida {
  return {
    anden: 1,
    asientosLibres: 10,
    choferId: 'cho_1',
    codigoDestino: 'MAY',
    destino: 'Managua',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Boaco',
    placa: 'M 000000',
    rutaId: 'rut_boa_may',
    salida: cuando,
    servicio: 'ordinario',
    tarifa: 70,
    ventaAbierta: true,
    viajeId: 'via_lunes',
  };
}

describe('TarjetaHabitual', () => {
  it('muestra el trayecto, los días y la hora del viaje habitual', async () => {
    const pantalla = await renderPantalla(
      <TarjetaHabitual
        ahora={AHORA}
        alQuitar={() => undefined}
        alReservar={() => undefined}
        habitual={HABITUAL}
        proxima={null}
      />,
    );
    expect(pantalla.getByText('Mi viaje habitual')).toBeTruthy();
    expect(pantalla.getByText('Boaco → Managua')).toBeTruthy();
    expect(pantalla.getByText('lun, mié · 6:00 a. m.')).toBeTruthy();
  });

  it('ofrece reservar la próxima salida y avisa cuál es', async () => {
    const alReservar = jest.fn();
    const pantalla = await renderPantalla(
      <TarjetaHabitual
        ahora={AHORA}
        alQuitar={() => undefined}
        alReservar={alReservar}
        habitual={HABITUAL}
        proxima={salida(new Date(2026, 10, 16, 6, 0))}
      />,
    );
    expect(pantalla.getByText('Próxima: mañana 6:00 a. m.')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', {
        name: 'Reservar la salida de mañana 6:00 a. m.',
      }),
    );
    expect(alReservar).toHaveBeenCalledWith('via_lunes');
  });

  it('para un día más lejano dice la fecha', async () => {
    const pantalla = await renderPantalla(
      <TarjetaHabitual
        ahora={AHORA}
        alQuitar={() => undefined}
        alReservar={() => undefined}
        habitual={HABITUAL}
        proxima={salida(new Date(2026, 10, 18, 6, 0))}
      />,
    );
    expect(pantalla.getByText('Próxima: mié 18 nov 6:00 a. m.')).toBeTruthy();
  });

  it('sin una salida parecida lo dice en vez de ofrecer reservar', async () => {
    const pantalla = await renderPantalla(
      <TarjetaHabitual
        ahora={AHORA}
        alQuitar={() => undefined}
        alReservar={() => undefined}
        habitual={HABITUAL}
        proxima={null}
      />,
    );
    expect(
      pantalla.getByText('No hay una salida parecida en los próximos días.'),
    ).toBeTruthy();
    expect(
      pantalla.queryByRole('button', { name: /^Reservar la salida/ }),
    ).toBeNull();
  });

  it('deja quitar el viaje habitual', async () => {
    const alQuitar = jest.fn();
    const pantalla = await renderPantalla(
      <TarjetaHabitual
        ahora={AHORA}
        alQuitar={alQuitar}
        alReservar={() => undefined}
        habitual={HABITUAL}
        proxima={null}
      />,
    );
    // la acción está detrás de la tarjeta y solo se ve al deslizar
    await fireEvent.press(
      pantalla.getByTestId('deslizar-eliminar', {
        includeHiddenElements: true,
      }),
    );
    await waitFor(() => expect(alQuitar).toHaveBeenCalledTimes(1));
    expect(pantalla.queryByText('Quitar', { exact: true })).toBeNull();
  });
});
