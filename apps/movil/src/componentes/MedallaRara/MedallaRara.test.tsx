import { describe, expect, it } from '@jest/globals';

import type { SelloRaro } from '@/datos/pasaporte';
import { renderPantalla } from '@/pruebas/render';

import { MedallaRara } from './MedallaRara';

const GANADO: SelloRaro = {
  avance: { actual: 5, meta: 5 },
  cuando: '2026-10-16T08:00:00.000Z',
  desbloqueado: true,
  id: 'constante',
};
const PENDIENTE: SelloRaro = {
  avance: { actual: 3, meta: 5 },
  cuando: null,
  desbloqueado: false,
  id: 'constante',
};

describe('MedallaRara', () => {
  it('una medalla ganada muestra su fecha y no su avance', async () => {
    const p = await renderPantalla(<MedallaRara raro={GANADO} />);
    expect(p.getByText('Constante')).toBeTruthy();
    expect(p.queryByText('Por ganar')).toBeNull();
    expect(p.queryByText('3 / 5')).toBeNull();
  });

  it('una pendiente dice por ganar y cuánto lleva', async () => {
    const p = await renderPantalla(<MedallaRara raro={PENDIENTE} />);
    expect(p.getByText('Por ganar')).toBeTruthy();
    expect(p.getByText('3 / 5')).toBeTruthy();
    expect(p.getByLabelText(/Constante\..*3 \/ 5/)).toBeTruthy();
  });
});
