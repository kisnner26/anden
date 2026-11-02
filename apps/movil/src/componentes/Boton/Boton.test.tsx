import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

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
  });

  it('renderiza la variante secundaria sin indicador de avance', async () => {
    const etiqueta = t('vitrina.botonSecundario');
    const pantalla = await render(
      <Boton alPresionar={jest.fn()} etiqueta={etiqueta} variante="secundario" />,
    );

    expect(pantalla.getByRole('button', { name: etiqueta })).toBeOnTheScreen();
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

    expect(boton.props.accessibilityState).toEqual(expect.objectContaining({
      busy: true,
      disabled: true,
    }));
    expect(pantalla.getByTestId('boton-cargando-barra')).toBeOnTheScreen();
    expect(alPresionar).not.toHaveBeenCalled();
  });
});
