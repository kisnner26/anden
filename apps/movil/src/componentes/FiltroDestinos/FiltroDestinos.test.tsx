import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { FiltroDestinos } from './FiltroDestinos';

describe('FiltroDestinos', () => {
  it('ofrece todos los destinos y cada uno', async () => {
    const p = await renderPantalla(
      <FiltroDestinos
        alElegir={() => undefined}
        destinos={['Boaco', 'Juigalpa']}
        elegido={null}
      />,
    );
    expect(p.getByRole('button', { name: 'Todos los destinos' })).toBeTruthy();
    expect(p.getByRole('button', { name: 'Boaco' })).toBeTruthy();
    expect(p.getByRole('button', { name: 'Juigalpa' })).toBeTruthy();
  });

  it('marca el elegido y avisa al tocar otro', async () => {
    const alElegir = jest.fn();
    const p = await renderPantalla(
      <FiltroDestinos
        alElegir={alElegir}
        destinos={['Boaco', 'Juigalpa']}
        elegido="Boaco"
      />,
    );
    expect(
      p.getByRole('button', { name: 'Boaco' }).props.accessibilityState,
    ).toMatchObject({ selected: true });
    await fireEvent.press(p.getByRole('button', { name: 'Juigalpa' }));
    expect(alElegir).toHaveBeenCalledWith('Juigalpa');
    await fireEvent.press(
      p.getByRole('button', { name: 'Todos los destinos' }),
    );
    expect(alElegir).toHaveBeenCalledWith(null);
  });

  it('con un solo destino no hace falta filtrar', async () => {
    const p = await renderPantalla(
      <FiltroDestinos
        alElegir={() => undefined}
        destinos={['Boaco']}
        elegido={null}
      />,
    );
    expect(p.queryByTestId('filtro-destinos')).toBeNull();
  });
});
