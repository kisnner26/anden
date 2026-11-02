import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { t } from '@/textos/t';

import { Etiqueta } from './Etiqueta';

describe('Etiqueta', () => {
  it('renderiza texto en caja', async () => {
    const pantalla = await render(
      <Etiqueta enCaja texto={t('vitrina.etiquetaAnden')} />,
    );
    expect(pantalla.getByText('Andén 4')).toBeTruthy();
  });
});
