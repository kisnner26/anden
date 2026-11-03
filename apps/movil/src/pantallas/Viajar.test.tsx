import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { ContextoAvisos, type ValorAvisos } from '@/datos/useAvisos';
import { reiniciarMuestra } from '@/datos/useSalidas';
import * as ubicacion from '@/datos/ubicacion';
import { renderPantalla } from '@/pruebas/render';

import { Viajar } from './Viajar';

afterEach(() => reiniciarMuestra());

function dibujar(propiedades: Partial<Parameters<typeof Viajar>[0]> = {}) {
  return renderPantalla(
    <Viajar
      alAbrirViaje={() => undefined}
      alElegirAsiento={() => undefined}
      {...propiedades}
    />,
  );
}

describe('Viajar', () => {
  it('saluda y pregunta a dónde va la persona', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Hola')).toBeTruthy();
    expect(pantalla.getByText('¿A dónde vas hoy?')).toBeTruthy();
  });

  it('muestra el próximo viaje a Boaco', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByTestId('proximo-viaje')).toBeTruthy();
    expect(pantalla.getAllByText('Boaco').length).toBeGreaterThan(0);
  });

  it('avisa que las tarifas son de muestra', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Tarifas de muestra')).toBeTruthy();
  });

  it('deja cambiar el origen manualmente', async () => {
    const pantalla = await dibujar();
    await fireEvent(pantalla.getByLabelText('Salgo desde'), 'focus');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Terminal Juigalpa' }),
    );
    expect(pantalla.getByDisplayValue('Terminal Juigalpa')).toBeTruthy();
    expect(pantalla.getByDisplayValue('Terminal UCA')).toBeTruthy();
  });

  it('lista las salidas pendientes del destino elegido', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getAllByRole('button', { name: /andén/ })).toHaveLength(3);
  });

  it('actualiza la próxima salida al elegir otro destino', async () => {
    const pantalla = await dibujar();
    await fireEvent.changeText(pantalla.getByLabelText('Voy hacia'), 'Juigalpa');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Terminal Juigalpa' }),
    );
    expect(pantalla.getByDisplayValue('Terminal Juigalpa')).toBeTruthy();
    expect(pantalla.getAllByText('Juigalpa').length).toBeGreaterThan(0);
  });

  it('permite elegir fecha y cantidad de pasajeros', async () => {
    const pantalla = await dibujar();
    const fechas = pantalla.getAllByRole('radio');
    expect(fechas).toHaveLength(3);
    await fireEvent.press(fechas[1] as never);
    expect(
      (fechas[1] as never as { props: { accessibilityState: unknown } }).props
        .accessibilityState,
    ).toEqual(expect.objectContaining({ checked: true }));
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Agregar pasajero' }),
    );
    expect(pantalla.getByLabelText('2 Pasajeros')).toBeTruthy();
  });

  it('recupera un destino desde tus rutas', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Usar ruta a Juigalpa' }),
    );
    expect(pantalla.getByDisplayValue('Terminal Juigalpa')).toBeTruthy();
    expect(pantalla.getAllByText('Juigalpa').length).toBeGreaterThan(0);
  });

  it('va directo a los asientos desde el botón del próximo viaje', async () => {
    const alElegirAsiento = jest.fn();
    const pantalla = await dibujar({ alElegirAsiento });
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Elegir asiento' }),
    );
    expect(alElegirAsiento).toHaveBeenCalledWith('via_2');
  });

  it('abre el detalle del viaje desde una fila de salida', async () => {
    const alAbrirViaje = jest.fn();
    const pantalla = await dibujar({ alAbrirViaje });
    await fireEvent.press(
      pantalla.getAllByRole('button', { name: /andén/ })[0] as never,
    );
    expect(alAbrirViaje).toHaveBeenCalledWith('via_2');
  });

  it('abre la apariencia desde el avatar', async () => {
    const alAbrirAjustes = jest.fn();
    const pantalla = await dibujar({ alAbrirAjustes });
    await fireEvent.press(pantalla.getByRole('button', { name: 'Apariencia' }));
    expect(alAbrirAjustes).toHaveBeenCalledTimes(1);
  });

  it('la campana abre los avisos', async () => {
    const alAbrirAvisos = jest.fn();
    const pantalla = await dibujar({ alAbrirAvisos });
    await fireEvent.press(pantalla.getByRole('button', { name: 'Avisos' }));
    expect(alAbrirAvisos).toHaveBeenCalledTimes(1);
  });

  it('la campana muestra un punto cuando hay avisos sin leer', async () => {
    const sinLeer: ValorAvisos = {
      activadas: false,
      activar: async () => false,
      avisos: [],
      desactivar: async () => undefined,
      leidos: [],
      marcarLeido: async () => undefined,
      marcarTodos: async () => undefined,
      noLeidos: 2,
      permiso: 'sin-preguntar',
    };
    const pantalla = await renderPantalla(
      <ContextoAvisos.Provider value={sinLeer}>
        <Viajar
          alAbrirViaje={() => undefined}
          alElegirAsiento={() => undefined}
        />
      </ContextoAvisos.Provider>,
    );
    expect(pantalla.getByTestId('campana-sin-leer')).toBeTruthy();
  });

  it('sin avisos por leer la campana no lleva punto', async () => {
    const pantalla = await dibujar();
    expect(pantalla.queryByTestId('campana-sin-leer')).toBeNull();
  });

  it('ofrece ajustes solo cuando se deniega la ubicación', async () => {
    const pedirUbicacion = jest
      .spyOn(ubicacion, 'obtenerUbicacionActual')
      .mockResolvedValue({ estado: 'denegado' });
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Usar mi ubicación' }),
    );
    await waitFor(() =>
      expect(
        pantalla.getByRole('button', { name: 'Abrir ajustes' }),
      ).toBeTruthy(),
    );
    pedirUbicacion.mockRestore();
  });
});
