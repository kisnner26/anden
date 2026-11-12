import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

jest.mock('@/datos/ubicacion', () => ({
  consultarAccesoUbicacion: jest.fn(),
  solicitarAccesoUbicacion: jest.fn(),
}));

import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { CLAVE_MODO_USO } from '@/tema/modoUso';
import { ProveedorModoUso } from '@/tema/ProveedorModoUso';
import { ProveedorUbicacion } from '@/datos/ProveedorUbicacion';
import { CLAVE_UBICACION_AUTOMATICA } from '@/datos/preferenciaUbicacion';
import {
  consultarAccesoUbicacion,
  solicitarAccesoUbicacion,
} from '@/datos/ubicacion';
import { tamanosIcono } from '@/tema/espacios';
import { renderPantalla } from '@/pruebas/render';
import { CLAVE_PREFERENCIA_TEMA, ProveedorTema } from '@/tema/ProveedorTema';

import { Ajustes } from './Ajustes';

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  jest
    .mocked(consultarAccesoUbicacion)
    .mockResolvedValue({ estado: 'otorgado' });
  jest
    .mocked(solicitarAccesoUbicacion)
    .mockResolvedValue({ estado: 'otorgado' });
});

type Nodo = {
  children?: (Nodo | string)[] | null;
  props?: { style?: unknown };
};

function textoDe(nodo: Nodo | string): string {
  if (typeof nodo === 'string') return nodo;
  return (nodo.children ?? []).map(textoDe).join('');
}

/** ¿hay un ícono mediano (el de la flecha) en este nodo o debajo? */
function tieneFlecha(nodo: Nodo | string): boolean {
  if (typeof nodo === 'string') return false;
  const estilo = StyleSheet.flatten(nodo.props?.style as never) as
    { height?: number; width?: number } | undefined;
  if (
    estilo?.height === tamanosIcono.mediano &&
    estilo.width === tamanosIcono.mediano
  ) {
    return true;
  }
  return (nodo.children ?? []).some(tieneFlecha);
}

/** el nodo más chico que contiene el texto, subiendo hasta el botón que lo envuelve */
function botonCon(raiz: Nodo | null, texto: string): Nodo | undefined {
  if (!raiz) return undefined;
  const hijos = raiz.children ?? [];
  for (const hijo of hijos) {
    if (typeof hijo === 'string') continue;
    const dentro = botonCon(hijo, texto);
    if (dentro) return dentro;
  }
  return textoDe(raiz).includes(texto) &&
    (raiz.props as { accessibilityRole?: string } | undefined)
      ?.accessibilityRole === 'button'
    ? raiz
    : undefined;
}

