import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { impactAsync, ImpactFeedbackStyle } from 'expo-haptics';

import { t } from '@/textos/t';

import { Chip } from './Chip';

jest.mock('expo-haptics', () => ({
  impactAsync: jest.fn(() => Promise.resolve()),
  ImpactFeedbackStyle: { Light: 'light' },
}));

describe('Chip', () => {
  it('selecciona el filtro con respuesta haptica', async () => {
    const alCambiar = jest.fn();
    const etiqueta = t('vitrina.chipHoy');
    const pantalla = await render(
      <Chip alCambiar={alCambiar} etiqueta={etiqueta} />,
    );
    const chip = pantalla.getByRole('button', { name: etiqueta });

    fireEvent.press(chip);

    expect(chip.props.accessibilityState).toEqual(
      expect.objectContaining({
        selected: false,
      }),
    );
    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Light);
    expect(alCambiar).toHaveBeenCalledWith(true);
    expect(pantalla.getByTestId('chip-fondo-barro')).toBeOnTheScreen();
    expect(pantalla.queryByTestId('chip-seleccionado-indicador')).toBeNull();
  });

  it('expone el filtro seleccionado con una marca visible', async () => {
    const etiqueta = t('vitrina.chipManana');
    const pantalla = await render(
      <Chip alCambiar={jest.fn()} etiqueta={etiqueta} seleccionado />,
    );
    const chip = pantalla.getByRole('button', { name: etiqueta });

    expect(chip.props.accessibilityState).toEqual(
      expect.objectContaining({
        selected: true,
      }),
    );
    expect(
      pantalla.getByTestId('chip-seleccionado-indicador'),
    ).toBeOnTheScreen();
  });
});
