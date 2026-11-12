import { describe, expect, it } from '@jest/globals';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { Campaneo } from './Campaneo';

describe('Campaneo', () => {
  it('muestra a sus hijos activo o quieto', async () => {
    const pantalla = await renderPantalla(
      <Campaneo activo>
        <Text>campana</Text>
      </Campaneo>,
    );
    expect(pantalla.getByText('campana')).toBeTruthy();
    await pantalla.rerender(
      <Campaneo activo={false}>
        <Text>campana</Text>
      </Campaneo>,
    );
    expect(pantalla.getByText('campana')).toBeTruthy();
  });
});
