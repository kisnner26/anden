import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it } from '@jest/globals';

import { CLAVE_BOLETOS, ProveedorBoletos } from '@/datos/ProveedorBoletos';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { ResumenAnual } from './ResumenAnual';

beforeEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
});

function dibujar() {
  return renderPantalla(
    <ProveedorBoletos>
      <ResumenAnual alVolver={() => undefined} />
    </ProveedorBoletos>,
  );
}

describe('ResumenAnual', () => {
  it('sin viajes explica qué se va a ver', async () => {
    const p = await dibujar();
    expect(await p.findByText(/aquí vas a ver tu año/)).toBeTruthy();
  });

  it('con un viaje hecho muestra la tarjeta y deja compartir', async () => {
    const hoy = new Date();
    // un día de este año ya pasado: hace 1 hora
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([boletoDePrueba(new Date(hoy.getTime() - 3_600_000), 8)]),
    );
    const p = await dibujar();
    expect(await p.findByTestId('tarjeta-resumen-anual')).toBeTruthy();
    expect(p.getByText('Tu asiento favorito')).toBeTruthy();
    expect(p.getByRole('button', { name: 'Compartir mi año' })).toBeTruthy();
  });
});
