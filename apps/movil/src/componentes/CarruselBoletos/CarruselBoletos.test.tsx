import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { boletoDePrueba } from '@/pruebas/boletos';

import { CarruselBoletos } from './CarruselBoletos';

const AHORA = new Date(2026, 10, 13, 10, 0);
const UNO = [boletoDePrueba(new Date(2026, 10, 14, 9, 0), 1, 'AAAA1111')];
const DOS = [
  ...UNO,
  boletoDePrueba(new Date(2026, 10, 15, 9, 0), 2, 'BBBB2222'),
];

describe('CarruselBoletos', () => {
  it('con un solo boleto no muestra puntos', async () => {
    const pantalla = await render(
      <CarruselBoletos ahora={AHORA} alAbrirBoleto={jest.fn()} boletos={UNO} />,
    );
    expect(JSON.stringify(pantalla.toJSON())).not.toContain(
      'accessibilityElementsHidden',
    );
  });

  it('con varios boletos muestra un punto por cada uno, ocultos al lector de pantalla', async () => {
    const pantalla = await render(
      <CarruselBoletos ahora={AHORA} alAbrirBoleto={jest.fn()} boletos={DOS} />,
    );
    expect(JSON.stringify(pantalla.toJSON())).toContain(
      '"accessibilityElementsHidden":true',
    );
  });

  it('dibuja una tarjeta por boleto', async () => {
    const pantalla = await render(
      <CarruselBoletos ahora={AHORA} alAbrirBoleto={jest.fn()} boletos={DOS} />,
    );
    expect(pantalla.getAllByRole('button')).toHaveLength(2);
  });

  it('sin boletos no dibuja tarjetas', async () => {
    const pantalla = await render(
      <CarruselBoletos ahora={AHORA} alAbrirBoleto={jest.fn()} boletos={[]} />,
    );
    expect(pantalla.queryAllByRole('button')).toHaveLength(0);
  });
});
