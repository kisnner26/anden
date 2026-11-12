import type { CuentaConductor } from './sesion';

/**
 * cuentas de conductor solo para desarrollo, una por cada chofer de la muestra. Con Supabase las
 * cuentas las crea la cooperativa y estos datos desaparecen.
 */
export const CLAVE_DE_MUESTRA = '2026';

export const CUENTAS_CONDUCTOR_MUESTRA: readonly CuentaConductor[] = [
  {
    choferId: 'cho_1',
    clave: CLAVE_DE_MUESTRA,
    codigo: '1001',
    nombre: 'Ernesto Calero',
  },
  {
    choferId: 'cho_2',
    clave: CLAVE_DE_MUESTRA,
    codigo: '1002',
    nombre: 'Marvin Lanzas',
  },
  {
    choferId: 'cho_3',
    clave: CLAVE_DE_MUESTRA,
    codigo: '1003',
    nombre: 'Iván Obando',
  },
  {
    choferId: 'cho_4',
    clave: CLAVE_DE_MUESTRA,
    codigo: '1004',
    nombre: 'Rosario Téllez',
  },
];
