import { describe, expect, it, jest } from '@jest/globals';
import { Animated, Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';
import { ajustesDeModo } from '@/tema/modoUso';
import { ContextoModoUso } from '@/tema/useModoUso';

import { Campaneo } from './Campaneo';

describe('Campaneo', () => {
  it('muestra a sus hijos activo o quieto', async () => {
    const pantalla = await renderPantalla(
      <Campaneo activo>
        <Text>campana</Text>
      </Campaneo>,
    );
    expect(pantalla.getByText('campana')).toBeTruthy();
    await pantalla.rerender(
      <Campaneo activo={false}>
        <Text>campana</Text>
      </Campaneo>,
    );
    expect(pantalla.getByText('campana')).toBeTruthy();
  });

  it('activo se balancea en el modo completo', async () => {
    const bucle = jest.spyOn(Animated, 'loop');
    await renderPantalla(
      <Campaneo activo>
        <Text>campana</Text>
      </Campaneo>,
    );
    expect(bucle).toHaveBeenCalled();
    bucle.mockRestore();
  });

  it('activo no se balancea en el modo rápido', async () => {
    const bucle = jest.spyOn(Animated, 'loop');
    await renderPantalla(
      <ContextoModoUso.Provider
        value={{
          ajustes: ajustesDeModo('rapido'),
          establecerModo: async () => undefined,
          modo: 'rapido',
        }}
      >
        <Campaneo activo>
          <Text>campana</Text>
        </Campaneo>
      </ContextoModoUso.Provider>,
    );
    expect(bucle).not.toHaveBeenCalled();
    bucle.mockRestore();
  });
});
