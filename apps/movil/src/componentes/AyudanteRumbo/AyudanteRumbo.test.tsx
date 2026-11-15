import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent } from '@testing-library/react-native';

let mockRuta = '/viajar';
jest.mock('expo-router', () => ({ usePathname: () => mockRuta }));

import { emitirSenal } from '@/datos/senalesDeAyuda';
import { ContextoIA, type ValorIA } from '@/datos/useIA';
import { ContextoMascota, type ValorMascota } from '@/datos/useMascota';
import { ContextoSuscripcion } from '@/datos/useSuscripcion';
import { ESTADO_GRATIS } from '@/servicios/suscripcion';
import { renderPantalla } from '@/pruebas/render';

import { AyudanteRumbo } from './AyudanteRumbo';

function dibujar(activa = true, ia?: Partial<ValorIA>, plus = false) {
  const valor: ValorMascota = {
    activa,
    cambiar: async () => undefined,
    marcar: () => undefined,
    vistos: {},
  };
  return renderPantalla(
    <ContextoSuscripcion.Provider
      value={{
        activar: async () => undefined,
        cancelar: async () => undefined,
        estado: ESTADO_GRATIS,
        plus,
      }}
    >
      <ContextoIA.Provider
        value={
          {
            activada: true,
            cambiar: async () => undefined,
            cargando: false,
            disponibilidad: 'disponible',
            nombre: 'Apple Intelligence',
            preguntar: async () => '',
            usable: false,
            ...ia,
          } as ValorIA
        }
      >
        <ContextoMascota.Provider value={valor}>
          <AyudanteRumbo />
        </ContextoMascota.Provider>
      </ContextoIA.Provider>
    </ContextoSuscripcion.Provider>,
  );
}

beforeEach(() => {
  mockRuta = '/viajar';
});

describe('AyudanteRumbo', () => {
  it('no se ve para nada mientras todo va bien', async () => {
    const p = await dibujar();
    expect(p.queryByTestId('ayudante-rumbo')).toBeNull();
    expect(
      p.queryByRole('button', { name: 'Rumbo quiere ayudarte' }),
    ).toBeNull();
  });

  it('una señal suelta de poco peso no lo asoma', async () => {
    const p = await dibujar();
    await act(async () => {
      emitirSenal('errorFormulario');
    });
    expect(
      p.queryByRole('button', { name: 'Rumbo quiere ayudarte' }),
    ).toBeNull();
  });

  it('con varios errores seguidos asoma los ojos', async () => {
    const p = await dibujar();
    await act(async () => {
      emitirSenal('errorFormulario');
      emitirSenal('errorIngreso');
    });
    expect(
      await p.findByRole('button', { name: 'Rumbo quiere ayudarte' }),
    ).toBeTruthy();
  });

  it('al tocar los ojos se transforma y da la ayuda del problema', async () => {
    const p = await dibujar();
    await act(async () => {
      emitirSenal('reservaFallida');
      emitirSenal('errorFormulario');
    });
    await fireEvent.press(
      await p.findByRole('button', { name: 'Rumbo quiere ayudarte' }),
    );
    expect(
      await p.findByLabelText(/Ese asiento se ocupó justo antes/),
    ).toBeTruthy();
  });

  it('apagado en los ajustes nunca aparece', async () => {
    const p = await dibujar(false);
    await act(async () => {
      emitirSenal('toquesRepetidos');
    });
    expect(p.queryByTestId('ayudante-rumbo')).toBeNull();
  });

  it('en la portada de inicio no sale', async () => {
    mockRuta = '/';
    const p = await dibujar();
    await act(async () => {
      emitirSenal('toquesRepetidos');
    });
    expect(p.queryByTestId('ayudante-rumbo')).toBeNull();
  });

  async function asomarYTocar(p: Awaited<ReturnType<typeof dibujar>>) {
    await act(async () => {
      emitirSenal('reservaFallida');
      emitirSenal('errorFormulario');
    });
    await fireEvent.press(
      await p.findByRole('button', { name: 'Rumbo quiere ayudarte' }),
    );
  }

  it('con IA y Plus dice la ayuda que armó el modelo', async () => {
    const preguntar = jest.fn(
      async () =>
        'Elegí otro de los asientos libres y volvé a reservar antes de que salga el bus.',
    );
    const p = await dibujar(true, { preguntar, usable: true }, true);
    await asomarYTocar(p);
    expect(
      await p.findByLabelText(/Elegí otro de los asientos libres/),
    ).toBeTruthy();
    expect(preguntar).toHaveBeenCalledTimes(1);
  });

  it('si el modelo contesta algo tonto, se queda con la ayuda escrita', async () => {
    const preguntar = jest.fn(
      async () =>
        "Tranquilo, sos Rumbo, que aquí estoy pa' ayudar, pero nada responde.",
    );
    const p = await dibujar(true, { preguntar, usable: true }, true);
    await asomarYTocar(p);
    expect(
      await p.findByLabelText(/Ese asiento se ocupó justo antes/),
    ).toBeTruthy();
  });

  it('sin Plus no usa la IA y da la ayuda escrita', async () => {
    const preguntar = jest.fn(async () => 'No debería llamarse nunca a la IA.');
    const p = await dibujar(true, { preguntar, usable: true }, false);
    await asomarYTocar(p);
    expect(
      await p.findByLabelText(/Ese asiento se ocupó justo antes/),
    ).toBeTruthy();
    expect(preguntar).not.toHaveBeenCalled();
  });
});
