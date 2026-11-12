import type { CuentaMuestra } from './sesion';

/**
 * cuentas solo para desarrollo, de los dos roles. Con Supabase las cuentas de conductor las crea
 * la cooperativa y el rol sale de la tabla de perfiles; estos datos desaparecen.
 */
export const CLAVE_DE_MUESTRA = '2026';

export const CUENTAS_MUESTRA: readonly CuentaMuestra[] = [
  {
    clave: CLAVE_DE_MUESTRA,
    identificador: '1001',
    sesion: { choferId: 'cho_1', nombre: 'Ernesto Calero', rol: 'conductor' },
  },
  {
    clave: CLAVE_DE_MUESTRA,
    identificador: '1002',
    sesion: { choferId: 'cho_2', nombre: 'Marvin Lanzas', rol: 'conductor' },
  },
  {
    clave: CLAVE_DE_MUESTRA,
    identificador: '1003',
    sesion: { choferId: 'cho_3', nombre: 'Iván Obando', rol: 'conductor' },
  },
  {
    clave: CLAVE_DE_MUESTRA,
    identificador: '1004',
    sesion: { choferId: 'cho_4', nombre: 'Rosario Téllez', rol: 'conductor' },
  },
  {
    clave: CLAVE_DE_MUESTRA,
    identificador: 'ana@correo.com',
    sesion: { nombre: 'Ana Ruiz', rol: 'pasajero' },
  },
];
