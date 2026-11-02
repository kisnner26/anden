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

    expect(chip.props.accessibilityState).toEqual(expect.objectContaining({
      selected: false,
    }));
    expect(impactAsync).toHaveBeenCalledWith(ImpactFeedbackStyle.Light);
    expect(alCambiar).toHaveBeenCalledWith(true);
    expect(pantalla.queryByTestId('chip-seleccionado-indicador')).toBeNull();
  });
});
