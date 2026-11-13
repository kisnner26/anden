import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('@/datos/notificaciones', () => ({
  cancelarRecordatorio: jest.fn(async () => undefined),
  leerPermiso: jest.fn(async () => 'concedido'),
  pedirPermiso: jest.fn(async () => 'concedido'),
  programarRecordatorio: jest.fn(async () => 'notif_1'),
}));

import { programarRecordatorio } from '@/datos/notificaciones';
import { ProveedorRecordatorios } from '@/datos/ProveedorRecordatorios';

import { ProveedorFavoritos } from '@/datos/ProveedorFavoritos';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { ProveedorSuscripcion } from '@/datos/ProveedorSuscripcion';
import type { ServicioSuscripcion } from '@/servicios/suscripcion';

import { Horarios } from './Horarios';

const SERVICIO_PLUS: ServicioSuscripcion = {
  activar: async () => ({ desde: '2026-11-01T00:00:00Z', plan: 'plus' }),
  cancelar: async () => ({ desde: null, plan: 'gratis' }),
  leer: async () => ({ desde: '2026-11-01T00:00:00Z', plan: 'plus' }),
};

// las salidas de muestra dependen de la hora; se fija media tarde para que las ocho de hoy no cruzen la medianoche
beforeEach(() => {
  jest.useFakeTimers({
    advanceTimers: true,
    now: new Date(2026, 10, 12, 14, 0),
  });
});

afterEach(() => {
  reiniciarMuestra();
  jest.useRealTimers();
});

