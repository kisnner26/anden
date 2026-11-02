import { describe, expect, it } from 'vitest';

import {
  esquemaAsiento,
  esquemaBus,
  esquemaChofer,
  esquemaCoordenadas,
  esquemaParada,
  esquemaRuta,
  esquemaTerminal,
  esquemaViaje,
} from './esquemas';

const coordenadas = { lat: 12.1328, lng: -86.2504 };

const terminal = {
  id: 'ter_uca',
  nombre: 'Terminal UCA',
  ciudad: 'Managua',
  codigo: 'UCA',
  coordenadas,
  andenes: 6,
};

const ruta = {
  id: 'rut_uca_gra',
  origenId: 'ter_uca',
  destinoId: 'ter_gra',
  paradas: [
    { tipo: 'terminal', terminalId: 'ter_uca', minutosDesdeOrigen: 0 },
    {
      tipo: 'punto',
      nombre: 'Nandasmo',
      coordenadas,
      minutosDesdeOrigen: 35,
    },
    { tipo: 'terminal', terminalId: 'ter_gra', minutosDesdeOrigen: 55 },
  ],
  distanciaKm: 45,
  duracionMin: 55,
  tarifaBase: 46,
};

describe('esquemaCoordenadas', () => {
  it('acepta coordenadas dentro de rango', () => {
    expect(esquemaCoordenadas.safeParse(coordenadas).success).toBe(true);
  });

  it('rechaza latitud o longitud fuera de rango', () => {
    expect(esquemaCoordenadas.safeParse({ lat: 91, lng: 0 }).success).toBe(
      false,
    );
    expect(esquemaCoordenadas.safeParse({ lat: 0, lng: -181 }).success).toBe(
      false,
    );
  });
});

describe('esquemaTerminal', () => {
  it('acepta una terminal completa', () => {
    expect(esquemaTerminal.safeParse(terminal).success).toBe(true);
  });

  it('rechaza un código que no son tres letras mayúsculas', () => {
    expect(
      esquemaTerminal.safeParse({ ...terminal, codigo: 'uca' }).success,
    ).toBe(false);
    expect(
      esquemaTerminal.safeParse({ ...terminal, codigo: 'UCAS' }).success,
    ).toBe(false);
  });

  it('rechaza una terminal sin andenes', () => {
    expect(esquemaTerminal.safeParse({ ...terminal, andenes: 0 }).success).toBe(
      false,
    );
  });
});

describe('esquemaParada', () => {
  it('acepta una parada de terminal y una de punto', () => {
    expect(esquemaParada.safeParse(ruta.paradas[0]).success).toBe(true);
    expect(esquemaParada.safeParse(ruta.paradas[1]).success).toBe(true);
  });

  it('rechaza un tipo desconocido y minutos negativos', () => {
    expect(
      esquemaParada.safeParse({ tipo: 'ciudad', minutosDesdeOrigen: 0 })
        .success,
    ).toBe(false);
    expect(
      esquemaParada.safeParse({
        tipo: 'terminal',
        terminalId: 'ter_uca',
        minutosDesdeOrigen: -1,
      }).success,
    ).toBe(false);
  });
});

describe('esquemaRuta', () => {
  it('acepta una ruta completa', () => {
    expect(esquemaRuta.safeParse(ruta).success).toBe(true);
  });

  it('rechaza origen igual al destino', () => {
    expect(
      esquemaRuta.safeParse({ ...ruta, destinoId: ruta.origenId }).success,
    ).toBe(false);
  });

  it('rechaza tarifa o duración que no son enteros positivos', () => {
    expect(esquemaRuta.safeParse({ ...ruta, tarifaBase: 45.5 }).success).toBe(
      false,
    );
    expect(esquemaRuta.safeParse({ ...ruta, duracionMin: 0 }).success).toBe(
      false,
    );
  });
});

const bus = {
  id: 'bus_01',
  placa: 'M 245-118',
  cooperativa: 'Cooperativa de muestra',
  tipo: 'interlocal',
  configuracion: 'coaster26',
  comodidades: ['aire-acondicionado', 'carga-usb'],
};

const chofer = {
  id: 'cho_01',
  nombre: 'Ernesto Calero',
  fotoUrl: 'choferes/cho_01.png',
  aniosManejando: 11,
  licenciaVerificada: true,
  viajesRealizados: 3200,
};

const viaje = {
  id: 'via_01',
  rutaId: 'rut_uca_gra',
  busId: 'bus_01',
  choferId: 'cho_01',
  salida: '2026-11-02T14:40:00-06:00',
  anden: 4,
  estado: 'programado',
  minutosAtraso: 0,
};

describe('esquemaBus', () => {
  it('acepta un bus completo', () => {
    expect(esquemaBus.safeParse(bus).success).toBe(true);
  });

  it('rechaza tipo, configuración o comodidad desconocidos', () => {
    expect(esquemaBus.safeParse({ ...bus, tipo: 'lujo' }).success).toBe(false);
    expect(
      esquemaBus.safeParse({ ...bus, configuracion: 'bus99' }).success,
    ).toBe(false);
    expect(
      esquemaBus.safeParse({ ...bus, comodidades: ['jacuzzi'] }).success,
    ).toBe(false);
  });
});

describe('esquemaChofer', () => {
  it('acepta un chofer completo', () => {
    expect(esquemaChofer.safeParse(chofer).success).toBe(true);
  });

  it('rechaza años o viajes negativos y nombre vacío', () => {
    expect(
      esquemaChofer.safeParse({ ...chofer, aniosManejando: -1 }).success,
    ).toBe(false);
    expect(
      esquemaChofer.safeParse({ ...chofer, viajesRealizados: -5 }).success,
    ).toBe(false);
    expect(esquemaChofer.safeParse({ ...chofer, nombre: '  ' }).success).toBe(
      false,
    );
  });
});

describe('esquemaViaje', () => {
  it('acepta un viaje con fecha ISO y con desfase horario', () => {
    expect(esquemaViaje.safeParse(viaje).success).toBe(true);
    expect(
      esquemaViaje.safeParse({ ...viaje, salida: '2026-11-02T20:40:00Z' })
        .success,
    ).toBe(true);
  });

  it('rechaza una fecha que no es ISO 8601', () => {
    expect(
      esquemaViaje.safeParse({ ...viaje, salida: '2 de noviembre 2:40 pm' })
        .success,
    ).toBe(false);
  });

  it('rechaza estado desconocido y atraso negativo', () => {
    expect(
      esquemaViaje.safeParse({ ...viaje, estado: 'perdido' }).success,
    ).toBe(false);
    expect(
      esquemaViaje.safeParse({ ...viaje, minutosAtraso: -10 }).success,
    ).toBe(false);
  });
});

describe('esquemaAsiento', () => {
  it('acepta un asiento y rechaza número cero o tipo desconocido', () => {
    const asiento = { numero: 8, fila: 2, columna: 3, tipo: 'ventana' };
    expect(esquemaAsiento.safeParse(asiento).success).toBe(true);
    expect(esquemaAsiento.safeParse({ ...asiento, numero: 0 }).success).toBe(
      false,
    );
    expect(
      esquemaAsiento.safeParse({ ...asiento, tipo: 'techo' }).success,
    ).toBe(false);
  });
});
