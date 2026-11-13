import { describe, expect, it } from '@jest/globals';

import {
  MAXIMO_SALIDAS,
  armarContexto,
  instruccionesDelAsistente,
} from './contextoIA';
import type { BoletoGuardado } from './reserva';
import type { Salida } from './salidas';

const AHORA = new Date(2026, 10, 13, 14, 0);

function salida(minutosDesdeAhora: number, destino = 'Boaco'): Salida {
  return {
    anden: 4,
    asientosLibres: 12,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino,
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 123456',
    rutaId: 'rut_may_boa',
    salida: new Date(AHORA.getTime() + minutosDesdeAhora * 60_000),
    servicio: 'ordinario',
    tarifa: 66,
    ventaAbierta: true,
    viajeId: `v_${minutosDesdeAhora}`,
  };
}

function boleto(
  estado: 'cancelado' | 'vigente',
  minutos: number,
): BoletoGuardado {
  return {
    boleto: { asiento: 7, estado, precio: 66 },
    resumen: {
      anden: 4,
      destino: 'Boaco',
      salida: new Date(AHORA.getTime() + minutos * 60_000).toISOString(),
    },
  } as unknown as BoletoGuardado;
}

describe('armarContexto', () => {
  it('lista las próximas salidas con tarifa, andén y asientos', () => {
    const texto = armarContexto([salida(30)], [], AHORA);
    expect(texto).toContain('Managua a Boaco');
    expect(texto).toContain('C$ 66');
    expect(texto).toContain('andén 4');
    expect(texto).toContain('12 asientos libres');
  });

  it('deja afuera las salidas que ya pasaron hace rato y ordena por hora', () => {
    const texto = armarContexto(
      [salida(90, 'Juigalpa'), salida(-180, 'Camoapa'), salida(10, 'Boaco')],
      [],
      AHORA,
    );
    expect(texto).not.toContain('Camoapa');
    expect(texto.indexOf('Boaco')).toBeLessThan(texto.indexOf('Juigalpa'));
  });

  it('no pasa del máximo de salidas para no llenar la memoria del modelo', () => {
    const muchas = Array.from({ length: 40 }, (_, i) => salida(i + 1));
    const lineas = armarContexto(muchas, [], AHORA)
      .split('\n')
      .filter((linea) => linea.includes('asientos libres'));
    expect(lineas).toHaveLength(MAXIMO_SALIDAS);
  });

  it('incluye solo los boletos vigentes y dice cuando no hay', () => {
    const con = armarContexto(
      [],
      [boleto('vigente', 60), boleto('cancelado', 30)],
      AHORA,
    );
    expect(con).toContain('asiento 7');
    expect(con.match(/asiento 7/g)).toHaveLength(1);
    const sin = armarContexto([], [], AHORA);
    expect(sin).toContain('- ninguna');
    expect(sin).toContain('- ninguno');
  });
});

describe('instruccionesDelAsistente', () => {
  it('manda responder con los datos y no inventar horarios ni precios', () => {
    const texto = instruccionesDelAsistente('DATOS');
    expect(texto).toContain('usá solamente los datos de abajo');
    expect(texto).toContain('No inventes horarios, precios ni andenes');
    expect(texto.endsWith('DATOS')).toBe(true);
  });

  it('limita horarios y precios a los datos pero deja contar de las ciudades', () => {
    const texto = instruccionesDelAsistente('DATOS');
    expect(texto).toContain('usá solamente los datos de abajo');
    expect(texto).toContain('Boaco');
    expect(texto).toContain('lugares para visitar');
    expect(texto).toContain('DATOS');
  });

  it('el modo turista pide recomendaciones y el normal no', () => {
    expect(instruccionesDelAsistente('x', { turista: true })).toContain(
      'La persona es turista',
    );
    expect(instruccionesDelAsistente('x')).not.toContain(
      'La persona es turista',
    );
  });
});