describe('Horarios', () => {
  it('muestra el título y la terminal', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    expect(pantalla.getByText('Mercado Mayoreo')).toBeTruthy();
    expect(pantalla.getByTestId('tablero-salidas')).toBeTruthy();
  });

  it('muestra las ocho salidas sin filtro', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    expect(
      pantalla.getAllByLabelText(/, (Salió|Abordando|A tiempo|\+\d+ min)$/),
    ).toHaveLength(8);
  });

  it('filtra por servicio expreso', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    await fireEvent.press(pantalla.getByRole('button', { name: /^Filtros/ }));
    await fireEvent.press(pantalla.getByRole('button', { name: 'Expreso' }));
    expect(
      pantalla.getAllByLabelText(/, (Salió|Abordando|A tiempo|\+\d+ min)$/),
    ).toHaveLength(3);
    expect(
      pantalla.getByRole('button', { name: 'Expreso' }).props
        .accessibilityState,
    ).toMatchObject({ selected: true });
  });

  it('vuelve a mostrar todas con el filtro Todos', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    await fireEvent.press(pantalla.getByRole('button', { name: /^Filtros/ }));
    await fireEvent.press(pantalla.getByRole('button', { name: 'Expreso' }));
    await fireEvent.press(pantalla.getByRole('button', { name: 'Todos' }));
    expect(
      pantalla.getAllByLabelText(/, (Salió|Abordando|A tiempo|\+\d+ min)$/),
    ).toHaveLength(8);
  });

  it('la lupa abre el buscador', async () => {
    const alAbrirBuscador = jest.fn();
    const pantalla = await renderPantalla(
      <Horarios alAbrirBuscador={alAbrirBuscador} />,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Buscar' }));
    expect(alAbrirBuscador).toHaveBeenCalledTimes(1);
  });

  it('destaca la próxima salida con cuánto falta y los asientos', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    expect(pantalla.getByText('Próxima salida')).toBeTruthy();
    expect(
      pantalla.getByText(/^Sale en \d+ min · (\d+ libres|Pocos asientos)$/),
    ).toBeTruthy();
  });

  it('lista la disponibilidad de las salidas que faltan', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    expect(pantalla.getByText('Disponibilidad')).toBeTruthy();
    expect(
      pantalla.getAllByText(/^\d+ libres$|^Pocos asientos · \d+$|^Agotado$/)
        .length,
    ).toBeGreaterThan(0);
  });

  it('explica cómo marcar favoritas cuando no hay ninguna', async () => {
    const pantalla = await renderPantalla(
      <ProveedorFavoritos>
        <Horarios />
      </ProveedorFavoritos>,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: /^Filtros/ }));
    await fireEvent.press(pantalla.getByRole('button', { name: 'Mis rutas' }));
    expect(
      pantalla.getByText('Marcá una ruta con la estrella para verla acá.'),
    ).toBeTruthy();
  });

  it('pide un aviso para una salida desde la campana y lo quita después', async () => {
    const pantalla = await renderPantalla(
      <ProveedorSuscripcion servicio={SERVICIO_PLUS}>
        <ProveedorRecordatorios>
          <Horarios />
        </ProveedorRecordatorios>
      </ProveedorSuscripcion>,
    );
    await pantalla.findAllByRole('button', { name: /^Recordarme la salida a/ });
    const campanas = pantalla.getAllByRole('button', {
      name: /^Recordarme la salida a/,
    });
    await fireEvent.press(campanas[0] as never);
    expect(pantalla.getByText('Avisarme antes de la salida')).toBeTruthy();

    await fireEvent.press(
      pantalla.getByRole('button', { name: '15 min antes' }),
    );
    await waitFor(() => expect(programarRecordatorio).toHaveBeenCalledTimes(1));
    await waitFor(() =>
      expect(
        pantalla.getAllByRole('button', {
          name: /^Quitar el recordatorio de la salida a/,
        }),
      ).toHaveLength(1),
    );

    await fireEvent.press(
      pantalla.getByRole('button', {
        name: /^Quitar el recordatorio de la salida a/,
      }),
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Quitar recordatorio' }),
    );
    await waitFor(() =>
      expect(
        pantalla.queryByRole('button', {
          name: /^Quitar el recordatorio de la salida a/,
        }),
      ).toBeNull(),
    );
  });

  it('reúne los filtros en una hoja con rótulos y cuenta los activos', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    expect(pantalla.queryByText('Servicio')).toBeNull();
    await fireEvent.press(pantalla.getByRole('button', { name: /^Filtros/ }));
    expect(pantalla.getByText('Salen de')).toBeTruthy();
    expect(pantalla.getByText('Mostrar')).toBeTruthy();
    expect(pantalla.getByText('Servicio')).toBeTruthy();
    await fireEvent.press(pantalla.getByRole('button', { name: 'Expreso' }));
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Ver salidas' }),
    );
    expect(pantalla.getByRole('button', { name: 'Filtros, 1' })).toBeTruthy();
  });

  it('quita todos los filtros de una vez', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    await fireEvent.press(pantalla.getByRole('button', { name: /^Filtros/ }));
    await fireEvent.press(pantalla.getByRole('button', { name: 'Expreso' }));
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Ver salidas' }),
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Quitar filtros' }),
    );
    expect(pantalla.getByRole('button', { name: 'Filtros' })).toBeTruthy();
  });

  it('deja elegir otro día y muestra las salidas de ese día', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    expect(pantalla.getByText('Próxima salida')).toBeTruthy();

    await fireEvent.press(pantalla.getByRole('button', { name: 'Mañana' }));

    expect(pantalla.getByText('Primera salida del día')).toBeTruthy();
    expect(pantalla.queryByText('Próxima salida')).toBeNull();
    // 6 salidas al día hacia Boaco y 6 hacia Juigalpa
    expect(
      pantalla.getAllByLabelText(/, (Salió|Abordando|A tiempo|\+\d+ min)$/),
    ).toHaveLength(12);
    // no se ofrece "sale en N min" para un día que todavía no llegó
    expect(pantalla.queryByText(/^Sale en \d+ min/)).toBeNull();
  });

  it('al volver a Hoy muestra otra vez las ocho salidas de hoy', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    await fireEvent.press(pantalla.getByRole('button', { name: 'Mañana' }));
    await fireEvent.press(pantalla.getByRole('button', { name: 'Hoy' }));
    expect(
      pantalla.getAllByLabelText(/, (Salió|Abordando|A tiempo|\+\d+ min)$/),
    ).toHaveLength(8);
  });

  it('sin Plus solo deja pedir el aviso de 30 minutos', async () => {
    const pantalla = await renderPantalla(
      <ProveedorRecordatorios>
        <Horarios />
      </ProveedorRecordatorios>,
    );
    const campanas = pantalla.getAllByRole('button', {
      name: /^Recordarme la salida a/,
    });
    await fireEvent.press(campanas[0] as never);
    expect(
      pantalla.getByText('Con Plus elegís también 15 y 60 minutos antes.'),
    ).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: '15 min antes · Plus' }).props
        .accessibilityState,
    ).toMatchObject({ disabled: true });
  });
});
