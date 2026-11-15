import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { ObjetosDelViaje } from './ObjetosDelViaje';

const OBJETO = {
  creado_en: '2026-11-15T10:00:00Z',
  descripcion: 'Mochila negra bajo el asiento 12',
  foto_url: null,
  id: 'o1',
  reclamado_en: null,
  viaje_id: 'via_1',
};

describe('ObjetosDelViaje', () => {
  it('sin objetos no dibuja nada', async () => {
    const p = await renderPantalla(
      <ObjetosDelViaje alReclamar={async () => true} objetos={[]} />,
    );
    expect(p.queryByTestId('objetos-del-viaje')).toBeNull();
  });

  it('muestra lo encontrado y deja decir "es mío"', async () => {
    const alReclamar = jest.fn(async (_id: string) => true);
    const p = await renderPantalla(
      <ObjetosDelViaje alReclamar={alReclamar} objetos={[OBJETO]} />,
    );
    expect(p.getByText('Mochila negra bajo el asiento 12')).toBeTruthy();
    await fireEvent.press(p.getByRole('button', { name: 'Es mío' }));
    expect(alReclamar).toHaveBeenCalledWith('o1');
  });

  it('un objeto ya reclamado no se puede reclamar otra vez', async () => {
    const p = await renderPantalla(
      <ObjetosDelViaje
        alReclamar={async () => true}
        objetos={[{ ...OBJETO, reclamado_en: '2026-11-15T11:00:00Z' }]}
      />,
    );
    expect(p.getByText('Ya lo reclamaron.')).toBeTruthy();
    expect(p.queryByRole('button', { name: 'Es mío' })).toBeNull();
  });

  it('avisa si no se pudo reclamar', async () => {
    const p = await renderPantalla(
      <ObjetosDelViaje alReclamar={async () => false} objetos={[OBJETO]} />,
    );
    await fireEvent.press(p.getByRole('button', { name: 'Es mío' }));
    expect(await p.findByText(/No se pudo reclamar/)).toBeTruthy();
  });
});
