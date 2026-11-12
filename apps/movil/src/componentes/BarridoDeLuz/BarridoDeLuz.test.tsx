import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { BarridoDeLuz } from './BarridoDeLuz';

describe('BarridoDeLuz', () => {
  it('dibuja la franja sin tapar los toques', async () => {
    const pantalla = await render(<BarridoDeLuz radio={20} />);
    expect(pantalla.getByTestId('barrido-de-luz').props.pointerEvents).toBe(
      'none',
    );
  });
});
