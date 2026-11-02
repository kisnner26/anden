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
});
