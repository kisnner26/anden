import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { Presionable } from './Presionable';

describe('Presionable', () => {
  it('muestra su contenido y avisa al tocarlo', async () => {
    const alTocar = jest.fn();
    const p = await renderPantalla(
      <Presionable accessibilityRole="button" onPress={alTocar}>
        <Text>Tocame</Text>
      </Presionable>,
    );
    expect(p.getByText('Tocame')).toBeTruthy();
    await fireEvent.press(p.getByRole('button'));
    expect(alTocar).toHaveBeenCalledTimes(1);
  });

  it('acepta contenido que se calcula a partir del estado del toque', async () => {
    const p = await renderPantalla(
      <Presionable accessibilityRole="button">
        {({ pressed }) => <Text>{pressed ? 'apretado' : 'suelto'}</Text>}
      </Presionable>,
    );
    expect(p.getByText('suelto')).toBeTruthy();
  });

  it('no deja tocar lo deshabilitado', async () => {
    const alTocar = jest.fn();
    const p = await renderPantalla(
      <Presionable accessibilityRole="button" disabled onPress={alTocar}>
        <Text>Nada</Text>
      </Presionable>,
    );
    await fireEvent.press(p.getByRole('button'));
    expect(alTocar).not.toHaveBeenCalled();
  });
});
