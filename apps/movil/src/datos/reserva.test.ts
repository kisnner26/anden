import { codigoValido } from '@anden/dominio';
import { describe, expect, it } from '@jest/globals';

import { crearMuestra, VIAJE_GRANADA } from './muestra';
import { crearReserva, ocupacionesDe, totalReserva } from './reserva';

const AHORA = new Date('2026-11-02T20:00:00.000Z');

function generador() {
  let paso = 0;
  return () => (paso++ % 31) / 31;
}

function reservar(
  asientos: number[],
  viajeId = VIAJE_GRANADA,
  datos = crearMuestra(AHORA),
) {
  return crearReserva(
    datos,
    viajeId,
    asientos.map((asiento, indice) => ({
      asiento,
      nombre: `Pasajero ${indice + 1}`,
    })),
    AHORA,
    generador(),
  );
}

describe('crearReserva', () => {
  it('arma un boleto vigente por pasajero con la tarifa oficial', () => {
    const resultado = reservar([8, 9]);
    expect(resultado.ok).toBe(true);
    if (!resultado.ok) return;
    expect(resultado.valor).toHaveLength(2);
    for (const { boleto } of resultado.valor) {
      expect(boleto.estado).toBe('vigente');
      expect(boleto.precio).toBe(46);
    }
  });

  it('genera códigos válidos y distintos para cada boleto', () => {
    const resultado = reservar([8, 9, 12]);
    if (!resultado.ok) throw new Error('la reserva debía salir bien');
    const codigos = resultado.valor.map(({ boleto }) => boleto.codigo);
    expect(new Set(codigos).size).toBe(3);
    for (const codigo of codigos) expect(codigoValido(codigo)).toBe(true);
  });

  it('guarda el resumen con destino, placa, chofer y pago en efectivo', () => {
    const resultado = reservar([8]);
    if (!resultado.ok) throw new Error('la reserva debía salir bien');
    expect(resultado.valor[0]?.resumen).toMatchObject({
      choferNombre: 'Marvin Lanzas',
      destino: 'Granada',
      metodoPago: 'efectivo-al-abordar',
      placa: 'M 222-114',
      servicio: 'ordinario',
    });
  });

  it('recorta el nombre y omite la cédula vacía', () => {
    const resultado = crearReserva(
      crearMuestra(AHORA),
      VIAJE_GRANADA,
      [{ asiento: 8, cedula: '  ', nombre: '  Ana Ruiz ' }],
      AHORA,
      generador(),
    );
    if (!resultado.ok) throw new Error('la reserva debía salir bien');
    expect(resultado.valor[0]?.boleto.pasajero).toEqual({
      esMenorEnBrazos: false,
      nombre: 'Ana Ruiz',
    });
  });

  it('pide nombres si falta alguno o no hay pasajeros', () => {
    const datos = crearMuestra(AHORA);
    const sinNombre = crearReserva(
      datos,
      VIAJE_GRANADA,
      [{ asiento: 8, nombre: ' ' }],
      AHORA,
      generador(),
    );
    expect(sinNombre).toEqual({ error: 'faltan-nombres', ok: false });
    const vacia = crearReserva(datos, VIAJE_GRANADA, [], AHORA, generador());
    expect(vacia).toEqual({ error: 'faltan-nombres', ok: false });
  });

  it('rechaza un asiento ya vendido', () => {
    expect(reservar([2])).toEqual({ error: 'asiento-ocupado', ok: false });
  });

  it('rechaza más de seis asientos', () => {
    expect(reservar([1, 4, 7, 8, 9, 12, 13])).toEqual({
      error: 'maximo-6',
      ok: false,
    });
  });

  it('rechaza un viaje que ya salió por venta cerrada', () => {
    expect(reservar([7], 'via_1')).toEqual({
      error: 'venta-cerrada',
      ok: false,
    });
  });

  it('rechaza un viaje inexistente', () => {
    expect(reservar([8], 'via_x')).toEqual({
      error: 'viaje-inexistente',
      ok: false,
    });
  });

  it('avisa que no hay tarifa si el tarifario está vacío', () => {
    const datos = { ...crearMuestra(AHORA), tarifario: [] };
    expect(reservar([8], VIAJE_GRANADA, datos)).toEqual({
      error: 'sin-tarifa',
      ok: false,
    });
  });
});

describe('ocupacionesDe', () => {
  it('convierte cada boleto en un asiento vendido de su viaje', () => {
    const resultado = reservar([8, 9]);
    if (!resultado.ok) throw new Error('la reserva debía salir bien');
    const ocupaciones = ocupacionesDe(resultado.valor);
    expect(ocupaciones.map((o) => o.asiento)).toEqual([8, 9]);
    expect(
      ocupaciones.every(
        (o) => o.estado === 'vendido' && o.viajeId === VIAJE_GRANADA,
      ),
    ).toBe(true);
  });
});

describe('totalReserva', () => {
  it('multiplica la tarifa oficial por la cantidad de asientos', () => {
    const datos = crearMuestra(AHORA);
    expect(totalReserva(datos, VIAJE_GRANADA, 3)).toEqual({
      total: 138,
      unitario: 46,
    });
  });

  it('es nulo sin asientos, sin viaje o sin tarifa', () => {
    const datos = crearMuestra(AHORA);
    expect(totalReserva(datos, VIAJE_GRANADA, 0)).toBeNull();
    expect(totalReserva(datos, 'via_x', 2)).toBeNull();
    expect(
      totalReserva({ ...datos, tarifario: [] }, VIAJE_GRANADA, 2),
    ).toBeNull();
  });
});
