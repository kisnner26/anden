import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { Aviso } from '@/datos/avisos';
import { abrirAjustesDelSistema } from '@/datos/notificaciones';
import { ContextoAvisos, type ValorAvisos } from '@/datos/useAvisos';
import { renderPantalla } from '@/pruebas/render';

import { Avisos } from './Avisos';

jest.mock('@/datos/notificaciones', () => ({
  abrirAjustesDelSistema: jest.fn(async () => undefined),
}));

const PRONTO: Aviso = {
  anden: 4,
  boletoId: 'bol_1',
  destino: 'Granada',
  id: 'bol_1:pronto',
  minutos: 25,
  tipo: 'pronto',
};

function valor(cambios: Partial<ValorAvisos> = {}): ValorAvisos {
  return {
    activadas: false,
    activar: jest.fn(async () => true),
    avisos: [],
    desactivar: jest.fn(async () => undefined),
    leidos: [],
    marcarLeido: jest.fn(async () => undefined),
    marcarTodos: jest.fn(async () => undefined),
    noLeidos: 0,
    permiso: 'sin-preguntar',
    ...cambios,
  };
}

function abrir(contexto: ValorAvisos) {
  return renderPantalla(
    <ContextoAvisos.Provider value={contexto}>
      <Avisos alVolver={() => undefined} />
    </ContextoAvisos.Provider>,
  );
}

describe('Avisos', () => {
  it('sin avisos muestra el estado vacío con el bus', async () => {
    const pantalla = await abrir(valor());
    expect(pantalla.getByText('Sin avisos por ahora')).toBeTruthy();
  });

  it('antes de pedir el permiso explica para qué sirve', async () => {
    const pantalla = await abrir(valor());
    expect(pantalla.getByText(/Te lo pedimos ahora/)).toBeTruthy();
  });

  it('activar el interruptor pide activar los avisos', async () => {
    const contexto = valor();
    const pantalla = await abrir(contexto);
    await fireEvent(
      pantalla.getByLabelText('Avisos en el teléfono'),
      'valueChange',
      true,
    );
    expect(contexto.activar).toHaveBeenCalledTimes(1);
  });

  it('apagar el interruptor desactiva los avisos', async () => {
    const contexto = valor({ activadas: true, permiso: 'concedido' });
    const pantalla = await abrir(contexto);
    await fireEvent(
      pantalla.getByLabelText('Avisos en el teléfono'),
      'valueChange',
      false,
    );
    expect(contexto.desactivar).toHaveBeenCalledTimes(1);
  });

  it('con el permiso negado explica y ofrece abrir los ajustes', async () => {
    const pantalla = await abrir(valor({ permiso: 'negado' }));
    expect(pantalla.getByText(/están desactivadas para Andén/)).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Abrir ajustes del teléfono' }),
    );
    expect(abrirAjustesDelSistema).toHaveBeenCalledTimes(1);
  });

  it('lista los avisos y marca el que está sin leer', async () => {
    const pantalla = await abrir(valor({ avisos: [PRONTO], noLeidos: 1 }));
    expect(pantalla.getByText('Tu bus a Granada sale en 25 min')).toBeTruthy();
    expect(pantalla.getByTestId('aviso-sin-leer')).toBeTruthy();
  });

  it('tocar un aviso lo marca como leído', async () => {
    const contexto = valor({ avisos: [PRONTO], noLeidos: 1 });
    const pantalla = await abrir(contexto);
    await fireEvent.press(
      pantalla.getByText('Tu bus a Granada sale en 25 min'),
    );
    expect(contexto.marcarLeido).toHaveBeenCalledWith('bol_1:pronto');
  });

  it('un aviso leído ya no lleva el punto', async () => {
    const pantalla = await abrir(
      valor({ avisos: [PRONTO], leidos: ['bol_1:pronto'] }),
    );
    expect(pantalla.queryByTestId('aviso-sin-leer')).toBeNull();
  });

  it('marcar todo como leído solo aparece con avisos sin leer', async () => {
    const contexto = valor({ avisos: [PRONTO], noLeidos: 1 });
    const pantalla = await abrir(contexto);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Marcar todo como leído' }),
    );
    expect(contexto.marcarTodos).toHaveBeenCalledTimes(1);
  });
});
