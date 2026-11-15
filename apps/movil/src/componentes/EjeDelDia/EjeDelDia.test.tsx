import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { BloqueDelDia } from '@/datos/diaDelChofer';
import { renderPantalla } from '@/pruebas/render';

import { EjeDelDia } from './EjeDelDia';

const BLOQUES: BloqueDelDia[] = [
  {
    destino: 'Boaco',
    estado: 'cerrado',
    fin: 0.3,
    inicio: 0.1,
    solapa: false,
    viajeId: 'a',
  },
  {
    destino: 'Juigalpa',
    estado: 'enVivo',
    fin: 0.6,
    inicio: 0.4,
    solapa: false,
    viajeId: 'b',
  },
  {
    destino: 'Managua',
    estado: 'pendiente',
    fin: 0.9,
    inicio: 0.7,
    solapa: true,
    viajeId: 'c',
  },
];

function dibujar(alAbrir: (id: string) => void = () => undefined) {
  return renderPantalla(
    <EjeDelDia ahoraEnElEje={0.5} alAbrir={alAbrir} bloques={BLOQUES} />,
  );
}

describe('EjeDelDia', () => {
  it('cada bloque dice su destino y su estado', async () => {
    const p = await dibujar();
    expect(p.getByLabelText('Boaco, ya cerró')).toBeTruthy();
    expect(p.getByLabelText('Juigalpa, en vivo')).toBeTruthy();
  });

  it('un choque de unidad se anuncia', async () => {
    const p = await dibujar();
    expect(
      p.getByLabelText(
        'Managua, por salir, choca con otro viaje de la misma unidad',
      ),
    ).toBeTruthy();
  });

  it('tocar un bloque abre ese viaje', async () => {
    const alAbrir = jest.fn();
    const p = await dibujar(alAbrir);
    await fireEvent.press(p.getByLabelText('Juigalpa, en vivo'));
    expect(alAbrir).toHaveBeenCalledWith('b');
  });
});
