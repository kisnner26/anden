import { describe, expect, it } from '@jest/globals';
import { StyleSheet, type StyleProp, Text, type ViewStyle } from 'react-native';

import { renderPantalla } from '@/pruebas/render';
import { disposicionPantalla } from '@/tema/espacios';

import { MarcoPestana } from './MarcoPestana';

function contieneAnchoMaximo(nodo: unknown): boolean {
  if (nodo === null || typeof nodo !== 'object') return false;
  const elemento = nodo as {
    children?: unknown[];
    props?: { style?: StyleProp<ViewStyle> };
  };
  if (
    StyleSheet.flatten(elemento.props?.style)?.maxWidth ===
    disposicionPantalla.anchoMaximo
  ) {
    return true;
  }
  return elemento.children?.some(contieneAnchoMaximo) ?? false;
}

describe('MarcoPestana', () => {
  it('reserva las áreas seguras y limita el ancho del contenido', async () => {
    const pantalla = await renderPantalla(
      <MarcoPestana testID="marco-pestana">
        <Text>Contenido</Text>
      </MarcoPestana>,
    );

    expect(pantalla.getByText('Contenido')).toBeTruthy();
    expect(contieneAnchoMaximo(pantalla.toJSON())).toBe(true);
  });

  it('mantiene el teclado al elegir una sugerencia y oculta la barra lateral', async () => {
    const pantalla = await renderPantalla(
      <MarcoPestana testID="marco-pestana">
        <Text>Contenido</Text>
      </MarcoPestana>,
    );
    const marco = pantalla.getByTestId('marco-pestana');

    expect(marco.props.keyboardShouldPersistTaps).toBe('handled');
    expect(marco.props.showsVerticalScrollIndicator).toBe(false);
  });
});
