import { describe, expect, it } from '@jest/globals';

import {
  compararMeses,
  mesAnterior,
  mesSiguiente,
  rangoDeMeses,
  semanasDelMes,
  viajesPorDia,
} from './calendarioViajes';
import type { BoletoGuardado } from './reserva';

function boleto(id: string, fecha: Date): BoletoGuardado {
  return {
    boleto: { id },
    resumen: { destino: 'Boaco', salida: fecha.toISOString() },
  } as unknown as BoletoGuardado;
}

describe('semanasDelMes', () => {
  it('noviembre de 2026 empieza en domingo y se muestra con lunes primero', () => {
    const semanas = semanasDelMes({ anio: 2026, mes: 10 });
    expect(semanas[0]).toEqual([null, null, null, null, null, null, 1]);
    expect(semanas[1]).toEqual([2, 3, 4, 5, 6, 7, 8]);
    expect(semanas[semanas.length - 1]?.filter((d) => d !== null).pop()).toBe(
      30,
    );
  });

  it('todas las semanas tienen siete celdas', () => {
    for (let mes = 0; mes < 12; mes += 1) {
      for (const semana of semanasDelMes({ anio: 2026, mes })) {
        expect(semana).toHaveLength(7);
      }
    }
  });

  it('febrero de un año bisiesto llega al 29', () => {
    const dias = semanasDelMes({ anio: 2028, mes: 1 }).flat().filter(Boolean);
    expect(Math.max(...(dias as number[]))).toBe(29);
  });
});

describe('viajesPorDia', () => {
  it('agrupa por día solo los del mes pedido', () => {
    const dias = viajesPorDia(
      [
        boleto('a', new Date(2026, 10, 12, 8)),
        boleto('b', new Date(2026, 10, 12, 17)),
        boleto('c', new Date(2026, 9, 30, 9)),
      ],
      { anio: 2026, mes: 10 },
    );
    expect([...dias.keys()]).toEqual([12]);
    expect(dias.get(12)?.map((b) => b.boleto.id)).toEqual(['b', 'a']);
  });
});

describe('meses', () => {
  it('siguiente y anterior cruzan el año', () => {
    expect(mesSiguiente({ anio: 2026, mes: 11 })).toEqual({
      anio: 2027,
      mes: 0,
    });
    expect(mesAnterior({ anio: 2026, mes: 0 })).toEqual({
      anio: 2025,
      mes: 11,
    });
  });

  it('compara meses de años distintos', () => {
    expect(compararMeses({ anio: 2027, mes: 0 }, { anio: 2026, mes: 11 })).toBe(
      1,
    );
    expect(compararMeses({ anio: 2026, mes: 3 }, { anio: 2026, mes: 3 })).toBe(
      0,
    );
  });

  it('el rango va del primer al último mes con viajes', () => {
    const rango = rangoDeMeses([
      boleto('a', new Date(2026, 10, 1)),
      boleto('b', new Date(2026, 7, 1)),
      boleto('c', new Date(2027, 1, 1)),
    ]);
    expect(rango).toEqual({
      desde: { anio: 2026, mes: 7 },
      hasta: { anio: 2027, mes: 1 },
    });
    expect(rangoDeMeses([])).toBeNull();
  });
});
