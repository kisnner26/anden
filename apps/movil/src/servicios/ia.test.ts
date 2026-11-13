import { describe, expect, it } from '@jest/globals';

import { crearIAGemini, motivoNoDisponible } from './ia';

describe('motivoNoDisponible', () => {
  it('no hay motivo cuando está disponible', () => {
    expect(motivoNoDisponible('disponible', 'Apple Intelligence')).toBeNull();
  });

  it('explica cada razón con el nombre del motor', () => {
    expect(motivoNoDisponible('apagada', 'Apple Intelligence')).toContain(
      'Activá Apple Intelligence',
    );
    expect(motivoNoDisponible('no-compatible', 'Gemini')).toContain(
      'no es compatible con Gemini',
    );
    expect(
      motivoNoDisponible('sistema-antiguo', 'Apple Intelligence'),
    ).toContain('versión más nueva');
  });
});

describe('Gemini sin módulo', () => {
  it('dice que no está disponible y no inventa respuestas', async () => {
    const gemini = crearIAGemini();
    expect(await gemini.disponibilidad()).toBe('sin-modulo');
    await expect(gemini.preguntar('a', 'b')).rejects.toThrow('sin-modulo');
  });
});
