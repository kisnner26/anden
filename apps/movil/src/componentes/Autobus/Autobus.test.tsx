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

  it('espejado dibuja el bus mirando a la izquierda y deja el letrero legible', async () => {
    const normal = await render(<Autobus ancho={200} letrero="GRANADA" />);
    const espejado = await render(
      <Autobus ancho={200} espejo letrero="GRANADA" />,
    );
    const texto = (arbol: Awaited<ReturnType<typeof render>>) =>
      JSON.stringify(arbol.toJSON());
    expect(texto(normal)).not.toMatch(/"matrix":\[-1,0,0,1,/);
    // un espejo para el bus y otro, dentro, que devuelve el letrero a su lado
    expect(texto(espejado).match(/"matrix":\[-1,0,0,1,/g)).toHaveLength(2);
    expect(texto(espejado)).toContain('GRANADA');
  });
});
