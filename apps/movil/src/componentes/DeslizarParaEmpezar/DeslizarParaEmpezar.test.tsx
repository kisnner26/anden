import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { DeslizarParaEmpezar } from './DeslizarParaEmpezar';

function activar(control: Parameters<typeof fireEvent>[0]) {
  return fireEvent(control, 'accessibilityAction', {
    nativeEvent: { actionName: 'activate' },
  });
}

describe('DeslizarParaEmpezar', () => {
  it('se anuncia como un botón con su ayuda', async () => {
    const pantalla = await renderPantalla(
      <DeslizarParaEmpezar alCompletar={() => undefined} ancho={300} />,
    );
    const control = pantalla.getByRole('button', {
      name: 'Deslizar para empezar',
    });
    expect(control.props.accessibilityHint).toMatch(/Desliza hacia la derecha/);
  });

  it('completa una sola vez con la acción de accesibilidad', async () => {
    const alCompletar = jest.fn();
    const pantalla = await renderPantalla(
      <DeslizarParaEmpezar alCompletar={alCompletar} ancho={300} />,
    );
    const control = pantalla.getByRole('button', {
      name: 'Deslizar para empezar',
    });
    await activar(control);
    await activar(control);
    expect(alCompletar).toHaveBeenCalledTimes(1);
  });
});
