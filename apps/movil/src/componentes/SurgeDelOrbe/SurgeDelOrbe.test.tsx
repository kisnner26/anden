import { describe, expect, it } from '@jest/globals';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { SurgeDelOrbe } from './SurgeDelOrbe';

describe('SurgeDelOrbe', () => {
  it('muestra la respuesta que envuelve', async () => {
    const p = await renderPantalla(
      <SurgeDelOrbe>
        <Text>la respuesta</Text>
      </SurgeDelOrbe>,
    );
    expect(p.getByText('la respuesta')).toBeTruthy();
  });
});
