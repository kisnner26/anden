import { describe, expect, it } from '@jest/globals';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { Aparece } from './Aparece';

describe('Aparece', () => {
  it('muestra a sus hijos', async () => {
    const pantalla = await renderPantalla(
      <Aparece indice={3}>
        <Text>contenido</Text>
      </Aparece>,
    );
    expect(pantalla.getByText('contenido')).toBeTruthy();
  });
});
