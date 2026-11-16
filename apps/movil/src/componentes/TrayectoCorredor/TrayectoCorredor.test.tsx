import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { TrayectoCorredor } from './TrayectoCorredor';

describe('TrayectoCorredor', () => {
  it('muestra el origen y el destino', async () => {
    const pantalla = await render(
      <TrayectoCorredor
        destino="Boaco"
        distanciaKm={80}
        duracionMin={95}
        origen="Managua"
        recorrido="a"
      />,
    );
    expect(pantalla.getByText('Managua')).toBeTruthy();
    expect(pantalla.getByText('Boaco')).toBeTruthy();
  });
});
