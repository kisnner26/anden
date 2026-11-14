import { describe, expect, it } from '@jest/globals';

import {
  agruparPorFranja,
  altoDeBarra,
  atajosDelDia,
  contextoDelDia,
  franjaDelDia,
  posicionEnElDia,
} from './resumenDelDia';
import type { Salida } from './salidas';

const AHORA = new Date(2026, 10, 13, 9, 0);

function salida(id: string, hora: number, extra: Partial<Salida> = {}): Salida {
  return {
    puntoEncuentro: '764M4PPX+HH',
    asientosLibres: 10,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 1',
    rutaId: 'rut_1',
    salida: new Date(2026, 10, 13, hora, 0),
    servicio: 'ordinario',
    tarifa: 70,
    ventaAbierta: true,
    viajeId: id,
    ...extra,
  };
}

describe('posicionEnElDia', () => {
  it('las 5 a. m. son el inicio y las 11 p. m. el final', () => {
    expect(posicionEnElDia(new Date(2026, 10, 13, 5, 0))).toBe(0);
    expect(posicionEnElDia(new Date(2026, 10, 13, 23, 0))).toBe(1);
  });

  it('las 2 p. m. caen a la mitad', () => {
    expect(posicionEnElDia(new Date(2026, 10, 13, 14, 0))).toBe(0.5);
  });

  it('una hora fuera de la línea se queda en el borde', () => {
    expect(posicionEnElDia(new Date(2026, 10, 13, 3, 10))).toBe(0);
    expect(posicionEnElDia(new Date(2026, 10, 13, 23, 50))).toBe(1);
  });
});

describe('atajosDelDia', () => {
  it('elige la más barata, la más temprana y la que tiene más asientos', () => {
    const lista = [
      salida('a', 10, { asientosLibres: 3, tarifa: 90 }),
      salida('b', 12, { asientosLibres: 20, tarifa: 60 }),
      salida('c', 15, { asientosLibres: 8, tarifa: 75 }),
    ];
    const atajos = atajosDelDia(lista, AHORA);
    expect(atajos.masBarata?.viajeId).toBe('b');
    expect(atajos.masTemprana?.viajeId).toBe('a');
    expect(atajos.masLibre?.viajeId).toBe('b');
  });

  it('ignora las agotadas, las que ya salieron y las de venta cerrada', () => {
    const lista = [
      salida('llena', 10, { asientosLibres: 0 }),
      salida('salio', 10, { estado: 'en-ruta' }),
      salida('cerrada', 11, { ventaAbierta: false }),
      salida('buena', 14),
    ];
    expect(atajosDelDia(lista, AHORA).masTemprana?.viajeId).toBe('buena');
  });

  it('una salida sin tarifa no cuenta como la más barata', () => {
    const lista = [salida('sin', 10, { tarifa: null }), salida('con', 11)];
    expect(atajosDelDia(lista, AHORA).masBarata?.viajeId).toBe('con');
  });

  it('sin salidas todo es nulo', () => {
    expect(atajosDelDia([], AHORA)).toEqual({
      masBarata: null,
      masLibre: null,
      masTemprana: null,
    });
  });
});

describe('contextoDelDia', () => {
  it('lista las salidas ordenadas por hora con tarifa y asientos', () => {
    const texto = contextoDelDia(
      [salida('b', 15), salida('a', 10, { tarifa: null })],
      'Managua',
    );
    const lineas = texto.split('\n');
    expect(lineas[0]).toBe('Salidas desde Managua:');
    expect(lineas[1]).toContain('10:00 a. m.');
    expect(lineas[1]).toContain('sin tarifa');
    expect(lineas[2]).toContain('C$ 70');
  });

  it('sin salidas dice ninguna', () => {
    expect(contextoDelDia([], 'Managua')).toContain('- ninguna');
  });
});

describe('franjaDelDia', () => {
  it('separa madrugada, mañana, tarde y noche', () => {
    const f = (h: number) => franjaDelDia(new Date(2026, 10, 13, h, 0));
    expect(f(4)).toBe('madrugada');
    expect(f(6)).toBe('manana');
    expect(f(11)).toBe('manana');
    expect(f(12)).toBe('tarde');
    expect(f(17)).toBe('tarde');
    expect(f(18)).toBe('noche');
    expect(f(23)).toBe('noche');
  });
});

describe('agruparPorFranja', () => {
  it('ordena por hora y junta las salidas del mismo momento', () => {
    const grupos = agruparPorFranja([
      salida('t2', 16),
      salida('m1', 7),
      salida('t1', 13),
      salida('n1', 19),
    ]);
    expect(grupos.map((g) => g.franja)).toEqual(['manana', 'tarde', 'noche']);
    expect(grupos[1]?.salidas.map((s) => s.viajeId)).toEqual(['t1', 't2']);
  });

  it('sin salidas no hay grupos', () => {
    expect(agruparPorFranja([])).toEqual([]);
  });
});

describe('altoDeBarra', () => {
  it('la que más asientos tiene llega al máximo', () => {
    expect(altoDeBarra(20, 20)).toBe(72);
  });

  it('a la mitad queda a media altura entre el mínimo y el máximo', () => {
    expect(altoDeBarra(10, 20)).toBe(40);
  });

  it('una agotada se queda en el mínimo visible', () => {
    expect(altoDeBarra(0, 20)).toBe(8);
  });

  it('nunca pasa del máximo', () => {
    expect(altoDeBarra(50, 20)).toBe(72);
  });
});
