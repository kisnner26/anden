import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { PlanoDeOcupacion } from './PlanoDeOcupacion';

const OCUPANTES = [
  { asiento: 2, boletoId: 'bol_a', nombre: 'Ana Ruiz' },
  { asiento: 5, boletoId: 'bol_b', nombre: 'Luis Pérez' },
];

function dibujar(props: Partial<Parameters<typeof PlanoDeOcupacion>[0]> = {}) {
  return renderPantalla(
    <PlanoDeOcupacion
      abordo={(id) => id === 'bol_b'}
      alAbrir={() => undefined}
      configuracion="micro15"
      ocupantes={OCUPANTES}
      {...props}
    />,
  );
}

describe('PlanoDeOcupacion', () => {
  it('marca cada asiento reservado con su dueño y deja libres los demás', async () => {
    const p = await dibujar();
    expect(
      p.getByRole('button', { name: 'Asiento 2, reservado por Ana Ruiz' }),
    ).toBeTruthy();
    expect(p.getByLabelText('Asiento 1, libre')).toBeTruthy();
  });

  it('los que ya subieron se anuncian como abordados', async () => {
    const p = await dibujar();
    expect(
      p.getByRole('button', { name: 'Asiento 5, Luis Pérez, ya subió' }),
    ).toBeTruthy();
  });

  it('tocar un asiento reservado abre a su pasajero', async () => {
    const alAbrir = jest.fn();
    const p = await dibujar({ alAbrir });
    await fireEvent.press(
      p.getByRole('button', { name: 'Asiento 2, reservado por Ana Ruiz' }),
    );
    expect(alAbrir).toHaveBeenCalledWith('bol_a');
  });
});
