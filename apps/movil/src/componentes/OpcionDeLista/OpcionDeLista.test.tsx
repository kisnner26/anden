import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { OpcionDeLista } from './OpcionDeLista';

describe('OpcionDeLista', () => {
  it('muestra el título y el detalle y avisa al tocarla', async () => {
    const alPresionar = jest.fn();
    const p = await renderPantalla(
      <OpcionDeLista
        alPresionar={alPresionar}
        detalle="Managua"
        titulo="Mercado Mayoreo"
      />,
    );
    expect(p.getByText('Mercado Mayoreo')).toBeTruthy();
    expect(p.getByText('Managua')).toBeTruthy();
    await fireEvent.press(p.getByRole('button', { name: 'Mercado Mayoreo' }));
    expect(alPresionar).toHaveBeenCalledTimes(1);
  });

  it('la elegida se anuncia como seleccionada', async () => {
    const p = await renderPantalla(
      <OpcionDeLista
        alPresionar={() => undefined}
        seleccionada
        titulo="Boaco"
      />,
    );
    expect(
      p.getByRole('button', { name: 'Boaco' }).props.accessibilityState,
    ).toMatchObject({ selected: true });
  });
});
