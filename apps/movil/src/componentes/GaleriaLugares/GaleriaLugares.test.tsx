import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { lugaresDeCiudad } from '@/datos/lugaresTuristicos';
import { t } from '@/textos/t';

import { GaleriaLugares } from './GaleriaLugares';

describe('GaleriaLugares', () => {
  it('sin lugares no dibuja nada', async () => {
    const pantalla = await render(<GaleriaLugares lugares={[]} />);
    expect(pantalla.toJSON()).toBeNull();
  });
});
