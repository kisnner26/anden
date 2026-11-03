import { describe, expect, it } from '@jest/globals';

import { armarDetalle, armarPerfilChofer } from './detalle';
import { crearMuestra, VIAJE_BOACO } from './muestra';

const AHORA = new Date('2026-11-02T20:00:00.000Z');
const datos = crearMuestra(AHORA);

describe('armarPerfilChofer', () => {
  it('trae los datos del chofer y sus iniciales', () => {
    const perfil = armarPerfilChofer(datos, 'cho_2');
    expect(perfil?.nombre).toBe('Marvin Lanzas');
    expect(perfil?.iniciales).toBe('ML');
    expect(perfil?.licenciaVerificada).toBe(true);
  });

  it('calcula el promedio con las notas de muestra', () => {
    const perfil = armarPerfilChofer(datos, 'cho_1');
    expect(perfil?.totalCalificaciones).toBe(15);
    expect(perfil?.promedio).toBe(4.7);
  });

  it('ordena las etiquetas de la más repetida a la menos', () => {
    const perfil = armarPerfilChofer(datos, 'cho_1');
    expect(perfil?.etiquetas[0]?.cantidad).toBeGreaterThanOrEqual(
      perfil?.etiquetas[1]?.cantidad ?? 0,
    );
    expect(perfil?.etiquetas.length).toBeLessThanOrEqual(3);
  });

  it('devuelve nulo si el chofer no existe', () => {
    expect(armarPerfilChofer(datos, 'cho_inexistente')).toBeNull();
  });
});

describe('armarDetalle', () => {
  const detalle = armarDetalle(datos, VIAJE_BOACO, AHORA);

  it('trae la unidad con su placa, su cooperativa y sus plazas', () => {
    expect(detalle?.unidad.placa).toBe('M 222-114');
    expect(detalle?.unidad.cooperativa).toBe('Cooperativa de muestra');
    expect(detalle?.unidad.plazas).toBe(26);
  });

  it('trae el chofer que maneja ese viaje', () => {
    expect(detalle?.chofer.nombre).toBe('Marvin Lanzas');
  });

  it('calcula la llegada con la duración de la ruta', () => {
    const salida = detalle?.salida.salida.getTime() ?? 0;
    expect(detalle?.llegada.getTime()).toBe(salida + 100 * 60_000);
  });

  it('lista las dos paradas con su hora', () => {
    expect(detalle?.paradas.map((parada) => parada.nombre)).toEqual([
      'Terminal UCA',
      'Terminal Boaco',
    ]);
    const primera = detalle?.paradas[0]?.hora.getTime() ?? 0;
    const ultima = detalle?.paradas[1]?.hora.getTime() ?? 0;
    expect(ultima - primera).toBe(100 * 60_000);
  });

  it('devuelve nulo si el viaje no existe', () => {
    expect(armarDetalle(datos, 'via_inexistente', AHORA)).toBeNull();
  });
});
