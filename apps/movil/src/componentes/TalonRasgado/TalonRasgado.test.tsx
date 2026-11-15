import { describe, expect, it } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { TalonRasgado } from './TalonRasgado';

function dibujar(rasgado: boolean) {
  return renderPantalla(
    <TalonRasgado rasgado={rasgado}>
      <Text>Boleto a Boaco</Text>
    </TalonRasgado>,
  );
}

describe('TalonRasgado', () => {
  it('un boleto sin usar se ve entero, sin rotura', async () => {
    const p = await dibujar(false);
    expect(p.getByText('Boleto a Boaco')).toBeTruthy();
    expect(p.queryByTestId('talon-rasgado')).toBeNull();
  });

  it('un boleto usado se parte en dos mitades, y el lector lee una sola copia', async () => {
    const p = await dibujar(true);
    await fireEvent(p.getByTestId('talon-rasgado'), 'layout', {
      nativeEvent: { layout: { height: 200, width: 300, x: 0, y: 0 } },
    });
    expect(p.getAllByText('Boleto a Boaco')).toHaveLength(1);
    expect(
      p.getAllByText('Boleto a Boaco', { includeHiddenElements: true }),
    ).toHaveLength(3);
  });
});
