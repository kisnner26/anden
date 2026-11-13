import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { ContextoIA, type ValorIA } from '@/datos/useIA';
import { renderPantalla } from '@/pruebas/render';

import { Asistente } from './Asistente';

function valor(cambios: Partial<ValorIA> = {}): ValorIA {
  return {
    activada: true,
    cambiar: async () => undefined,
    cargando: false,
    disponibilidad: 'disponible',
    nombre: 'Apple Intelligence',
    preguntar: jest.fn(async () => 'El próximo bus a Boaco sale a las 2:30.'),
    usable: true,
    ...cambios,
  };
}

function abrir(contexto: ValorIA) {
  return renderPantalla(
    <ContextoIA.Provider value={contexto}>
      <Asistente alVolver={() => undefined} />
    </ContextoIA.Provider>,
  );
}

describe('Asistente', () => {
  it('sin la IA usable explica por qué y no deja preguntar', async () => {
    const pantalla = await abrir(
      valor({ disponibilidad: 'no-compatible', usable: false }),
    );
    expect(pantalla.getByText('El asistente no está activado.')).toBeTruthy();
    expect(
      pantalla.getByText(/no es compatible con Apple Intelligence/),
    ).toBeTruthy();
    expect(pantalla.queryByRole('button', { name: 'Preguntar' })).toBeNull();
  });

  it('manda la pregunta con los datos de la app y muestra la respuesta', async () => {
    const contexto = valor();
    const pantalla = await abrir(contexto);
    await fireEvent.changeText(
      pantalla.getByLabelText('Tu pregunta'),
      '¿Cuándo sale el bus a Boaco?',
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    expect(
      await pantalla.findByText('El próximo bus a Boaco sale a las 2:30.'),
    ).toBeTruthy();
    const [instrucciones, pregunta] = (
      contexto.preguntar as jest.Mock<ValorIA['preguntar']>
    ).mock.calls[0] as [string, string];
    expect(pregunta).toBe('¿Cuándo sale el bus a Boaco?');
    expect(instrucciones).toContain('Usá solamente los datos de abajo');
    expect(instrucciones).toContain('Próximas salidas:');
  });

  it('una sugerencia pregunta de inmediato', async () => {
    const contexto = valor();
    const pantalla = await abrir(contexto);
    await fireEvent.press(
      pantalla.getByRole('button', {
        name: '¿Cuál es el próximo bus a Boaco?',
      }),
    );
    await waitFor(() => expect(contexto.preguntar).toHaveBeenCalledTimes(1));
  });

  it('si el modelo falla lo dice y no inventa una respuesta', async () => {
    const pantalla = await abrir(
      valor({
        preguntar: async () => {
          throw new Error('fallo');
        },
      }),
    );
    await fireEvent.changeText(pantalla.getByLabelText('Tu pregunta'), 'hola');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    expect(
      await pantalla.findByText('No pudimos responder. Probá de nuevo.'),
    ).toBeTruthy();
  });

  it('dice que está potenciado por la IA del teléfono', async () => {
    const pantalla = await abrir(valor());
    expect(
      pantalla.getByText('Potenciado por Apple Intelligence'),
    ).toBeTruthy();
  });

  it('muestra la animación de pensar mientras espera la respuesta', async () => {
    let terminar: (texto: string) => void = () => undefined;
    const contexto = valor({
      preguntar: jest.fn(
        () => new Promise<string>((resolver) => (terminar = resolver)),
      ),
    });
    const pantalla = await abrir(contexto);
    await fireEvent.changeText(pantalla.getByLabelText('Tu pregunta'), 'hola');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    expect(
      await pantalla.findByText('Pensando con Apple Intelligence…'),
    ).toBeTruthy();
    terminar('Listo.');
    expect(await pantalla.findByText('Listo.')).toBeTruthy();
    expect(pantalla.queryByText('Pensando con Apple Intelligence…')).toBeNull();
  });

  it('ofrece sugerencias con destinos reales y borra la conversación', async () => {
    const pantalla = await abrir(valor());
    await fireEvent.changeText(pantalla.getByLabelText('Tu pregunta'), 'hola');
    await fireEvent.press(pantalla.getByRole('button', { name: 'Preguntar' }));
    await pantalla.findByText('El próximo bus a Boaco sale a las 2:30.');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Borrar la conversación' }),
    );
    await waitFor(() =>
      expect(
        pantalla.queryByText('El próximo bus a Boaco sale a las 2:30.'),
      ).toBeNull(),
    );
  });
});
