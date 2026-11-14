import { describe, expect, it } from '@jest/globals';

import { ContextoConexion, type ValorConexion } from '@/datos/useConexion';
import { renderPantalla } from '@/pruebas/render';

import { AvisoConexion } from './AvisoConexion';

function dibujar(valor: ValorConexion) {
  return renderPantalla(
    <ContextoConexion.Provider value={valor}>
      <AvisoConexion />
    </ContextoConexion.Provider>,
  );
}

describe('AvisoConexion', () => {
  it('con internet no muestra nada', async () => {
    const p = await dibujar({
      enLinea: true,
      recienVuelta: false,
      ultimaSincronizacion: null,
    });
    expect(p.queryByRole('alert')).toBeNull();
  });

  it('sin señal dice que usa lo guardado y de hace cuánto son los datos', async () => {
    const p = await dibujar({
      enLinea: false,
      recienVuelta: false,
      ultimaSincronizacion: new Date(Date.now() - 5 * 60_000),
    });
    expect(p.getByRole('alert')).toBeTruthy();
    expect(p.getByText('Sin conexión · datos de hace 5 min')).toBeTruthy();
  });

  it('sin señal y sin ninguna sincronización lo dice sin la hora', async () => {
    const p = await dibujar({
      enLinea: false,
      recienVuelta: false,
      ultimaSincronizacion: null,
    });
    expect(p.getByText('Sin conexión: usando lo guardado')).toBeTruthy();
  });

  it('al volver la señal avisa un momento que está de vuelta', async () => {
    const p = await dibujar({
      enLinea: true,
      recienVuelta: true,
      ultimaSincronizacion: new Date(),
    });
    expect(p.getByText('De vuelta en línea')).toBeTruthy();
  });
});
