import { describe, expect, it } from '@jest/globals';

import { crearMuestra } from './muestra';
import { viajeEnVivoEntre } from './seguimiento';

const datos = crearMuestra(new Date('2026-11-12T18:00:00.000Z'));
const viajeAManagua = datos.viajes.find(
  (viaje) => viaje.rutaId === 'rut_boa_may',
)!;
const viajeABoaco = datos.viajes.find(
  (viaje) => viaje.rutaId === 'rut_may_boa',
)!;

describe('viajeEnVivoEntre', () => {
  it('encuentra el viaje compartido que une las dos ciudades en ese sentido', () => {
    expect(viajeEnVivoEntre(datos, [viajeABoaco.id], 'Managua', 'Boaco')).toBe(
      viajeABoaco.id,
    );
  });

  it('no mezcla los sentidos', () => {
    expect(
      viajeEnVivoEntre(datos, [viajeABoaco.id], 'Boaco', 'Managua'),
    ).toBeNull();
    expect(
      viajeEnVivoEntre(datos, [viajeAManagua.id], 'Boaco', 'Managua'),
    ).toBe(viajeAManagua.id);
  });

  it('sin viajes compartidos devuelve null', () => {
    expect(viajeEnVivoEntre(datos, [], 'Managua', 'Boaco')).toBeNull();
    expect(
      viajeEnVivoEntre(datos, ['via_inexistente'], 'Managua', 'Boaco'),
    ).toBeNull();
  });
});
