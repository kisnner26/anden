import { describe, expect, it } from '@jest/globals';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { PanelDeslizable } from './PanelDeslizable';

describe('PanelDeslizable', () => {
  it('muestra siempre la cabecera y el contenido', async () => {
    const p = await renderPantalla(
      <PanelDeslizable
        alturas={[200, 400, 700]}
        cabecera={<Text>Estado del viaje</Text>}
      >
        <Text>Pasajeros a bordo</Text>
      </PanelDeslizable>,
    );
    expect(p.getByText('Estado del viaje')).toBeTruthy();
    expect(p.getByText('Pasajeros a bordo')).toBeTruthy();
    expect(p.getByTestId('panel-deslizable')).toBeTruthy();
  });

  it('empieza recogido: el contenido no se desplaza hasta abrirlo del todo', async () => {
    const p = await renderPantalla(
      <PanelDeslizable alturas={[200, 400, 700]} cabecera={<Text>Hola</Text>}>
        <Text>Contenido</Text>
      </PanelDeslizable>,
    );
    expect(p.getByTestId('panel-contenido').props.scrollEnabled).toBe(false);
  });
});
