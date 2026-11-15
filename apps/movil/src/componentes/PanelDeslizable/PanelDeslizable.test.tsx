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

  it('el contenido se puede desplazar en cualquier posición, para que nada quede oculto', async () => {
    const p = await renderPantalla(
      <PanelDeslizable alturas={[200, 400, 700]} cabecera={<Text>Hola</Text>}>
        <Text>Contenido</Text>
      </PanelDeslizable>,
    );
    expect(p.getByTestId('panel-contenido').props.scrollEnabled).toBe(true);
  });

  it('con la cabecera desplazable, esta se mueve junto con el contenido', async () => {
    const p = await renderPantalla(
      <PanelDeslizable
        alturas={[200, 400, 700]}
        cabecera={<Text>Todavía no compartís</Text>}
        cabeceraDesplazable
      >
        <Text>Contenido</Text>
      </PanelDeslizable>,
    );
    const contenido = p.getByTestId('panel-contenido');
    expect(contenido).toContainElement(p.getByText('Todavía no compartís'));
  });
});
