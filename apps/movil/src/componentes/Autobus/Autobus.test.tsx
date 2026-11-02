import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { Autobus } from './Autobus';

describe('Autobus', () => {
  it('conserva la proporción del dibujo', async () => {
    const pantalla = await render(
      <Autobus ancho={260} etiquetaAccesible="Bus" />,
    );
    expect(pantalla.getByLabelText('Bus').props.style).toEqual({
      height: 150,
      width: 260,
    });
  });

  it('se anuncia como imagen cuando tiene etiqueta', async () => {
    const pantalla = await render(
      <Autobus ancho={200} etiquetaAccesible="Bus de Andén" />,
    );
    expect(pantalla.getByRole('image', { name: 'Bus de Andén' })).toBeTruthy();
  });

  it('es decorativo sin etiqueta', async () => {
    const pantalla = await render(<Autobus ancho={200} />);
    expect(pantalla.queryByRole('image')).toBeNull();
  });

  it('muestra el destino en el letrero', async () => {
    const pantalla = await render(<Autobus ancho={200} letrero="GRANADA" />);
    expect(JSON.stringify(pantalla.toJSON())).toContain('GRANADA');
  });
});
