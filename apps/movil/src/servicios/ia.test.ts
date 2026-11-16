import { describe, expect, it } from '@jest/globals';

import { crearIAApple, crearIAGemini, motivoNoDisponible } from './ia';

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

describe('Gemini sin módulo nativo (pruebas, web)', () => {
  it('dice que no está disponible y no inventa respuestas', async () => {
    const gemini = crearIAGemini();
    expect(await gemini.disponibilidad()).toBe('sin-modulo');
    await expect(gemini.preguntar('a', 'b')).rejects.toThrow('sin-modulo');
  });
});

describe('motivos de no disponibilidad', () => {
  it('si está apagada pide activarla en los ajustes', () => {
    expect(motivoNoDisponible('apagada', 'Gemini')).toContain('Activá Gemini');
  });

  it('si no está lista pide esperar unos minutos', () => {
    expect(motivoNoDisponible('no-lista', 'Apple Intelligence')).toContain(
      'Probá en unos minutos',
    );
  });

  it('si el idioma no se soporta lo dice', () => {
    expect(motivoNoDisponible('idioma-no-soportado', 'Gemini')).toContain(
      'idioma',
    );
  });

  it('si el teléfono no es compatible nombra el motor', () => {
    expect(motivoNoDisponible('no-compatible', 'Gemini')).toBe(
      'Este teléfono no es compatible con Gemini.',
    );
  });

  it('si el sistema es antiguo pide actualizar', () => {
    expect(
      motivoNoDisponible('sistema-antiguo', 'Apple Intelligence'),
    ).toContain('versión más nueva');
  });
});

describe('motores de IA', () => {
  it('el de Apple se llama Apple Intelligence', () => {
    const ia = crearIAApple();
    expect(ia.nombre).toBe('Apple Intelligence');
    expect(ia.proveedor).toBe('apple');
  });

  it('el de Android se llama Gemini y no sabe conversar', () => {
    const ia = crearIAGemini();
    expect(ia.nombre).toBe('Gemini');
    expect(ia.proveedor).toBe('gemini');
    expect(ia.conversar).toBeUndefined();
  });
});
