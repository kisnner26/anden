import type { BoletoGuardado } from './reserva';

export type CiudadDelSello = 'Boaco' | 'Juigalpa' | 'Managua';

export type RarezaDelSello =
  'constante' | 'madrugador' | 'nocturno' | 'tresCiudades' | 'viajero';

export interface SelloDeCiudad {
  ciudad: CiudadDelSello;
  /** cuántas veces se llegó a esa ciudad; cero si todavía no hay sello */
  llegadas: number;
  /** el primer viaje a esa ciudad, en ISO; nulo si no hay */
  primera: string | null;
}

export interface SelloRaro {
  /** lo que ya se logró y lo que se pide, para mostrar el avance de los que faltan */
  avance: { actual: number; meta: number };
  desbloqueado: boolean;
  id: RarezaDelSello;
  /** cuándo se ganó, en ISO; nulo si todavía no */
  cuando: string | null;
}

export interface Pasaporte {
  ciudades: SelloDeCiudad[];
  raros: SelloRaro[];
  viajes: number;
}

export const CIUDADES_DEL_PASAPORTE: readonly CiudadDelSello[] = [
  'Managua',
  'Boaco',
  'Juigalpa',
];

/** viajes que se hacen de verdad: no cancelados y con la salida ya pasada */
export function viajesHechos(
  boletos: readonly BoletoGuardado[],
  ahora: Date,
): BoletoGuardado[] {
  return boletos
    .filter(
      (b) =>
        b.boleto.estado !== 'cancelado' &&
        new Date(b.resumen.salida).getTime() <= ahora.getTime(),
    )
    .sort(
      (a, b) =>
        new Date(a.resumen.salida).getTime() -
        new Date(b.resumen.salida).getTime(),
    );
}

/** la ciudad a la que se llegó: el destino del boleto, con el nombre de la ciudad y no de la terminal */
function ciudadDeLlegada(b: BoletoGuardado): CiudadDelSello | null {
  const destino = b.resumen.destino;
  return (
    CIUDADES_DEL_PASAPORTE.find((ciudad) => destino.includes(ciudad)) ?? null
  );
}

/**
 * el pasaporte de quien viaja: un sello por ciudad a la que llegó y sellos raros por cómo viajó (de madrugada, de noche,
 * muchas veces al mismo lugar, las tres ciudades). Todo sale de los boletos ya viajados
 */
export function armarPasaporte(
  boletos: readonly BoletoGuardado[],
  ahora: Date,
): Pasaporte {
  const hechos = viajesHechos(boletos, ahora);
  const ciudades = CIUDADES_DEL_PASAPORTE.map<SelloDeCiudad>((ciudad) => {
    const llegadas = hechos.filter((b) => ciudadDeLlegada(b) === ciudad);
    return {
      ciudad,
      llegadas: llegadas.length,
      primera: llegadas[0]?.resumen.salida ?? null,
    };
  });

  const cuando = (predicado: (b: BoletoGuardado) => boolean): string | null =>
    hechos.find(predicado)?.resumen.salida ?? null;
  const hora = (b: BoletoGuardado) => new Date(b.resumen.salida).getHours();

  const madrugador = cuando((b) => hora(b) < 6);
  const nocturno = cuando((b) => hora(b) >= 21);
  const visitadas = ciudades.filter((c) => c.llegadas > 0);
  const tres = visitadas.length === CIUDADES_DEL_PASAPORTE.length;
  const constante = ciudades.find((c) => c.llegadas >= 5);
  const viajero = hechos.length >= 10 ? hechos[9]!.resumen.salida : null;
  const ultimaPrimera = tres
    ? [...visitadas]
        .map((c) => c.primera as string)
        .sort((a, b) => new Date(b).getTime() - new Date(a).getTime())[0]!
    : null;

  const mejorLlegadas = Math.max(0, ...ciudades.map((c) => c.llegadas));
  const avance = (actual: number, meta: number) => ({
    actual: Math.min(actual, meta),
    meta,
  });

  return {
    ciudades,
    raros: [
      {
        avance: avance(madrugador !== null ? 1 : 0, 1),
        cuando: madrugador,
        desbloqueado: madrugador !== null,
        id: 'madrugador',
      },
      {
        avance: avance(nocturno !== null ? 1 : 0, 1),
        cuando: nocturno,
        desbloqueado: nocturno !== null,
        id: 'nocturno',
      },
      {
        avance: avance(mejorLlegadas, 5),
        cuando: constante?.primera ?? null,
        desbloqueado: constante !== undefined,
        id: 'constante',
      },
      {
        avance: avance(visitadas.length, CIUDADES_DEL_PASAPORTE.length),
        cuando: ultimaPrimera,
        desbloqueado: tres,
        id: 'tresCiudades',
      },
      {
        avance: avance(hechos.length, 10),
        cuando: viajero,
        desbloqueado: viajero !== null,
        id: 'viajero',
      },
    ],
    viajes: hechos.length,
  };
}
