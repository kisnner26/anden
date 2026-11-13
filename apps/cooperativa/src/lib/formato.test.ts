import { describe, expect, it } from 'vitest';

import { dinero, hace, minutosEntre } from './formato';

describe('formato', () => {
  it('escribe córdobas y minutos', () => {
    expect(dinero(1500)).toMatch(/^C\$ 1.?500$/);
    expect(minutosEntre('2026-11-12T10:00:00Z', '2026-11-12T10:45:00Z')).toBe(
      45,
    );
  });

  it('dice hace cuánto pasó algo', () => {
    const ahora = new Date('2026-11-12T12:00:00Z');
    expect(hace('2026-11-12T11:59:40Z', ahora)).toBe('ahora');
    expect(hace('2026-11-12T11:30:00Z', ahora)).toBe('hace 30 min');
    expect(hace('2026-11-12T09:00:00Z', ahora)).toBe('hace 3 h');
    expect(hace('2026-11-10T12:00:00Z', ahora)).toBe('hace 2 d');
  });
});
