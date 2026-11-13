import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { ContextoIA, type ValorIA } from '@/datos/useIA';
import { renderPantalla } from '@/pruebas/render';

import { Chispas } from '../Chispas';
import { EsqueletoIA } from '../EsqueletoIA';
import { TarjetaIA } from '../TarjetaIA';
import { ResumenIA } from './ResumenIA';

function ia(cambios: Partial<ValorIA> = {}): ValorIA {
  return {
    activada: true,
    cambiar: async () => undefined,
    cargando: false,
    disponibilidad: 'disponible',
    nombre: 'Apple Intelligence',
    preguntar: jest.fn(async () => 'Sale a las 2:30 del andén 3.'),
    usable: true,
    ...cambios,
  };
}

function dibujar(valor: ValorIA) {
  return renderPantalla(
    <ContextoIA.Provider value={valor}>
      <ResumenIA contexto="- salida" pedido="Resumí" titulo="Resumir con IA" />
    </ContextoIA.Provider>,
  );
}

describe('ResumenIA', () => {
  it('no aparece si la IA no está usable', async () => {
    const pantalla = await dibujar(ia({ usable: false }));
    expect(pantalla.queryByText('Resumir con IA')).toBeNull();
  });

  it('al tocarlo pide el resumen al modelo con los datos y lo muestra', async () => {
    const valor = ia();
    const pantalla = await dibujar(valor);
    await fireEvent.press(await pantalla.findByText('Resumir con IA'));
    expect(
      await pantalla.findByText('Sale a las 2:30 del andén 3.'),
    ).toBeTruthy();
    const [instrucciones, pedido] = (
      valor.preguntar as jest.Mock<ValorIA['preguntar']>
    ).mock.calls[0] as [string, string];
    expect(instrucciones).toContain('- salida');
    expect(pedido).toBe('Resumí');
  });

  it('si el modelo falla lo dice', async () => {
    const pantalla = await dibujar(
      ia({
        preguntar: async () => {
          throw new Error('x');
        },
      }),
    );
    await fireEvent.press(await pantalla.findByText('Resumir con IA'));
    expect(
      await pantalla.findByText('No pudimos responder. Probá de nuevo.'),
    ).toBeTruthy();
  });
});

describe('efectos visuales de la IA', () => {
  it('se dibujan sin romperse', async () => {
    const pantalla = await renderPantalla(
      <TarjetaIA trabajando>
        <Chispas />
        <EsqueletoIA lineas={2} />
      </TarjetaIA>,
    );
    expect(pantalla.toJSON()).not.toBeNull();
  });
});
