import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { Text } from 'react-native';

import { t } from '@/textos/t';

import { Tarjeta } from './Tarjeta';

describe('Tarjeta', () => {
  it('agrupa contenido con un nombre accesible', async () => {
    const etiqueta = t('vitrina.tarjetaTitulo');
    const pantalla = await render(
      <Tarjeta etiquetaAccesible={etiqueta}>
        <Text>{etiqueta}</Text>
      </Tarjeta>,
    );
    expect(pantalla.getByLabelText(etiqueta)).toBeTruthy();
  });
});
