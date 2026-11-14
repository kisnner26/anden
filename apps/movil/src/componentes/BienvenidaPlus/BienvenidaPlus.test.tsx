import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { BENEFICIOS_PLUS } from '@/servicios/beneficios';
import { renderPantalla } from '@/pruebas/render';
import { t } from '@/textos/t';

import { BienvenidaPlus } from './BienvenidaPlus';

describe('BienvenidaPlus', () => {
  it('da la bienvenida y lista cada beneficio', async () => {
    const p = await renderPantalla(
      <BienvenidaPlus alEmpezar={() => undefined} />,
    );
    expect(p.getByText('Ya sos Plus.')).toBeTruthy();
    expect(p.getByText('Esto ya está activo para vos')).toBeTruthy();
    for (const beneficio of BENEFICIOS_PLUS) {
      expect(p.getByText(t(`plus.${beneficio.id}Titulo`))).toBeTruthy();
    }
  });

  it('dibuja los rayos, las ondas y el sello', async () => {
    const p = await renderPantalla(
      <BienvenidaPlus alEmpezar={() => undefined} />,
    );
    expect(p.getByTestId('rayos-plus')).toBeTruthy();
    expect(p.getByTestId('bienvenida-plus')).toBeTruthy();
  });

  it('el botón deja empezar', async () => {
    const alEmpezar = jest.fn();
    const p = await renderPantalla(<BienvenidaPlus alEmpezar={alEmpezar} />);
    await fireEvent.press(p.getByRole('button'));
    expect(alEmpezar).toHaveBeenCalledTimes(1);
  });
});
