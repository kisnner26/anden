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

  it('muestra un boleto próximo en su sección', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([boletoDePrueba(EN_UNA_HORA())]),
    );
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Tu próximo viaje')).toBeTruthy();
    expect(pantalla.getByText('Andén 4 · Asiento 8')).toBeTruthy();
    expect(pantalla.queryByText('Próximos')).toBeNull();
    expect(pantalla.queryByText('Pasados')).toBeNull();
  });

  it('destaca el boleto con la salida más cercana', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([
        boletoDePrueba(new Date(Date.now() + 2 * 60 * 60_000), 8, 'P3NS6TW4'),
        boletoDePrueba(new Date(Date.now() + 60 * 60_000), 9, 'K7RM4QX9'),
      ]),
    );
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Tu próximo viaje')).toBeTruthy();
    expect(pantalla.getByLabelText('Tu próximo viaje Boaco')).toBeTruthy();
    expect(pantalla.getByText('Próximos')).toBeTruthy();
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
    expect(await pantalla.findByText('Tu próximo viaje')).toBeTruthy();
    expect(pantalla.queryByText('Próximos')).toBeNull();
    expect(pantalla.getByText('Pasados')).toBeTruthy();
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

  it('muestra solo los 3 pasados más recientes y deja desplegar el resto', async () => {
    const pasados = [1, 2, 3, 4, 5].map((horas) =>
      boletoDePrueba(
        new Date(Date.now() - horas * 3_600_000),
        horas,
        `PASADO${horas}X`,
      ),
    );
    await AsyncStorage.setItem(CLAVE_BOLETOS, JSON.stringify(pasados));
    const pantalla = await dibujar();
    expect(await pantalla.findAllByText('Boaco')).toHaveLength(3);

    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Ver los 2 anteriores' }),
    );
    expect(pantalla.getAllByText('Boaco')).toHaveLength(5);

    await fireEvent.press(pantalla.getByRole('button', { name: 'Ver menos' }));
    expect(pantalla.getAllByText('Boaco')).toHaveLength(3);
  });

  it('con 3 pasados o menos no ofrece desplegar nada', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([boletoDePrueba(HACE_UNA_HORA())]),
    );
    const pantalla = await dibujar();
    await pantalla.findAllByText('Boaco');
    expect(pantalla.queryByText(/anteriores/)).toBeNull();
  });
});
