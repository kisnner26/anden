import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { AlertaChoque } from './AlertaChoque';

const BASE = {
  alAvisarYa: jest.fn(),
  alEstoyBien: jest.fn(),
  alLlamar: jest.fn(),
};

describe('AlertaChoque', () => {
  it('no muestra nada sin alerta', async () => {
    const pantalla = await renderPantalla(
      <AlertaChoque {...BASE} fase={{ tipo: 'ninguna' }} />,
    );
    expect(pantalla.queryByText('¿Estás bien?')).toBeNull();
  });

  it('pregunta si está bien con la cuenta regresiva y deja confirmar o pedir ayuda', async () => {
    const alEstoyBien = jest.fn();
    const alAvisarYa = jest.fn();
    const pantalla = await renderPantalla(
      <AlertaChoque
        {...BASE}
        alAvisarYa={alAvisarYa}
        alEstoyBien={alEstoyBien}
        fase={{ restantes: 14, tipo: 'pregunta' }}
      />,
    );
    expect(pantalla.getByText('¿Estás bien?')).toBeTruthy();
    expect(pantalla.getByText('14')).toBeTruthy();
    await fireEvent.press(pantalla.getByRole('button', { name: 'Estoy bien' }));
    expect(alEstoyBien).toHaveBeenCalled();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Necesito ayuda, avisar ya' }),
    );
    expect(alAvisarYa).toHaveBeenCalled();
  });

  it('tras avisar ofrece llamar a emergencias y cuenta qué se avisó', async () => {
    const alLlamar = jest.fn();
    const pantalla = await renderPantalla(
      <AlertaChoque
        {...BASE}
        alLlamar={alLlamar}
        fase={{ conContacto: true, enServidor: false, tipo: 'enviada' }}
      />,
    );
    expect(pantalla.getByText(/Se abrió Mensajes/)).toBeTruthy();
    expect(
      pantalla.getByText(/No pudimos avisar a la cooperativa/),
    ).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Llamar al 118' }),
    );
    expect(alLlamar).toHaveBeenCalled();
  });
});
