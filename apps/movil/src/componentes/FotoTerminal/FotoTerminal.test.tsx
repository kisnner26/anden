import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { FotoTerminal } from './FotoTerminal';

describe('FotoTerminal', () => {
  it('con foto de la terminal dibuja la foto', async () => {
    const p = await renderPantalla(
      <FotoTerminal
        codigo="MAY"
        nombre="Mercado Mayoreo"
        terminalId="ter_may"
      />,
    );
    expect(p.getByTestId('foto-terminal-ter_may')).toBeTruthy();
  });

  it('sin foto deja el código de siempre', async () => {
    const p = await renderPantalla(
      <FotoTerminal codigo="XYZ" nombre="Otra" terminalId="ter_otra" />,
    );
    expect(p.getByText('XYZ')).toBeTruthy();
  });
});
