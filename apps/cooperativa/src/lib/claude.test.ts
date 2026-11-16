import { describe, expect, it } from 'vitest';

import {
  codigoDelPuente,
  contextoDeCooperativa,
  direccionDelPuente,
  instruccionesDeCooperativa,
} from './claude';

const CODIGO = 'a'.repeat(48);

describe('direccionDelPuente', () => {
  it('acepta un equipo con su puerto y le quita la barra final', () => {
    expect(direccionDelPuente(' http://192.168.1.52:4780/ ')).toBe(
      'http://192.168.1.52:4780',
    );
  });

  it('acepta esta misma Mac', () => {
    expect(direccionDelPuente('http://127.0.0.1:4780')).toBe(
      'http://127.0.0.1:4780',
    );
  });

  it('sin puerto no sirve', () => {
    expect(direccionDelPuente('http://192.168.1.52')).toBeNull();
  });

  it('otros protocolos no sirven', () => {
    expect(direccionDelPuente('ftp://192.168.1.52:4780')).toBeNull();
  });

  it('con una ruta o una consulta no sirve', () => {
    expect(direccionDelPuente('http://192.168.1.52:4780/x')).toBeNull();
    expect(direccionDelPuente('http://192.168.1.52:4780/?a=1')).toBeNull();
  });

  it('un texto que no es una dirección no sirve', () => {
    expect(direccionDelPuente('hola')).toBeNull();
  });
});

describe('codigoDelPuente', () => {
  it('acepta 48 caracteres hexadecimales y los pasa a minúscula', () => {
    expect(codigoDelPuente(` ${'A'.repeat(48)} `)).toBe(CODIGO);
  });

  it('con otro largo o con otros caracteres no sirve', () => {
    expect(codigoDelPuente('a'.repeat(47))).toBeNull();
    expect(codigoDelPuente('z'.repeat(48))).toBeNull();
  });
});

describe('contextoDeCooperativa', () => {
  const HOY = new Date(2026, 10, 16, 12, 0);
  const datos = {
    alertas: [
      { atendida: false, creada_en: '2026-11-16T10:00:00Z', id: 'a1' },
    ] as never,
    boletos: [],
    cierres: [
      {
        chofer_id: 'cho_2',
        cerrado_en: new Date(2026, 10, 16, 9, 0).toISOString(),
        cobrado: 1200,
        pasajeros: 20,
        pendiente: 100,
        viaje_id: 'via_2',
      },
    ],
    encomiendas: [],
    viajes: [],
  };

  it('resume lo cobrado, lo pendiente y los pasajeros', () => {
    const texto = contextoDeCooperativa(datos, HOY);
    expect(texto).toContain('Pasajeros llevados: 20');
    expect(texto).toContain('Alertas sin atender: 1');
  });

  it('nombra al conductor que más cobró por su clave', () => {
    expect(contextoDeCooperativa(datos, HOY)).toContain('cho_2');
  });

  it('nunca incluye cédulas, teléfonos ni nombres de pasajeros', () => {
    const texto = contextoDeCooperativa(
      {
        ...datos,
        boletos: [
          {
            actualizado_en: '',
            asiento: 1,
            boleto_id: 'b',
            contenido: { boleto: { pasajero: { nombre: 'Ana Ruiz' } } },
            estado: 'vigente',
            viaje_id: 'via_2',
          },
        ],
      },
      HOY,
    );
    expect(texto).not.toContain('Ana Ruiz');
  });

  it('sin cierres no inventa un ranking', () => {
    expect(contextoDeCooperativa({ ...datos, cierres: [] }, HOY)).not.toContain(
      'Conductores que más cobraron',
    );
  });
});

describe('instruccionesDeCooperativa', () => {
  it('lleva los datos y pide no inventar cifras', () => {
    const texto = instruccionesDeCooperativa('Viajes activos: 3.');
    expect(texto).toContain('Viajes activos: 3.');
    expect(texto).toContain('no inventes cifras');
  });
});
