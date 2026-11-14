import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act } from '@testing-library/react-native';
import { Animated } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { CuerpoQueSeTransforma } from './CuerpoQueSeTransforma';

afterEach(() => {
  jest.useRealTimers();
});

function dibujar(abierto: boolean, texto: string | null) {
  return renderPantalla(
    <CuerpoQueSeTransforma
      abierto={abierto}
      alto={90}
      altoBus={55}
      ancho={260}
      anchoBus={64}
      desplazamientoX={0}
      forma={new Animated.Value(1)}
      haciaArriba
      humor="feliz"
      salto={0}
      texto={texto}
    />,
  );
}

describe('CuerpoQueSeTransforma', () => {
  it('el texto se anuncia completo aunque todavía se esté materializando', async () => {
    const p = await dibujar(true, 'Tu bus sale a las 3:00 p. m.');
    expect(p.getByLabelText('Tu bus sale a las 3:00 p. m.')).toBeTruthy();
  });

  it('las letras aparecen una tras otra y no de golpe', async () => {
    jest.useFakeTimers();
    const p = await dibujar(true, 'Hola');
    await act(async () => {
      await jest.advanceTimersByTimeAsync(220 + 16 * 2);
    });
    const antes = p.getByLabelText('Hola').props.children as unknown[];
    expect(String(antes[0])).toBe('Ho');
    await act(async () => {
      await jest.advanceTimersByTimeAsync(16 * 4);
    });
    const despues = p.getByLabelText('Hola').props.children as unknown[];
    expect(String(despues[0])).toBe('Hola');
  });

  it('cerrado no escribe nada todavía', async () => {
    const p = await dibujar(false, 'Hola');
    const hijos = p.getByLabelText('Hola').props.children as unknown[];
    expect(String(hijos[0])).toBe('');
  });
});
