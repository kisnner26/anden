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

  it('redondea la distancia a kilómetros enteros', async () => {
    const pantalla = await render(
      <TrayectoCorredor
        destino="Boaco"
        distanciaKm={79.6}
        duracionMin={95}
        origen="Managua"
        recorrido="a"
      />,
    );
    expect(pantalla.getByText('80')).toBeTruthy();
  });

  it('muestra una raya cuando no se conoce la distancia ni la duración', async () => {
    const pantalla = await render(
      <TrayectoCorredor
        destino="Boaco"
        distanciaKm={null}
        duracionMin={null}
        origen="Managua"
        recorrido="a"
      />,
    );
    expect(pantalla.getAllByText('—')).toHaveLength(2);
  });
});
