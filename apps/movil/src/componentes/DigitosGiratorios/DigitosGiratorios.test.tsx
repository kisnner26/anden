import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { DigitosGiratorios } from './DigitosGiratorios';

const ESTILO = { fontSize: 13, lineHeight: 18 };

describe('DigitosGiratorios', () => {
  it('para el lector es solo el número', async () => {
    const p = await renderPantalla(
      <DigitosGiratorios estilo={ESTILO} valor={42} />,
    );
    expect(p.getByLabelText('42')).toBeTruthy();
  });

  it('dibuja una columna por dígito', async () => {
    const p = await renderPantalla(
      <DigitosGiratorios estilo={ESTILO} valor={305} />,
    );
    // cada columna lleva los diez dígitos apilados
    expect(p.getAllByText('7', { includeHiddenElements: true })).toHaveLength(
      3,
    );
  });

  it('un número negativo se muestra como cero', async () => {
    const p = await renderPantalla(
      <DigitosGiratorios estilo={ESTILO} valor={-5} />,
    );
    expect(p.getByLabelText('0')).toBeTruthy();
  });
});