describe('Ajustes', () => {
  it('la fila de entrar como conductor lleva la flecha de las filas que abren otra pantalla', async () => {
    const pantalla = await renderPantalla(
      <ProveedorSesion>
        <Ajustes alVolver={() => undefined} />
      </ProveedorSesion>,
    );
    const fila = botonCon(pantalla.toJSON() as Nodo, 'Soy conductor');
    expect(fila).toBeDefined();
    expect(tieneFlecha(fila!)).toBe(true);
    expect(
      pantalla.queryByRole('button', { name: 'Cerrar sesión' }),
    ).toBeNull();
  });

  it('ofrece entrar como conductor a quien no tiene sesión', async () => {
    const alAbrirIngreso = jest.fn();
    const pantalla = await renderPantalla(
      <ProveedorSesion>
        <Ajustes alAbrirIngreso={alAbrirIngreso} alVolver={() => undefined} />
      </ProveedorSesion>,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: /Soy conductor/ }),
    );
    expect(alAbrirIngreso).toHaveBeenCalledTimes(1);
    expect(pantalla.queryByText('Cerrar sesión')).toBeNull();
  });

  it('con sesión de conductor abre su modo y deja cerrar la sesión', async () => {
    await AsyncStorage.setItem(
      'anden.sesion',
      JSON.stringify({
        choferId: 'cho_1',
        nombre: 'Ernesto Calero',
        rol: 'conductor',
      }),
    );
    const alAbrirConductor = jest.fn();
    const pantalla = await renderPantalla(
      <ProveedorSesion>
        <Ajustes
          alAbrirConductor={alAbrirConductor}
          alVolver={() => undefined}
        />
      </ProveedorSesion>,
    );
    expect(
      await pantalla.findByText('Sesión de conductor: Ernesto Calero'),
    ).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: /Abrir modo conductor/ }),
    );
    expect(alAbrirConductor).toHaveBeenCalledTimes(1);

    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Cerrar sesión' }),
    );
    await waitFor(async () =>
      expect(await AsyncStorage.getItem('anden.sesion')).toBeNull(),
    );
    expect(await pantalla.findByText(/Soy conductor/)).toBeTruthy();
  });

  it('cambia al modo sencillo y lo guarda', async () => {
    const pantalla = await renderPantalla(
      <ProveedorModoUso>
        <Ajustes alVolver={() => undefined} />
      </ProveedorModoUso>,
    );
    expect(
      pantalla.getByRole('radio', { name: 'Completo' }).props
        .accessibilityState,
    ).toMatchObject({ checked: true });
    await fireEvent.press(pantalla.getByRole('radio', { name: 'Sencillo' }));
    await waitFor(async () =>
      expect(await AsyncStorage.getItem(CLAVE_MODO_USO)).toBe('sencillo'),
    );
    expect(
      pantalla.getByRole('radio', { name: 'Sencillo' }).props
        .accessibilityState,
    ).toMatchObject({ checked: true });
  });

  it('muestra las tres opciones con el claro elegido por defecto', async () => {
    const pantalla = await renderPantalla(
      <ProveedorTema>
        <Ajustes alVolver={() => undefined} />
      </ProveedorTema>,
    );
    for (const nombre of ['Claro', 'Oscuro', 'Automático']) {
      expect(pantalla.getByRole('radio', { name: nombre })).toBeTruthy();
    }
    expect(
      pantalla.getByRole('radio', { name: 'Claro' }).props.accessibilityState,
    ).toEqual({ checked: true });
  });

  it('cambia a oscuro y lo guarda', async () => {
    const pantalla = await renderPantalla(
      <ProveedorTema>
        <Ajustes alVolver={() => undefined} />
      </ProveedorTema>,
    );
    await fireEvent.press(pantalla.getByRole('radio', { name: 'Oscuro' }));
    await waitFor(async () =>
      expect(await AsyncStorage.getItem(CLAVE_PREFERENCIA_TEMA)).toBe('oscuro'),
    );
    expect(
      pantalla.getByRole('radio', { name: 'Oscuro' }).props.accessibilityState,
    ).toEqual({ checked: true });
  });

  it('vuelve al presionar la flecha', async () => {
    const alVolver = jest.fn();
    const pantalla = await renderPantalla(<Ajustes alVolver={alVolver} />);
    await fireEvent.press(pantalla.getByRole('button', { name: 'Volver' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });

  it('invita a completar el perfil y lo abre', async () => {
    const alAbrirPerfil = jest.fn();
    const pantalla = await renderPantalla(
      <ProveedorTema>
        <Ajustes alAbrirPerfil={alAbrirPerfil} alVolver={() => undefined} />
      </ProveedorTema>,
    );
    expect(pantalla.getByText('Completá tu perfil')).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Tu perfil y tus pasajeros' }),
    );
    expect(alAbrirPerfil).toHaveBeenCalledTimes(1);
  });

  it('activa ubicación automática desde un interruptor persistente', async () => {
    const pantalla = await renderPantalla(
      <ProveedorUbicacion>
        <Ajustes alVolver={() => undefined} />
      </ProveedorUbicacion>,
    );
    const interruptor = await pantalla.findByRole('switch', {
      name: 'Ubicación automática',
    });
    await waitFor(() =>
      expect(interruptor.props.accessibilityState).toEqual({
        checked: false,
        disabled: false,
      }),
    );

    await fireEvent.press(interruptor);

    await waitFor(() =>
      expect(interruptor.props.accessibilityState).toEqual({
        checked: true,
        disabled: false,
      }),
    );
    expect(
      pantalla.getByText('Lista para encontrar tu terminal.'),
    ).toBeTruthy();
    expect(await AsyncStorage.getItem(CLAVE_UBICACION_AUTOMATICA)).toBe('1');
  });

  it('deja reintentar un fallo desde configuración', async () => {
    jest
      .mocked(solicitarAccesoUbicacion)
      .mockResolvedValueOnce({ estado: 'error' })
      .mockResolvedValueOnce({ estado: 'otorgado' });
    const pantalla = await renderPantalla(
      <ProveedorUbicacion>
        <Ajustes alVolver={() => undefined} />
      </ProveedorUbicacion>,
    );
    const interruptor = await pantalla.findByRole('switch', {
      name: 'Ubicación automática',
    });
    await waitFor(() =>
      expect(interruptor.props.accessibilityState?.disabled).toBe(false),
    );
    await fireEvent.press(interruptor);
    const reintentar = await pantalla.findByRole('button', {
      name: 'Reintentar',
    });

    await fireEvent.press(reintentar);

    await waitFor(() =>
      expect(
        pantalla.getByText('Lista para encontrar tu terminal.'),
      ).toBeTruthy(),
    );
    expect(solicitarAccesoUbicacion).toHaveBeenCalledTimes(2);
  });
});
