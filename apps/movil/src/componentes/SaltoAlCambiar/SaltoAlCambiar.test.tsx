import { describe, expect, it } from '@jest/globals';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { SaltoAlCambiar } from './SaltoAlCambiar';

describe('SaltoAlCambiar', () => {
  it('muestra su contenido y lo mantiene al cambiar el valor', async () => {
    const p = await renderPantalla(
      <SaltoAlCambiar valor={70}>
        <Text>C$ 70</Text>
      </SaltoAlCambiar>,
    );
    expect(p.getByText('C$ 70')).toBeTruthy();
    p.rerender(
      <SaltoAlCambiar valor={140}>
        <Text>C$ 140</Text>
      </SaltoAlCambiar>,
    );
    expect(await p.findByText('C$ 140')).toBeTruthy();
  });
});
