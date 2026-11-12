import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { Animated } from 'react-native';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

import { ajustesDeModo } from '@/tema/modoUso';
import { ContextoModoUso } from '@/tema/useModoUso';
import { t } from '@/textos/t';

import { Boton } from './Boton';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('Boton', () => {
  it('ejecuta la accion principal con respuesta haptica', async () => {
    const alPresionar = jest.fn();
    const etiqueta = t('vitrina.botonPrincipal');
    const pantalla = await render(
      <Boton alPresionar={alPresionar} etiqueta={etiqueta} />,
    );

    fireEvent.press(pantalla.getByRole('button', { name: etiqueta }));

    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Light);
    expect(alPresionar).toHaveBeenCalledTimes(1);
    expect(pantalla.getByTestId('boton-principal-fondo')).toBeOnTheScreen();
    expect(pantalla.getByTestId('boton-principal-flecha')).toBeOnTheScreen();
  });

  it('renderiza la variante secundaria sin indicador de avance', async () => {
    const etiqueta = t('vitrina.botonSecundario');
    const pantalla = await render(
      <Boton
        alPresionar={jest.fn()}
        etiqueta={etiqueta}
        variante="secundario"
      />,
    );

    expect(pantalla.getByRole('button', { name: etiqueta })).toBeOnTheScreen();
    expect(pantalla.getByTestId('boton-secundario-fondo')).toBeOnTheScreen();
    expect(pantalla.queryByTestId('boton-pildora-flecha')).toBeNull();
  });

  it('renderiza la variante pildora con indicador de avance', async () => {
    const etiqueta = t('vitrina.botonPildora');
    const pantalla = await render(
      <Boton alPresionar={jest.fn()} etiqueta={etiqueta} variante="pildora" />,
    );

    expect(pantalla.getByRole('button', { name: etiqueta })).toBeOnTheScreen();
    expect(pantalla.getByTestId('boton-pildora-flecha')).toBeOnTheScreen();
  });

  it('expone el progreso y bloquea la accion mientras carga', async () => {
    const alPresionar = jest.fn();
    const etiqueta = t('vitrina.botonCargando');
    const pantalla = await render(
      <Boton alPresionar={alPresionar} cargando etiqueta={etiqueta} />,
    );
    const boton = pantalla.getByRole('button', { name: etiqueta });

    fireEvent.press(boton);

    expect(boton.props.accessibilityState).toEqual(
      expect.objectContaining({
        busy: true,
        disabled: true,
      }),
    );
    expect(pantalla.getByTestId('boton-cargando-barra')).toBeOnTheScreen();
    expect(pantalla.queryByTestId('boton-principal-flecha')).toBeNull();
    expect(alPresionar).not.toHaveBeenCalled();
  });

  it('expone y respeta el estado deshabilitado', async () => {
    const alPresionar = jest.fn();
    const etiqueta = t('vitrina.botonSecundario');
    const pantalla = await render(
      <Boton alPresionar={alPresionar} deshabilitado etiqueta={etiqueta} />,
    );
    const boton = pantalla.getByRole('button', { name: etiqueta });

    fireEvent.press(boton);

    expect(boton.props.accessibilityState).toEqual(
      expect.objectContaining({
        busy: false,
        disabled: true,
      }),
    );
    expect(alPresionar).not.toHaveBeenCalled();
  });

  it('al cargar gira el indicador en el modo completo', async () => {
    const bucle = jest.spyOn(Animated, 'loop');
    await render(<Boton alPresionar={jest.fn()} cargando etiqueta="Ir" />);
    expect(bucle).toHaveBeenCalled();
    bucle.mockRestore();
  });

  it('al cargar no anima en el modo rápido', async () => {
    const bucle = jest.spyOn(Animated, 'loop');
    await render(
      <ContextoModoUso.Provider
        value={{
          ajustes: ajustesDeModo('rapido'),
          establecerModo: async () => undefined,
          modo: 'rapido',
        }}
      >
        <Boton alPresionar={jest.fn()} cargando etiqueta="Ir" />
      </ContextoModoUso.Provider>,
    );
    expect(bucle).not.toHaveBeenCalled();
    bucle.mockRestore();
  });
});
