import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CLAVE_BOLETOS, ProveedorBoletos } from '@/datos/ProveedorBoletos';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { Pasaporte } from './Pasaporte';

beforeEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
});

function dibujar() {
  return renderPantalla(
    <ProveedorBoletos>
      <Pasaporte alVolver={() => undefined} />
    </ProveedorBoletos>,
  );
}

describe('Pasaporte', () => {
  it('sin viajes invita a viajar y deja los sellos vacíos', async () => {
    const p = await dibujar();
    expect(
      await p.findByText('Cada ciudad a la que llegues deja su sello aquí.'),
    ).toBeTruthy();
    expect(p.getByLabelText('Sello de Boaco, todavía sin ganar')).toBeTruthy();
  });

  it('un viaje hecho a Boaco gana su sello', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([boletoDePrueba(new Date(Date.now() - 24 * 3_600_000))]),
    );
    const p = await dibujar();
    expect(await p.findByLabelText('Sello de Boaco, 1 llegadas')).toBeTruthy();
    expect(p.getByText('Las tres ciudades')).toBeTruthy();
  });
});

describe('Pasaporte: libreta', () => {
  it('muestra la página de datos, el nivel y las cifras con viajes hechos', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([
        boletoDePrueba(new Date(Date.now() - 48 * 3_600_000), 8, 'AAAA1111'),
        boletoDePrueba(new Date(Date.now() - 24 * 3_600_000), 9, 'BBBB2222'),
      ]),
    );
    const p = await dibujar();
    expect((await p.findAllByText('Pasajero')).length).toBe(2);
    expect(p.getByTestId('pagina-de-datos')).toBeTruthy();
    expect(p.getByLabelText('Viajes: 2')).toBeTruthy();
    expect(
      p.getByText('Te faltan 3 viajes para ser Viajero frecuente.'),
    ).toBeTruthy();
  });

  it('los sellos raros que faltan muestran su avance', async () => {
    const p = await dibujar();
    expect(await p.findByText('Las tres ciudades')).toBeTruthy();
    expect(p.getAllByText('0 / 3').length).toBeGreaterThan(0);
  });
});
