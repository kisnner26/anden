import { describe, expect, it } from '@jest/globals';

import { crearMuestra } from './muestra';
import {
  alternativasParaBoleto,
  pasajeroParaReubicar,
  primerAsientoLibre,
} from './reubicarBoleto';
import type { BoletoGuardado } from './reserva';
import type { Salida } from './salidas';

const AHORA = new Date('2026-11-15T10:00:00');

function salida(parcial: Partial<Salida>): Salida {
  return {
    asientosLibres: 5,
    choferId: 'cho_1',
    codigoDestino: 'BOA',
    destino: 'Boaco',
    estado: 'programado',
    minutosAtraso: 0,
    origen: 'Managua',
    placa: 'M 1',
    puntoEncuentro: '',
    rutaId: 'r',
    salida: new Date('2026-11-15T14:00:00'),
    servicio: 'ordinario',
    tarifa: 66,
    ventaAbierta: true,
    viajeId: 'via_nuevo',
    ...parcial,
  };
}

const BOLETO = {
  boleto: {
    asiento: 3,
    pasajero: {
      cedula: '001-010190-0001A',
      esMenorEnBrazos: false,
      nombre: 'Ana Ruiz',
    },
    viajeId: 'via_cancelado',
  },
  resumen: { destino: 'Boaco', origen: 'Managua', paraOtro: true },
} as unknown as BoletoGuardado;

describe('alternativasParaBoleto', () => {
  it('ofrece las salidas del mismo trayecto, las más cercanas primero', () => {
    const lista = alternativasParaBoleto(
      [
        salida({ salida: new Date('2026-11-15T18:00:00'), viajeId: 'tarde' }),
        salida({ salida: new Date('2026-11-15T12:00:00'), viajeId: 'pronto' }),
      ],
      BOLETO,
      AHORA,
    );
    expect(lista.map((s) => s.viajeId)).toEqual(['pronto', 'tarde']);
  });

  it('deja afuera el mismo viaje, otros destinos y otros orígenes', () => {
    const lista = alternativasParaBoleto(
      [
        salida({ viajeId: 'via_cancelado' }),
        salida({ destino: 'Juigalpa', viajeId: 'otro-destino' }),
        salida({ origen: 'Boaco', viajeId: 'otro-origen' }),
      ],
      BOLETO,
      AHORA,
    );
    expect(lista).toEqual([]);
  });

  it('deja afuera lo cancelado, lo lleno, lo cerrado y lo que ya salió', () => {
    const lista = alternativasParaBoleto(
      [
        salida({ estado: 'cancelado', viajeId: 'cancelado' }),
        salida({ asientosLibres: 0, viajeId: 'lleno' }),
        salida({ ventaAbierta: false, viajeId: 'cerrado' }),
        salida({ salida: new Date('2026-11-15T09:00:00'), viajeId: 'pasado' }),
      ],
      BOLETO,
      AHORA,
    );
    expect(lista).toEqual([]);
  });

  it('no pasa del máximo', () => {
    const muchas = [1, 2, 3, 4, 5].map((n) =>
      salida({ salida: new Date(`2026-11-15T1${n}:00:00`), viajeId: `v${n}` }),
    );
    expect(alternativasParaBoleto(muchas, BOLETO, AHORA)).toHaveLength(3);
  });
});

describe('pasajeroParaReubicar', () => {
  it('conserva el nombre, la cédula y si es para otra persona', () => {
    expect(pasajeroParaReubicar(BOLETO, 7)).toEqual({
      asiento: 7,
      cedula: '001-010190-0001A',
      nombre: 'Ana Ruiz',
      paraOtro: true,
    });
  });
});

describe('primerAsientoLibre', () => {
  it('devuelve un asiento libre de un viaje de la muestra', () => {
    const datos = crearMuestra(AHORA);
    const viaje = datos.viajes[0];
    expect(viaje).toBeDefined();
    const asiento = primerAsientoLibre(datos, viaje!.id, AHORA);
    expect(typeof asiento).toBe('number');
  });

  it('nulo si el viaje no existe', () => {
    expect(primerAsientoLibre(crearMuestra(AHORA), 'nada', AHORA)).toBeNull();
  });
});
