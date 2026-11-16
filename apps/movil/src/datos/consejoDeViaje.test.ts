import { describe, expect, it } from '@jest/globals';

import { boletoDePrueba } from '@/pruebas/boletos';

import { consejoDeViaje } from './consejoDeViaje';

const TERMINALES = [
  { ciudad: 'Managua', coordenadas: { lat: 12.1364, lng: -86.2514 } },
  { ciudad: 'Boaco', coordenadas: { lat: 12.4725, lng: -85.6598 } },
];

describe('consejoDeViaje', () => {
  const boleto = boletoDePrueba(new Date(2026, 10, 20, 15, 0));

  it('dice a qué hora estar en el punto de encuentro y cuándo sale', () => {
    const [primera] = consejoDeViaje(boleto, TERMINALES);
    expect(primera).toContain('punto de encuentro a las');
    expect(primera).toContain('a Boaco');
  });

  it('dice de qué lado pega el sol cuando hay terminales', () => {
    const lineas = consejoDeViaje(boleto, TERMINALES);
    expect(lineas).toHaveLength(2);
    expect(lineas[1]).toMatch(/sol/);
  });

  it('sin terminales conocidas deja solo el plan', () => {
    expect(consejoDeViaje(boleto, [])).toHaveLength(1);
  });
});
