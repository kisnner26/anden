import { describe, expect, it } from '@jest/globals';

import { boletoDePrueba } from '@/pruebas/boletos';

import { avisoDeAlteracion, consejoDeViaje } from './consejoDeViaje';
import type { Salida } from './salidas';

const TERMINALES = [
  { ciudad: 'Managua', coordenadas: { lat: 12.1364, lng: -86.2514 } },
  { ciudad: 'Boaco', coordenadas: { lat: 12.4725, lng: -85.6598 } },
];

describe('consejoDeViaje', () => {
  const boleto = boletoDePrueba(new Date(2026, 10, 20, 15, 0));

  it('dice a qué hora estar en el punto de encuentro y cuándo sale', () => {
    const [primera] = consejoDeViaje(boleto, TERMINALES);
    expect(primera).toContain('punto de encuentro a las');
    expect(primera).toContain('a Boaco');
  });

  it('dice de qué lado pega el sol cuando hay terminales', () => {
    const lineas = consejoDeViaje(boleto, TERMINALES);
    expect(lineas).toHaveLength(2);
    expect(lineas[1]).toMatch(/sol/);
  });

  it('sin terminales conocidas deja solo el plan', () => {
    expect(consejoDeViaje(boleto, [])).toHaveLength(1);
  });
});

describe('avisoDeAlteracion', () => {
  const AHORA = new Date(2026, 10, 20, 12, 0);
  const guardado = boletoDePrueba(new Date(2026, 10, 20, 15, 0));
  function salida(
    id: string,
    hora: number,
    extra: Partial<Salida> = {},
  ): Salida {
    return {
      asientosLibres: 10,
      choferId: 'cho_1',
      codigoDestino: 'BOA',
      destino: 'Boaco',
      estado: 'programado',
      minutosAtraso: 0,
      origen: 'Managua',
      placa: 'M 1',
      puntoEncuentro: 'x',
      rutaId: 'r',
      salida: new Date(2026, 10, 20, hora, 0),
      servicio: 'ordinario',
      tarifa: 46,
      ventaAbierta: true,
      viajeId: id,
      ...extra,
    };
  }

  it('no dice nada si el viaje va normal', () => {
    expect(
      avisoDeAlteracion(guardado, [salida('via_2', 15)], AHORA, null),
    ).toEqual([]);
  });

  it('avisa el atraso y propone otra salida del mismo trayecto', () => {
    const lineas = avisoDeAlteracion(
      guardado,
      [
        salida('via_2', 15, { estado: 'atrasado', minutosAtraso: 40 }),
        salida('via_9', 16),
      ],
      AHORA,
      null,
    );
    expect(lineas[0]).toContain('40 minutos de atraso');
    expect(lineas[1]).toContain('alternativa');
  });

  it('avisa la cancelación aunque no haya alternativa', () => {
    const lineas = avisoDeAlteracion(
      guardado,
      [salida('via_2', 15, { estado: 'cancelado' })],
      AHORA,
      null,
    );
    expect(lineas).toHaveLength(1);
    expect(lineas[0]).toContain('cancelado');
  });
});
