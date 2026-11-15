import { describe, expect, it } from '@jest/globals';

import { renderPantalla } from '@/pruebas/render';

import { PaginaDeDatos } from './PaginaDeDatos';

const BASE = {
  alto: 320,
  ancho: 340,
  apellido: 'Lanzas Rivas',
  desde: '16 oct',
  fotoUri: null,
  iniciales: 'ML',
  lineasDeLectura: [
    'P<NICLANZAS<RIVAS<<MARVIN<<<<<<<<<<<<<<<<<<<',
    'AN0000042<NIC<012<<<<<<<<<<<<<<<<<<<<<<<<<<<',
  ] as [string, string],
  nivel: 'Viajero',
  nombre: 'Marvin',
  numero: 'AN0000042',
};

describe('PaginaDeDatos', () => {
  it('muestra los datos de la persona y las líneas de lectura', async () => {
    const p = await renderPantalla(<PaginaDeDatos {...BASE} />);
    expect(p.getByText('Lanzas Rivas')).toBeTruthy();
    expect(p.getByText('Marvin')).toBeTruthy();
    expect(p.getByText('Viajero')).toBeTruthy();
    expect(p.getByText('16 oct')).toBeTruthy();
    expect(p.getByText(BASE.lineasDeLectura[0])).toBeTruthy();
    expect(p.getByText('ML')).toBeTruthy();
  });

  it('sin viajes deja la fecha en una raya', async () => {
    const p = await renderPantalla(<PaginaDeDatos {...BASE} desde="" />);
    expect(p.getByText('—')).toBeTruthy();
  });
});
