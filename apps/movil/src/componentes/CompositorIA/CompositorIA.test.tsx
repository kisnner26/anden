import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';
import { Animated } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { CompositorIA } from './CompositorIA';

function dibujar(texto: string, alEnviar = jest.fn(), deshabilitado = false) {
  return renderPantalla(
    <CompositorIA
      alCambiar={() => undefined}
      alEnviar={alEnviar}
      alHablar={() => undefined}
      deshabilitado={deshabilitado}
      estado="reposo"
      nivel={new Animated.Value(0)}
      texto={texto}
    />,
  );
}

describe('CompositorIA', () => {
  it('envía lo escrito al tocar el botón', async () => {
    const alEnviar = jest.fn();
    const p = await dibujar('hola', alEnviar);
    await fireEvent.press(p.getByRole('button', { name: 'Preguntar' }));
    expect(alEnviar).toHaveBeenCalledTimes(1);
  });

  it('sin texto no se puede enviar', async () => {
    const alEnviar = jest.fn();
    const p = await dibujar('   ', alEnviar);
    await fireEvent.press(p.getByRole('button', { name: 'Preguntar' }));
    expect(alEnviar).not.toHaveBeenCalled();
  });

  it('mientras el asistente piensa no deja enviar otra', async () => {
    const alEnviar = jest.fn();
    const p = await dibujar('hola', alEnviar, true);
    await fireEvent.press(p.getByRole('button', { name: 'Preguntar' }));
    expect(alEnviar).not.toHaveBeenCalled();
  });
});
