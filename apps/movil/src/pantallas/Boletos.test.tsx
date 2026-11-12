import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { ProveedorBoletos, CLAVE_BOLETOS } from '@/datos/ProveedorBoletos';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { Boletos } from './Boletos';

beforeEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
});

function dibujar(propiedades: Partial<Parameters<typeof Boletos>[0]> = {}) {
  return renderPantalla(
    <ProveedorBoletos>
      <Boletos
        alAbrirBoleto={() => undefined}
        alBuscar={() => undefined}
        {...propiedades}
      />
    </ProveedorBoletos>,
  );
}

const EN_UNA_HORA = () => new Date(Date.now() + 60 * 60_000);
const HACE_UNA_HORA = () => new Date(Date.now() - 60 * 60_000);

describe('Boletos', () => {
  it('muestra el estado vacío cuando no hay boletos', async () => {
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Todavía no tenés boletos')).toBeTruthy();
  });

  it('lleva a buscar salidas desde el estado vacío', async () => {
    const alBuscar = jest.fn();
    const pantalla = await dibujar({ alBuscar });
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Buscar salidas' }),
    );
    expect(alBuscar).toHaveBeenCalledTimes(1);
  });

  it('muestra un boleto próximo como tarjeta', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([boletoDePrueba(EN_UNA_HORA())]),
    );
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Próximos')).toBeTruthy();
    expect(pantalla.getByText('Asiento')).toBeTruthy();
    expect(pantalla.queryByText('Pasados')).toBeNull();
  });

  it('muestra varios boletos próximos en un carrusel y abre el que se toca', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([
        boletoDePrueba(new Date(Date.now() + 2 * 60 * 60_000), 8, 'P3NS6TW4'),
        boletoDePrueba(new Date(Date.now() + 60 * 60_000), 9, 'K7RM4QX9'),
      ]),
    );
    const alAbrirBoleto = jest.fn();
    const pantalla = await dibujar({ alAbrirBoleto });
    await fireEvent.press(
      await pantalla.findByLabelText(/^Boaco, .*Asiento 9$/),
    );
    expect(alAbrirBoleto).toHaveBeenCalledWith('bol_K7RM4QX9');
    expect(pantalla.getByLabelText(/^Boaco, .*Asiento 8$/)).toBeTruthy();
  });

  it('separa los boletos pasados', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([
        boletoDePrueba(EN_UNA_HORA(), 8, 'K7RM4QX9'),
        boletoDePrueba(HACE_UNA_HORA(), 9, 'P3NS6TW4'),
      ]),
    );
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Próximos')).toBeTruthy();
    expect(pantalla.getByText('Tu historial')).toBeTruthy();
  });

  it('abre el boleto que se presiona', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([boletoDePrueba(EN_UNA_HORA())]),
    );
    const alAbrirBoleto = jest.fn();
    const pantalla = await dibujar({ alAbrirBoleto });
    await fireEvent.press(
      await pantalla.findByRole('button', { name: /Boaco/ }),
    );
    expect(alAbrirBoleto).toHaveBeenCalledWith('bol_K7RM4QX9');
  });

  it('agrupa los viajes hechos por destino y deja ver cada uno', async () => {
    const alAbrirBoleto = jest.fn();
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([
        boletoDePrueba(HACE_UNA_HORA(), 3, 'AAAA1111'),
        boletoDePrueba(new Date(Date.now() - 5 * 3_600_000), 4, 'BBBB2222'),
      ]),
    );
    const pantalla = await dibujar({ alAbrirBoleto });
    await fireEvent.press(
      await pantalla.findByRole('button', { name: /^Boaco, 2 viajes$/ }),
    );
    await fireEvent.press(pantalla.getByRole('button', { name: /Asiento 3$/ }));
    expect(alAbrirBoleto).toHaveBeenCalledWith('bol_AAAA1111');
  });
});
