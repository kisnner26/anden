import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

jest.mock('@/datos/ubicacion', () => ({
  consultarAccesoUbicacion: jest.fn(),
  obtenerUbicacionActual: jest.fn(),
  solicitarAccesoUbicacion: jest.fn(),
}));

import { ProveedorUbicacion } from '@/datos/ProveedorUbicacion';
import { PERFIL_VACIO } from '@/datos/perfil';
import { CLAVE_UBICACION_AUTOMATICA } from '@/datos/preferenciaUbicacion';
import {
  consultarAccesoUbicacion,
  obtenerUbicacionActual,
} from '@/datos/ubicacion';
import { ContextoAvisos, type ValorAvisos } from '@/datos/useAvisos';
import { ContextoPerfil } from '@/datos/usePerfil';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { Viajar } from './Viajar';

afterEach(() => {
  jest.restoreAllMocks();
  reiniciarMuestra();
});

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

  it('saluda por el primer nombre y usa las iniciales del perfil', async () => {
    const pantalla = await renderPantalla(
      <ContextoPerfil.Provider
        value={{
          agregarPasajero: async () => undefined,
          cargando: false,
          guardar: async () => undefined,
          perfil: { ...PERFIL_VACIO, apellido: 'Ruiz', nombre: 'Ana María' },
          quitarPasajero: async () => undefined,
        }}
      >
        <Viajar
          alAbrirViaje={() => undefined}
          alElegirAsiento={() => undefined}
        />
      </ContextoPerfil.Provider>,
    );

    expect(pantalla.getByText('Hola, Ana')).toBeTruthy();
    expect(pantalla.getByText('AR')).toBeTruthy();
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

  it('deja origen, destino y ubicación fuera de la portada', async () => {
    const pantalla = await dibujar();

    expect(pantalla.queryByLabelText('Salgo desde')).toBeNull();
    expect(pantalla.queryByLabelText('Voy hacia')).toBeNull();
    expect(
      pantalla.queryByRole('button', { name: 'Usar mi ubicación' }),
    ).toBeNull();
  });

  it('ofrece cómo llegar a la terminal de salida en Apple Maps', async () => {
    const pantalla = await dibujar();

    expect(
      pantalla.getByRole('link', { name: 'Cómo llegar, Mercado Mayoreo' }),
    ).toBeTruthy();
  });

  it('propone el origen al abrir si la preferencia estaba activada', async () => {
    await AsyncStorage.setItem(CLAVE_UBICACION_AUTOMATICA, '1');
    jest
      .mocked(consultarAccesoUbicacion)
      .mockResolvedValue({ estado: 'otorgado' });
    jest.mocked(obtenerUbicacionActual).mockResolvedValue({
      estado: 'otorgado',
      punto: { lat: 12.469, lng: -85.656 },
    });

    const pantalla = await renderPantalla(
      <ProveedorUbicacion>
        <Viajar
          alAbrirViaje={() => undefined}
          alElegirAsiento={() => undefined}
        />
      </ProveedorUbicacion>,
    );

    expect((await pantalla.findAllByText('Managua')).length).toBeGreaterThan(0);
    expect(obtenerUbicacionActual).toHaveBeenCalledTimes(1);
  });

  it('lista otras salidas sin repetir la destacada', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getAllByRole('button', { name: /andén/ })).toHaveLength(3);
  });

  it('muestra salidas hacia Boaco y Juigalpa', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getAllByText('Boaco').length).toBeGreaterThan(0);
    expect(pantalla.getAllByText('Juigalpa').length).toBeGreaterThan(0);
  });

  it('no mezcla fecha ni pasajeros con las salidas inmediatas', async () => {
    const pantalla = await dibujar();
    expect(pantalla.queryAllByRole('radio')).toHaveLength(0);
    expect(
      pantalla.queryByRole('button', { name: 'Agregar pasajero' }),
    ).toBeNull();
  });

  it('no repite los destinos como botones secundarios', async () => {
    const pantalla = await dibujar();
    expect(pantalla.queryByRole('button', { name: /Usar ruta a/ })).toBeNull();
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
    expect(alAbrirViaje).toHaveBeenCalledWith('via_3');
  });

  it('abre configuración desde el avatar', async () => {
    const alAbrirAjustes = jest.fn();
    const pantalla = await dibujar({ alAbrirAjustes });
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Configuración' }),
    );
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
});
