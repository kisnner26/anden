import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { BloqueNegro } from './BloqueNegro';

describe('BloqueNegro', () => {
  it('muestra su contenido', async () => {
    const pantalla = await render(
      <BloqueNegro>
        <Text>Salidas</Text>
      </BloqueNegro>,
    );
    expect(pantalla.getByText('Salidas')).toBeTruthy();
  });
});
