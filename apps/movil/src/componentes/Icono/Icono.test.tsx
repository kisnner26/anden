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

  it('anuncia como imagen el ícono con etiqueta', async () => {
    const pantalla = await render(
      <Icono etiquetaAccesible={t('vitrina.iconoLupa')} nombre="lupa" />,
    );
    expect(pantalla.getByRole('image', { name: 'Buscar' })).toBeTruthy();
  });

  it('usa el tamaño destacado por defecto', async () => {
    const pantalla = await render(
      <Icono etiquetaAccesible="reloj" nombre="reloj" />,
    );
    const medida = tamanosIcono.destacado;
    expect(pantalla.getByLabelText('reloj').props.style).toEqual({
      height: medida,
      width: medida,
    });
  });

  it.each(Object.keys(tamanosIcono) as TamanoIcono[])(
    'respeta la medida %s de la escala',
    async (tamano) => {
      const pantalla = await render(
        <Icono etiquetaAccesible="reloj" nombre="reloj" tamano={tamano} />,
      );
      const medida = tamanosIcono[tamano];
      expect(pantalla.getByLabelText('reloj').props.style).toEqual({
        height: medida,
        width: medida,
      });
    },
  );
});
