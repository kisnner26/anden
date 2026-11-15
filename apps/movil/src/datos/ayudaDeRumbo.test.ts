import { describe, expect, it } from '@jest/globals';

import {
  ayudaPorDefecto,
  descripcionDelApuro,
  esRespuestaUtil,
  nombreDePantalla,
  pantallaDeRuta,
} from './ayudaDeRumbo';
import type { SenalDeAyuda } from './senalesDeAyuda';

const TODAS: SenalDeAyuda[] = [
  'errorFormulario',
  'errorIngreso',
  'reservaFallida',
  'sinConexion',
  'toquesRepetidos',
];

describe('ayudaDeRumbo', () => {
  it('hay una ayuda escrita y una descripción para cada motivo', () => {
    for (const motivo of TODAS) {
      expect(ayudaPorDefecto(motivo).length).toBeGreaterThan(20);
      expect(descripcionDelApuro(motivo).length).toBeGreaterThan(20);
    }
  });

  it('reconoce la pantalla por la ruta', () => {
    expect(pantallaDeRuta('/ajustes')).toBe('ajustes');
    expect(pantallaDeRuta('/ingresar')).toBe('ingreso');
    expect(pantallaDeRuta('/boleto/bol_1')).toBe('boleto');
    expect(pantallaDeRuta('/algo-raro')).toBe('general');
    expect(nombreDePantalla('ingreso')).toMatch(/ingreso/);
  });

  it('en cada pantalla da la ayuda que le toca y si no, la general', () => {
    expect(ayudaPorDefecto('toquesRepetidos', 'ajustes')).toMatch(/ajustes/i);
    expect(ayudaPorDefecto('errorIngreso', 'ingreso')).toMatch(/ojito/);
    expect(ayudaPorDefecto('sinConexion', 'ajustes')).toBe(
      ayudaPorDefecto('sinConexion'),
    );
  });
});

describe('esRespuestaUtil', () => {
  it('acepta una frase directa y concreta', () => {
    expect(
      esRespuestaUtil(
        'Revisá que tu usuario y tu contraseña estén bien escritos antes de volver a intentar.',
      ),
    ).toBe(true);
  });

  it('rechaza a quien se presenta, saluda o dice tranquilo, como en la respuesta tonta que salió', () => {
    expect(
      esRespuestaUtil(
        "Tranquilo, sos Rumbo, que aquí estoy pa' ayudar, pero nada responde.",
      ),
    ).toBe(false);
    expect(
      esRespuestaUtil(
        'Hola, soy Rumbo y te voy a ayudar con tu viaje de hoy mismo.',
      ),
    ).toBe(false);
  });

  it('rechaza lo muy corto, las preguntas y lo que no termina en punto', () => {
    expect(esRespuestaUtil('Probá de nuevo.')).toBe(false);
    expect(
      esRespuestaUtil(
        '¿Querés que te ayude a elegir otro asiento disponible ahora?',
      ),
    ).toBe(false);
    expect(
      esRespuestaUtil(
        'Elegí otro asiento libre y reservá de nuevo ahora mismo sin esperar',
      ),
    ).toBe(false);
  });
});
