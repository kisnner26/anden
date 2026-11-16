import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { ProveedorCierres } from '@/datos/ProveedorCierres';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { obtenerMuestra, reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';
import { TRANSMISION } from '@/servicios/transmision';

import { ConductorInicio } from './ConductorInicio';

// las salidas de muestra dependen de la hora; se fija media tarde
beforeEach(async () => {
  jest.useFakeTimers({
    advanceTimers: true,
    now: new Date(2026, 10, 12, 14, 0),
  });
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'anden.sesion',
    JSON.stringify({
      choferId: 'cho_2',
      nombre: 'Marvin Lanzas',
      rol: 'conductor',
    }),
  );
});

afterEach(() => {
  TRANSMISION.detener('via_2');
  reiniciarMuestra();
  jest.useRealTimers();
});

function dibujar(
  alAbrirViaje: (id: string) => void = () => undefined,
  alAbrirPerfil?: () => void,
) {
  return renderPantalla(
    <ProveedorSesion>
      <ProveedorCierres>
        <ConductorInicio
          alAbrirPerfil={alAbrirPerfil}
          alAbrirViaje={alAbrirViaje}
        />
      </ProveedorCierres>
    </ProveedorSesion>,
  );
}

describe('ConductorInicio', () => {
  it('saluda al chofer y lista solo sus viajes', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Hola, Marvin Lanzas')).toBeTruthy();
    expect(pantalla.getByText(/^Tus viajes/)).toBeTruthy();
    expect(
      pantalla.getAllByRole('button', { name: /^Abrir el viaje a/ }).length,
    ).toBeGreaterThan(0);
  });

  it('dice de dónde a dónde va cada viaje', async () => {
    const pantalla = await dibujar();
    await pantalla.findByText('Hola, Marvin Lanzas');
    expect(
      pantalla.getAllByText(
        /^(Boaco|Juigalpa|Managua) → (Boaco|Juigalpa|Managua)$/,
      ).length,
    ).toBeGreaterThan(0);
    expect(
      pantalla.getAllByText(/^(Boaco|Juigalpa) → /).length,
    ).toBeGreaterThan(0);
  });

  it('tocar la foto del chofer abre su perfil', async () => {
    const alAbrirPerfil = jest.fn();
    const pantalla = await dibujar(undefined, alAbrirPerfil);
    await pantalla.findByText('Hola, Marvin Lanzas');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Tu perfil' }));
    expect(alAbrirPerfil).toHaveBeenCalledTimes(1);
  });

  it('abre el viaje que se toca', async () => {
    const alAbrirViaje = jest.fn();
    const pantalla = await dibujar(alAbrirViaje);
    await pantalla.findByText('Hola, Marvin Lanzas');
    await fireEvent.press(
      pantalla.getAllByRole('button', {
        name: /^Abrir el viaje a/,
      })[0] as never,
    );
    expect(alAbrirViaje).toHaveBeenCalledTimes(1);
  });

  it('marca como en vivo el viaje que se está compartiendo', async () => {
    const pantalla = await dibujar();
    await pantalla.findByText('Hola, Marvin Lanzas');
    expect(pantalla.queryByText('En vivo')).toBeNull();
    TRANSMISION.iniciar('via_2', 'cho_2');
    expect(await pantalla.findByText('En vivo')).toBeTruthy();
  });

  it('un viaje que ya está en marcha no se puede retirar ni ofrecer a más pasajeros', async () => {
    const pantalla = await dibujar();
    await pantalla.findByText('Hola, Marvin Lanzas');
    const antes = pantalla.getAllByRole('button', {
      name: 'Retirar viaje',
    }).length;
    TRANSMISION.iniciar('via_2', 'cho_2');
    await pantalla.findByText('En vivo');
    expect(
      pantalla.getAllByRole('button', { name: 'Retirar viaje' }).length,
    ).toBe(antes - 1);
  });

  it('marca los viajes que ya cerró con lo que cobró', async () => {
    const viaje = obtenerMuestra().viajes.find((v) => v.choferId === 'cho_2')!;
    await AsyncStorage.setItem(
      'anden.cierres',
      JSON.stringify([
        {
          cerradoEn: new Date().toISOString(),
          choferId: 'cho_2',
          cobrado: 140,
          pagados: 2,
          pasajeros: 2,
          pendiente: 0,
          sinPagar: [],
          total: 140,
          viajeId: viaje.id,
        },
      ]),
    );
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Cerrado · cobrado C$ 140')).toBeTruthy();
  });

  it('al retirar un viaje con pasajeros pide el motivo para avisarles', async () => {
    const pantalla = await dibujar();
    await pantalla.findByText('Hola, Marvin Lanzas');
    const retirar = pantalla.getAllByRole('button', { name: 'Retirar viaje' });
    // el viaje de Boaco ya tiene asientos vendidos: alguno de los viajes del chofer pide motivo
    let pidio = false;
    for (const boton of retirar) {
      await fireEvent.press(boton);
      if (pantalla.queryByText('Decile a tus pasajeros por qué')) {
        pidio = true;
        break;
      }
    }
    expect(pidio).toBe(true);
    expect(pantalla.getByText('Avería del bus')).toBeTruthy();
    await fireEvent.press(pantalla.getByText('Clima o estado del camino'));
    expect(
      pantalla.getByRole('button', { name: 'Clima o estado del camino' }).props
        .accessibilityState?.selected,
    ).toBe(true);
  });

  it('ofrece buscar pasajeros en los viajes con asientos libres', async () => {
    const pantalla = await dibujar();
    await pantalla.findByText('Hola, Marvin Lanzas');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Buscar pasajeros' }),
    );
    expect(pantalla.getByText('¿Por cuánto tiempo?')).toBeTruthy();
    expect(pantalla.getAllByText('30 min').length).toBeGreaterThan(0);
  });
});
