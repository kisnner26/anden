import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { t } from '@/textos/t';

import { Icono } from './Icono';

describe('Icono', () => {
  it('expone una etiqueta cuando comunica significado', async () => {
    const pantalla = await render(
      <Icono etiquetaAccesible={t('vitrina.iconoBoleto')} nombre="boleto" />,
    );
    expect(pantalla.getByLabelText('Boleto')).toBeTruthy();
  });
});
