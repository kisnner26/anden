import { describe, expect, it } from '@jest/globals';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { Rebote } from './Rebote';

describe('Rebote', () => {
  it('muestra a sus hijos activo o no', async () => {
    const pantalla = await renderPantalla(
      <Rebote activo>
        <Text>asiento</Text>
      </Rebote>,
    );
    expect(pantalla.getByText('asiento')).toBeTruthy();
    await pantalla.rerender(
      <Rebote activo={false}>
        <Text>asiento</Text>
      </Rebote>,
    );
    expect(pantalla.getByText('asiento')).toBeTruthy();
  });
});
