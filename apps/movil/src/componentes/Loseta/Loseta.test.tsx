import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { Loseta, type VarianteLoseta } from './Loseta';

const VARIANTES: VarianteLoseta[] = ['ambar', 'claro', 'negra'];

describe('Loseta', () => {
  it.each(VARIANTES)(
    'muestra su contenido en la variante %s',
    async (variante) => {
      const pantalla = await render(
        <Loseta variante={variante}>
          <Text>UCA</Text>
        </Loseta>,
      );
      expect(pantalla.getByText('UCA')).toBeTruthy();
    },
  );

  it('mide 50 por defecto y respeta un tamaño dado', async () => {
    const pantalla = await render(
      <>
        <Loseta testID="normal" />
        <Loseta tamano={42} testID="chica" />
      </>,
    );
    expect(pantalla.getByTestId('normal').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ height: 50, width: 50 }),
      ]),
    );
    expect(pantalla.getByTestId('chica').props.style).toEqual(
      expect.arrayContaining([
        expect.objectContaining({ height: 42, width: 42 }),
      ]),
    );
  });
});
