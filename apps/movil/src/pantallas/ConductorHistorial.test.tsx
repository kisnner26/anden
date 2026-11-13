import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { ProveedorCierres } from '@/datos/ProveedorCierres';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { renderPantalla } from '@/pruebas/render';
import { CLAVE_CIERRES, type CierreViaje } from '@/servicios/cierres';

import { ConductorHistorial } from './ConductorHistorial';

function cierre(
  viajeId: string,
  choferId: string,
  cobrado: number,
): CierreViaje {
  return {
    cerradoEn: '2026-11-12T20:00:00.000Z',
    choferId,
    cobrado,
    pagados: 2,
    pasajeros: 3,
    pendiente: 40,
    sinPagar: [{ asiento: 4, boletoId: 'b', nombre: 'Luis', precio: 40 }],
    total: cobrado + 40,
    viajeId,
  };
}

beforeEach(async () => {
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'anden.sesion',
    JSON.stringify({ choferId: 'cho_2', nombre: 'Marvin', rol: 'conductor' }),
  );
});

function dibujar() {
  return renderPantalla(
    <ProveedorSesion>
      <ProveedorCierres>
        <ConductorHistorial />
      </ProveedorCierres>
    </ProveedorSesion>,
  );
}

describe('ConductorHistorial', () => {
  it('avisa cuando todavía no cerró ningún viaje', async () => {
    const pantalla = await dibujar();
    expect(
      await pantalla.findByText(/Todavía no cerraste ningún viaje/),
    ).toBeTruthy();
  });

  it('suma solo lo cobrado en sus propios viajes', async () => {
    await AsyncStorage.setItem(
      CLAVE_CIERRES,
      JSON.stringify([
        cierre('via_a', 'cho_2', 80),
        cierre('via_b', 'cho_2', 120),
        cierre('via_c', 'cho_9', 999),
      ]),
    );
    const pantalla = await dibujar();
    expect(await pantalla.findByText('C$ 200')).toBeTruthy();
    expect(pantalla.queryByText('C$ 999')).toBeNull();
    expect(pantalla.getAllByText('Sin pagar: 1')).toHaveLength(2);
  });
});
