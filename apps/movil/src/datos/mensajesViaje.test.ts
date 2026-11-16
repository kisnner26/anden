import { describe, expect, it } from '@jest/globals';

import {
  chatDisponible,
  MAXIMO_MENSAJE,
  ordenarMensajes,
  sinLeer,
  textoDeMensaje,
  type MensajeViaje,
} from './mensajesViaje';

function mensaje(
  id: string,
  enviadoEn: string,
  de: MensajeViaje['de'] = 'chofer',
): MensajeViaje {
  return { de, enviadoEn, hilo: 'bol_1', id, texto: id, viajeId: 'via_2' };
}

describe('textoDeMensaje', () => {
  it('recorta los bordes y junta los espacios repetidos', () => {
    expect(textoDeMensaje('  ya   voy  en   camino ')).toBe('ya voy en camino');
  });

  it('un texto vacío o solo de espacios no se envía', () => {
    expect(textoDeMensaje('')).toBeNull();
    expect(textoDeMensaje('   ')).toBeNull();
  });

  it('pasado el máximo no se envía y justo en el máximo sí', () => {
    expect(textoDeMensaje('a'.repeat(MAXIMO_MENSAJE))).not.toBeNull();
    expect(textoDeMensaje('a'.repeat(MAXIMO_MENSAJE + 1))).toBeNull();
  });
});

describe('ordenarMensajes', () => {
  it('pone primero el más viejo', () => {
    const lista = ordenarMensajes([
      mensaje('b', '2026-11-16T10:05:00Z'),
      mensaje('a', '2026-11-16T10:00:00Z'),
    ]);
    expect(lista.map((m) => m.id)).toEqual(['a', 'b']);
  });

  it('un id repetido queda una sola vez', () => {
    const lista = ordenarMensajes([
      mensaje('a', '2026-11-16T10:00:00Z'),
      mensaje('a', '2026-11-16T10:00:00Z'),
    ]);
    expect(lista).toHaveLength(1);
  });
});

describe('sinLeer', () => {
  const lista = [
    mensaje('a', '2026-11-16T10:00:00Z', 'chofer'),
    mensaje('b', '2026-11-16T10:05:00Z', 'pasajero'),
    mensaje('c', '2026-11-16T10:10:00Z', 'chofer'),
  ];

  it('sin nada visto cuenta todos los de la otra persona', () => {
    expect(sinLeer(lista, 'pasajero', null)).toBe(2);
  });

  it('solo cuenta los que llegaron después de lo visto', () => {
    expect(sinLeer(lista, 'pasajero', '2026-11-16T10:05:00Z')).toBe(1);
  });

  it('los propios mensajes nunca cuentan', () => {
    expect(sinLeer(lista, 'chofer', null)).toBe(1);
  });
});

describe('chatDisponible', () => {
  it('con el viaje en ruta hay conversación', () => {
    expect(chatDisponible('en-ruta', false)).toBe(true);
  });

  it('con la ruta compartida hay conversación aunque el estado no se haya actualizado', () => {
    expect(chatDisponible('abordando', true)).toBe(true);
  });

  it('antes de salir y sin ruta compartida no hay conversación', () => {
    expect(chatDisponible('programado', false)).toBe(false);
    expect(chatDisponible('llego', false)).toBe(false);
  });
});
