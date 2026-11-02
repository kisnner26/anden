import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { tamanosIcono } from '@/tema/espacios';
import { t } from '@/textos/t';

import { Icono, NOMBRES_ICONO, type TamanoIcono } from './Icono';

describe('Icono', () => {
  it('expone una etiqueta cuando comunica significado', async () => {
    const pantalla = await render(
      <Icono etiquetaAccesible={t('vitrina.iconoBoleto')} nombre="boleto" />,
    );
    expect(pantalla.getByLabelText('Boleto')).toBeTruthy();
  });

  it.each(NOMBRES_ICONO)(
    'dibuja el ícono %s con su etiqueta',
    async (nombre) => {
      const pantalla = await render(
        <Icono etiquetaAccesible={nombre} nombre={nombre} />,
      );
      expect(pantalla.getByLabelText(nombre)).toBeTruthy();
    },
  );

  it('oculta a los lectores de pantalla el ícono sin etiqueta', async () => {
    const pantalla = await render(<Icono nombre="campana" />);
    expect(pantalla.queryByRole('image')).toBeNull();
  });
});
