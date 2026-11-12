import { describe, expect, it } from '@jest/globals';

import {
  PERFIL_VACIO,
  correoValido,
  iniciales,
  leerPerfil,
  nombreCompleto,
  nombrePropio,
  perfilVacio,
} from './perfil';

describe('iniciales', () => {
  it('toma la primera letra del nombre y del apellido', () => {
    expect(iniciales({ apellido: 'rocha', nombre: 'kisito' })).toBe('KR');
  });

  it('con solo el nombre da una letra', () => {
    expect(iniciales({ apellido: '', nombre: 'Ana' })).toBe('A');
  });

  it('sin nombre da texto vacío', () => {
    expect(iniciales(PERFIL_VACIO)).toBe('');
  });
});

describe('nombreCompleto', () => {
  it('junta nombre y apellido sin espacios de más', () => {
    expect(nombreCompleto({ apellido: ' Rocha ', nombre: ' Ana ' })).toBe(
      'Ana Rocha',
    );
  });
});

describe('perfilVacio', () => {
  it('es vacío sin nombre ni teléfono', () => {
    expect(perfilVacio(PERFIL_VACIO)).toBe(true);
  });

  it('deja de estar vacío con un nombre', () => {
    expect(perfilVacio({ ...PERFIL_VACIO, nombre: 'Ana' })).toBe(false);
  });
});

describe('correoValido', () => {
  it('acepta el correo vacío porque es opcional', () => {
    expect(correoValido('')).toBe(true);
  });

  it('acepta un correo con forma de correo', () => {
    expect(correoValido('ana@correo.com')).toBe(true);
  });

  it('rechaza un correo sin arroba', () => {
    expect(correoValido('ana.correo.com')).toBe(false);
  });
});

describe('leerPerfil', () => {
  it('sin nada guardado devuelve el perfil vacío', () => {
    expect(leerPerfil(null)).toEqual(PERFIL_VACIO);
  });

  it('con texto roto devuelve el perfil vacío', () => {
    expect(leerPerfil('{no es json')).toEqual(PERFIL_VACIO);
  });

  it('completa lo que falte y descarta pasajeros inválidos', () => {
    const perfil = leerPerfil(
      JSON.stringify({
        nombre: 'Ana',
        pasajeros: [{ id: 'p1', nombre: 'Luis' }, { id: 'p2' }, 7],
      }),
    );
    expect(perfil.nombre).toBe('Ana');
    expect(perfil.telefono).toBe('');
    expect(perfil.pasajeros).toEqual([
      { cedula: undefined, id: 'p1', nombre: 'Luis' },
    ]);
  });
});

describe('nombrePropio', () => {
  it('pone en mayúscula la primera letra de cada palabra', () => {
    expect(nombrePropio('kisnner obando')).toBe('Kisnner Obando');
  });

  it('deja en minúscula las partículas en medio del nombre', () => {
    expect(nombrePropio('maría de los ángeles')).toBe('María de los Ángeles');
  });

  it('no toca el resto de las letras', () => {
    expect(nombrePropio('ana McDonald')).toBe('Ana McDonald');
  });

  it('un texto vacío o con solo espacios da vacío', () => {
    expect(nombrePropio('')).toBe('');
    expect(nombrePropio('   ')).toBe('');
  });

  it('colapsa espacios repetidos', () => {
    expect(nombrePropio('  ana   ruiz ')).toBe('Ana Ruiz');
  });
});
