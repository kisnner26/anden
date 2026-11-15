import { describe, expect, it, jest } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

jest.mock('expo-status-bar', () => ({
  StatusBar: (props: { style: string }) => {
    const { Text } =
      jest.requireActual<typeof import('react-native')>('react-native');
    return <Text testID="barra">{props.style}</Text>;
  },
}));

import { BarraDeEstado } from './BarraDeEstado';

describe('BarraDeEstado', () => {
  it('con el tema claro usa letras oscuras', async () => {
    const p = await renderPantalla(<BarraDeEstado />);
    expect(p.getByTestId('barra').props.children).toBe('dark');
  });
});
