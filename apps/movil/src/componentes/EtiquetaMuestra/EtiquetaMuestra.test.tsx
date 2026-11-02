import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { EtiquetaMuestra } from './EtiquetaMuestra';

describe('EtiquetaMuestra', () => {
  it('avisa que las tarifas son de muestra', async () => {
    const pantalla = await render(<EtiquetaMuestra />);
    expect(pantalla.getByText('Tarifas de muestra')).toBeTruthy();
  });
});
