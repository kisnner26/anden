import { describe, expect, it } from 'vitest';

import {
  esquemaAsiento,
  esquemaBoleto,
  esquemaBus,
  esquemaCalificacion,
  esquemaChofer,
  esquemaCoordenadas,
  esquemaParada,
  esquemaPasajero,
  esquemaPosicionBus,
  esquemaRetencion,
  esquemaRuta,
  esquemaTerminal,
  esquemaTramo,
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

describe('esquemaTramo', () => {
  it('acepta índices de parada en orden', () => {
    expect(esquemaTramo.safeParse({ desde: 0, hasta: 2 }).success).toBe(true);
  });

  it('rechaza un tramo invertido o sin recorrido', () => {
    expect(esquemaTramo.safeParse({ desde: 2, hasta: 0 }).success).toBe(false);
    expect(esquemaTramo.safeParse({ desde: 1, hasta: 1 }).success).toBe(false);
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

const pasajero = { nombre: 'Ana Ruiz', esMenorEnBrazos: false };

const boleto = {
  id: 'bol_01',
  codigo: 'K7RM4QX9',
  viajeId: 'via_01',
  duenoId: 'usu_01',
  asiento: 8,
  pasajero,
  precio: 46,
  estado: 'vigente',
  compradoEn: '2026-11-02T13:50:00-06:00',
};

describe('esquemaRetencion', () => {
  const retencion = {
    id: 'ret_01',
    viajeId: 'via_01',
    asientos: [8, 9],
    expira: '2026-11-02T14:00:00-06:00',
    duenoId: 'usu_01',
  };

  it('acepta una retención con asientos', () => {
    expect(esquemaRetencion.safeParse(retencion).success).toBe(true);
  });

  it('rechaza una retención sin asientos o con asiento cero', () => {
    expect(
      esquemaRetencion.safeParse({ ...retencion, asientos: [] }).success,
    ).toBe(false);
    expect(
      esquemaRetencion.safeParse({ ...retencion, asientos: [0] }).success,
    ).toBe(false);
  });
});

describe('esquemaPasajero', () => {
  it('acepta un pasajero con y sin cédula', () => {
    expect(esquemaPasajero.safeParse(pasajero).success).toBe(true);
    expect(
      esquemaPasajero.safeParse({ ...pasajero, cedula: '001-010190-0001A' })
        .success,
    ).toBe(true);
  });

  it('rechaza nombre vacío y cédula vacía', () => {
    expect(esquemaPasajero.safeParse({ ...pasajero, nombre: '' }).success).toBe(
      false,
    );
    expect(
      esquemaPasajero.safeParse({ ...pasajero, cedula: ' ' }).success,
    ).toBe(false);
  });
});

describe('esquemaBoleto', () => {
  it('acepta un boleto completo', () => {
    expect(esquemaBoleto.safeParse(boleto).success).toBe(true);
  });

  it('rechaza código de largo incorrecto o en minúsculas', () => {
    expect(
      esquemaBoleto.safeParse({ ...boleto, codigo: 'K7RM4QX' }).success,
    ).toBe(false);
    expect(
      esquemaBoleto.safeParse({ ...boleto, codigo: 'k7rm4qx9' }).success,
    ).toBe(false);
  });

  it('rechaza precio con decimales, negativo o estado desconocido', () => {
    expect(esquemaBoleto.safeParse({ ...boleto, precio: 46.5 }).success).toBe(
      false,
    );
    expect(esquemaBoleto.safeParse({ ...boleto, precio: -1 }).success).toBe(
      false,
    );
    expect(
      esquemaBoleto.safeParse({ ...boleto, estado: 'perdido' }).success,
    ).toBe(false);
  });

  it('valida el pasajero anidado', () => {
    expect(
      esquemaBoleto.safeParse({ ...boleto, pasajero: { nombre: '' } }).success,
    ).toBe(false);
  });
});

describe('esquemaCalificacion', () => {
  const calificacion = {
    boletoId: 'bol_01',
    choferId: 'cho_01',
    estrellas: 5,
    etiquetas: ['puntual', 'amable'],
  };

  it('acepta estrellas de 1 a 5', () => {
    for (const estrellas of [1, 2, 3, 4, 5]) {
      expect(
        esquemaCalificacion.safeParse({ ...calificacion, estrellas }).success,
      ).toBe(true);
    }
  });

  it('rechaza 0, 6, decimales y etiquetas desconocidas', () => {
    for (const estrellas of [0, 6, 4.5]) {
      expect(
        esquemaCalificacion.safeParse({ ...calificacion, estrellas }).success,
      ).toBe(false);
    }
    expect(
      esquemaCalificacion.safeParse({ ...calificacion, etiquetas: ['veloz'] })
        .success,
    ).toBe(false);
  });
});

describe('esquemaPosicionBus', () => {
  it('acepta una posición y rechaza coordenadas inválidas', () => {
    const posicion = {
      viajeId: 'via_01',
      coordenadas,
      registradaEn: '2026-11-02T14:45:10-06:00',
    };
    expect(esquemaPosicionBus.safeParse(posicion).success).toBe(true);
    expect(
      esquemaPosicionBus.safeParse({
        ...posicion,
        coordenadas: { lat: 100, lng: 0 },
      }).success,
    ).toBe(false);
  });
});
