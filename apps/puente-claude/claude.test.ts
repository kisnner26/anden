import { describe, expect, it } from 'vitest';

import { argumentosDeClaude, validarPedido } from './claude.ts';

describe('validarPedido', () => {
  it('acepta una pregunta con sus instrucciones', () => {
    expect(
      validarPedido({ instrucciones: 'Sos el asistente', pregunta: ' hola ' }),
    ).toEqual({ instrucciones: 'Sos el asistente', pregunta: 'hola' });
  });

  it('rechaza lo que no es un objeto o no trae textos', () => {
    expect(validarPedido(null)).toBeNull();
    expect(validarPedido('hola')).toBeNull();
    expect(validarPedido({ pregunta: 'hola' })).toBeNull();
    expect(validarPedido({ instrucciones: 1, pregunta: 'hola' })).toBeNull();
  });

  it('rechaza una pregunta vacía o demasiado larga', () => {
    expect(validarPedido({ instrucciones: '', pregunta: '   ' })).toBeNull();
    expect(
      validarPedido({ instrucciones: '', pregunta: 'a'.repeat(601) }),
    ).toBeNull();
  });

  it('rechaza instrucciones demasiado largas', () => {
    expect(
      validarPedido({ instrucciones: 'a'.repeat(12_001), pregunta: 'hola' }),
    ).toBeNull();
  });
});

describe('argumentosDeClaude', () => {
  it('corre sin herramientas y sin guardar la sesión', () => {
    const a = argumentosDeClaude({ instrucciones: '', pregunta: 'hola' });
    expect(a).toEqual(
      expect.arrayContaining([
        '-p',
        'hola',
        '--tools',
        '',
        '--no-session-persistence',
      ]),
    );
  });

  it('manda las instrucciones como instrucciones del sistema', () => {
    const a = argumentosDeClaude({
      instrucciones: 'Sos el asistente',
      pregunta: 'hola',
    });
    expect(a[a.indexOf('--system-prompt') + 1]).toBe('Sos el asistente');
  });

  it('sin instrucciones no manda el parámetro', () => {
    expect(
      argumentosDeClaude({ instrucciones: '', pregunta: 'hola' }),
    ).not.toContain('--system-prompt');
  });

  it('agrega el modelo solo si se pidió', () => {
    expect(
      argumentosDeClaude({ instrucciones: '', pregunta: 'hola' }),
    ).not.toContain('--model');
    expect(
      argumentosDeClaude({ instrucciones: '', pregunta: 'hola' }, 'sonnet'),
    ).toEqual(expect.arrayContaining(['--model', 'sonnet']));
  });

  it('la pregunta nunca se une a otro argumento', () => {
    const a = argumentosDeClaude({
      instrucciones: '',
      pregunta: '--tools bash',
    });
    expect(a[a.indexOf('-p') + 1]).toBe('--tools bash');
  });
});
