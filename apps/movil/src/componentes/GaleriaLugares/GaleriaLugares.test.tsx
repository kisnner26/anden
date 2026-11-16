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

  it('muestra la ciudad y el nombre de cada lugar', async () => {
    const lugares = lugaresDeCiudad('Boaco');
    expect(lugares.length).toBeGreaterThan(0);
    const pantalla = await render(<GaleriaLugares lugares={lugares} />);
    expect(pantalla.getAllByText('Boaco').length).toBe(lugares.length);
    expect(pantalla.getByText(lugares[0]!.titulo)).toBeTruthy();
  });
});
