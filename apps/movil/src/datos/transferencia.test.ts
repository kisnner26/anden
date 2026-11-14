import { describe, expect, it } from '@jest/globals';

import { boletoDePrueba } from '@/pruebas/boletos';

import {
  codigoCompleto,
  codigoLegible,
  enlaceDeTransferencia,
  leerEstadoDeOferta,
  leerRespuestaDeReclamo,
  mensajeDeTransferencia,
  normalizarCodigo,
} from './transferencia';

describe('normalizarCodigo', () => {
  it('acepta minúsculas, espacios y guiones', () => {
    expect(normalizarCodigo(' ab4k-92mn ')).toBe('AB4K92MN');
  });

  it('descarta los signos que el código nunca usa', () => {
    expect(normalizarCodigo('O0I1L-AB')).toBe('AB');
  });

  it('corta lo que sobra del largo', () => {
    expect(normalizarCodigo('ABCDEFGHJKMN')).toBe('ABCDEFGH');
  });
});

describe('codigoCompleto y codigoLegible', () => {
  it('solo con ocho signos válidos está completo', () => {
    expect(codigoCompleto('ABCD2345')).toBe(true);
    expect(codigoCompleto('ABCD23')).toBe(false);
  });

  it('se lee en dos grupos de cuatro', () => {
    expect(codigoLegible('abcd2345')).toBe('ABCD-2345');
    expect(codigoLegible('ABC')).toBe('ABC');
  });
});

describe('enlace y mensaje', () => {
  it('el enlace abre Andén en recibir con el código', () => {
    expect(enlaceDeTransferencia('abcd-2345')).toBe(
      'anden://recibir?codigo=ABCD2345',
    );
  });

  it('el mensaje dice el viaje, el código y cuánto vale, sin datos personales', () => {
    const texto = mensajeDeTransferencia({
      codigo: 'ABCD2345',
      destino: 'Boaco',
      salida: '3:30 p. m.',
    });
    expect(texto).toContain('boleto a Boaco');
    expect(texto).toContain('ABCD-2345');
    expect(texto).toContain('30 minutos');
    expect(texto).toContain('anden://recibir?codigo=ABCD2345');
  });
});

describe('leerRespuestaDeReclamo', () => {
  it('devuelve el boleto cuando el servidor lo entrega', () => {
    const boleto = boletoDePrueba(new Date(2026, 10, 15, 8, 0));
    expect(leerRespuestaDeReclamo({ boleto })).toEqual({ boleto });
  });

  it.each(['no-existe', 'propia', 'ya-usada', 'vencida'] as const)(
    'devuelve el motivo %s',
    (error) => {
      expect(leerRespuestaDeReclamo({ error })).toEqual({ error });
    },
  );

  it('una respuesta rara cuenta como falla de conexión', () => {
    expect(leerRespuestaDeReclamo(null)).toEqual({ error: 'conexion' });
    expect(leerRespuestaDeReclamo({ boleto: { raro: true } })).toEqual({
      error: 'conexion',
    });
    expect(leerRespuestaDeReclamo({ error: 'otra cosa' })).toEqual({
      error: 'conexion',
    });
  });
});

describe('leerEstadoDeOferta', () => {
  it('lee el estado y el primer nombre de quien lo recibió', () => {
    expect(
      leerEstadoDeOferta({ estado: 'reclamada', para_nombre: 'Luis' }),
    ).toEqual({ estado: 'reclamada', paraNombre: 'Luis' });
  });

  it('un estado desconocido o un dato roto se descarta', () => {
    expect(leerEstadoDeOferta({ estado: 'rara' })).toBeNull();
    expect(leerEstadoDeOferta('x')).toBeNull();
  });
});
