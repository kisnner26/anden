import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';
import { Animated, Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';
import { ajustesDeModo } from '@/tema/modoUso';
import { ContextoModoUso } from '@/tema/useModoUso';

import { Rebote } from './Rebote';

describe('Rebote', () => {
  it('muestra a sus hijos activo o no', async () => {
    const pantalla = await renderPantalla(
      <Rebote activo>
        <Text>asiento</Text>
      </Rebote>,
    );
    expect(pantalla.getByText('asiento')).toBeTruthy();
    await pantalla.rerender(
      <Rebote activo={false}>
        <Text>asiento</Text>
      </Rebote>,
    );
    expect(pantalla.getByText('asiento')).toBeTruthy();
  });

  it('al activarse salta en el modo completo', async () => {
    const secuencia = jest.spyOn(Animated, 'sequence');
    const pantalla = await render(
      <Rebote activo={false}>
        <Text>asiento</Text>
      </Rebote>,
    );
    await pantalla.rerender(
      <Rebote activo>
        <Text>asiento</Text>
      </Rebote>,
    );
    expect(secuencia).toHaveBeenCalled();
    secuencia.mockRestore();
  });

  it('al activarse no salta en el modo rápido', async () => {
    const secuencia = jest.spyOn(Animated, 'sequence');
    const envolver = (activo: boolean) => (
      <ContextoModoUso.Provider
        value={{
          ajustes: ajustesDeModo('rapido'),
          establecerModo: async () => undefined,
          modo: 'rapido',
        }}
      >
        <Rebote activo={activo}>
          <Text>asiento</Text>
        </Rebote>
      </ContextoModoUso.Provider>
    );
    const pantalla = await render(envolver(false));
    await pantalla.rerender(envolver(true));
    expect(secuencia).not.toHaveBeenCalled();
    secuencia.mockRestore();
  });
});
