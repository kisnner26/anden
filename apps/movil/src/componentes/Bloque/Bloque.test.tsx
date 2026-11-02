import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Bloque } from './Bloque';

describe('Bloque', () => {
  it('muestra su contenido con relieve', async () => {
    const pantalla = await render(
      <Bloque testID="bloque">
        <Text>Granada</Text>
      </Bloque>,
    );
    expect(pantalla.getByText('Granada')).toBeTruthy();
    expect(pantalla.getByTestId('bloque')).toBeTruthy();
  });

  it('muestra su contenido cuando está hundido', async () => {
    const pantalla = await render(
      <Bloque hundido>
        <Text>Libre</Text>
      </Bloque>,
    );
    expect(pantalla.getByText('Libre')).toBeTruthy();
  });
});
