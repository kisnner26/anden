import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { Portada } from './Portada';

describe('Portada', () => {
  it('muestra el lema y el lugar', async () => {
    const pantalla = await renderPantalla(
      <Portada alEmpezar={() => undefined} />,
    );
    expect(pantalla.getByText('Managua · Nicaragua')).toBeTruthy();
    expect(pantalla.getByText(/Tu viaje en bus,/)).toBeTruthy();
  });

  it('avisa al presionar Empezar', async () => {
    const alEmpezar = jest.fn();
    const pantalla = await renderPantalla(<Portada alEmpezar={alEmpezar} />);
    await fireEvent.press(pantalla.getByRole('button', { name: 'Empezar' }));
    expect(alEmpezar).toHaveBeenCalledTimes(1);
  });
});
