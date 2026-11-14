import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { ContextoIA, type ValorIA } from '@/datos/useIA';
import { renderPantalla } from '@/pruebas/render';

import { BarraPreguntaIA } from './BarraPreguntaIA';

const IA: ValorIA = {
  activada: true,
  cambiar: async () => undefined,
  cargando: false,
  disponibilidad: 'disponible',
  nombre: 'Apple Intelligence',
  preguntar: async () => '',
  usable: true,
};

function dibujar(alPreguntar = jest.fn(), ia: ValorIA = IA) {
  return renderPantalla(
    <ContextoIA.Provider value={ia}>
      <BarraPreguntaIA
        alPreguntar={alPreguntar}
        sugerencias={['¿Cuál me conviene?', '¿Hay expreso?']}
      />
    </ContextoIA.Provider>,
  );
}

describe('BarraPreguntaIA', () => {
  it('envía lo escrito y limpia el campo', async () => {
    const alPreguntar = jest.fn();
    const p = await dibujar(alPreguntar);
    await fireEvent.changeText(
      p.getByLabelText('Tu pregunta al asistente'),
      '  el más barato a Boaco ',
    );
    await fireEvent.press(
      p.getByRole('button', { name: 'Preguntar al asistente' }),
    );
    expect(alPreguntar).toHaveBeenCalledWith('el más barato a Boaco');
    expect(p.getByLabelText('Tu pregunta al asistente').props.value).toBe('');
  });

  it('tocar una pregunta sugerida la envía directo', async () => {
    const alPreguntar = jest.fn();
    const p = await dibujar(alPreguntar);
    await fireEvent.press(
      p.getByRole('button', { name: '¿Cuál me conviene?' }),
    );
    expect(alPreguntar).toHaveBeenCalledWith('¿Cuál me conviene?');
  });

  it('sin texto no se puede enviar', async () => {
    const alPreguntar = jest.fn();
    const p = await dibujar(alPreguntar);
    await fireEvent.press(
      p.getByRole('button', { name: 'Preguntar al asistente' }),
    );
    expect(alPreguntar).not.toHaveBeenCalled();
  });

  it('con la IA no disponible no dibuja nada', async () => {
    const p = await dibujar(jest.fn(), { ...IA, usable: false });
    expect(p.queryByTestId('barra-pregunta-ia')).toBeNull();
  });
});
