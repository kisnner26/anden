import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';
import { armarCierre } from '@/servicios/cierres';

import { HojaCierreViaje } from './HojaCierreViaje';

const RESUMEN = armarCierre(
  [
    { asiento: 8, boletoId: 'b8', nombre: 'ana ruiz', precio: 70 },
    { asiento: 9, boletoId: 'b9', nombre: 'Luis Pérez', precio: 85 },
  ],
  { b9: { estado: 'pagado_efectivo' } },
  'via_1',
  'cho_2',
  new Date('2026-11-12T18:00:00.000Z'),
);

describe('HojaCierreViaje', () => {
  it('sin resumen no muestra nada', async () => {
    const pantalla = await renderPantalla(
      <HojaCierreViaje
        alCerrarHoja={() => undefined}
        alConfirmar={() => undefined}
        resumen={null}
      />,
    );
    expect(pantalla.queryByText('Cerrar el viaje')).toBeNull();
  });

  it('muestra cuántos pagaron, lo cobrado y lo que falta', async () => {
    const pantalla = await renderPantalla(
      <HojaCierreViaje
        alCerrarHoja={() => undefined}
        alConfirmar={() => undefined}
        resumen={RESUMEN}
      />,
    );
    expect(pantalla.getByText('1 de 2 pasajeros pagaron')).toBeTruthy();
    expect(pantalla.getByText('Cobrado C$ 85')).toBeTruthy();
    expect(pantalla.getByText('Por cobrar C$ 70')).toBeTruthy();
  });

  it('nombra a quien no pagó con su asiento y su monto', async () => {
    const pantalla = await renderPantalla(
      <HojaCierreViaje
        alCerrarHoja={() => undefined}
        alConfirmar={() => undefined}
        resumen={RESUMEN}
      />,
    );
    expect(pantalla.getByText('No pagaron')).toBeTruthy();
    expect(pantalla.getByText('Asiento 8 · Ana Ruiz · C$ 70')).toBeTruthy();
  });

  it('si todos pagaron lo dice en vez de listar', async () => {
    const todos = armarCierre(
      [{ asiento: 9, boletoId: 'b9', nombre: 'Luis', precio: 85 }],
      { b9: { estado: 'pagado_efectivo' } },
      'via_1',
      'cho_2',
    );
    const pantalla = await renderPantalla(
      <HojaCierreViaje
        alCerrarHoja={() => undefined}
        alConfirmar={() => undefined}
        resumen={todos}
      />,
    );
    expect(pantalla.getByText('Todos pagaron.')).toBeTruthy();
    expect(pantalla.queryByText('No pagaron')).toBeNull();
  });

  it('confirma el cierre o deja seguir cobrando', async () => {
    const alConfirmar = jest.fn();
    const alCerrarHoja = jest.fn();
    const pantalla = await renderPantalla(
      <HojaCierreViaje
        alCerrarHoja={alCerrarHoja}
        alConfirmar={alConfirmar}
        resumen={RESUMEN}
      />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Cerrar viaje' }),
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Seguir cobrando' }),
    );
    expect(alConfirmar).toHaveBeenCalledTimes(1);
    expect(alCerrarHoja).toHaveBeenCalledTimes(1);
  });
});
