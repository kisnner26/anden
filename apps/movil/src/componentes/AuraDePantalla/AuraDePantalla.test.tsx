import { describe, expect, it } from '@jest/globals';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { AuraDePantalla } from './AuraDePantalla';
import { SurgeDelOrbe } from './SurgeDelOrbe';

describe('AuraDePantalla', () => {
  it('rodea la pantalla sin estorbar los toques ni los lectores de pantalla', async () => {
    const p = await renderPantalla(<AuraDePantalla activa />);
    const aura = p.getByTestId('aura-de-pantalla', {
      includeHiddenElements: true,
    });
    expect(aura.props.pointerEvents).toBe('none');
    expect(aura.props.accessibilityElementsHidden).toBe(true);
  });

  it('se puede encender y apagar sin romperse', async () => {
    const p = await renderPantalla(<AuraDePantalla activa />);
    p.rerender(<AuraDePantalla activa={false} />);
    expect(
      p.getByTestId('aura-de-pantalla', { includeHiddenElements: true }),
    ).toBeTruthy();
  });
});

describe('SurgeDelOrbe', () => {
  it('muestra la respuesta que envuelve', async () => {
    const p = await renderPantalla(
      <SurgeDelOrbe>
        <Text>la respuesta</Text>
      </SurgeDelOrbe>,
    );
    expect(p.getByText('la respuesta')).toBeTruthy();
  });
});
