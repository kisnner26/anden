import { describe, expect, it } from 'vitest';

import {
  esquemaCoordenadas,
  esquemaParada,
  esquemaRuta,
  esquemaTerminal,
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
