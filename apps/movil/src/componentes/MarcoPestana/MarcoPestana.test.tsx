import { describe, expect, it } from '@jest/globals';
import { StyleSheet, type StyleProp, Text, type ViewStyle } from 'react-native';

import { MEDIDAS_IPHONE_PRUEBA, renderPantalla } from '@/pruebas/render';
import { disposicionPantalla, espacios } from '@/tema/espacios';

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

function contieneRellenoSeguro(nodo: unknown): boolean {
  if (nodo === null || typeof nodo !== 'object') return false;
  const elemento = nodo as {
    children?: unknown[];
    props?: { style?: StyleProp<ViewStyle> };
  };
  const estilo = StyleSheet.flatten(elemento.props?.style);
  if (
    estilo?.paddingBottom ===
      disposicionPantalla.espacioFinalPestana +
        MEDIDAS_IPHONE_PRUEBA.insets.bottom &&
    estilo.paddingHorizontal === espacios.lateral &&
    estilo.paddingTop ===
      disposicionPantalla.rellenoSuperior + MEDIDAS_IPHONE_PRUEBA.insets.top
  ) {
    return true;
  }
  return elemento.children?.some(contieneRellenoSeguro) ?? false;
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
    expect(contieneRellenoSeguro(pantalla.toJSON())).toBe(true);
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
