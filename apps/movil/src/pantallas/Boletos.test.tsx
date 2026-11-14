import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { ContextoIA, type ValorIA } from '@/datos/useIA';
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
    expect(await pantalla.findByText('Asiento')).toBeTruthy();
    expect(pantalla.queryByRole('tab')).toBeNull();
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

  it('con próximos y pasados ofrece alternar entre los dos', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([
        boletoDePrueba(EN_UNA_HORA(), 8, 'K7RM4QX9'),
        boletoDePrueba(HACE_UNA_HORA(), 9, 'P3NS6TW4'),
      ]),
    );
    const pantalla = await dibujar();
    expect(await pantalla.findByRole('tab', { name: 'Próximos' })).toBeTruthy();
    await fireEvent.press(pantalla.getByRole('tab', { name: 'Historial' }));
    expect(
      await pantalla.findByRole('button', { name: 'Mes anterior' }),
    ).toBeTruthy();
    expect(pantalla.getByText('viajes')).toBeTruthy();
    expect(pantalla.queryByText('Sale en')).toBeNull();
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

  it('muestra los viajes hechos en un calendario y abre los de un día', async () => {
    const alAbrirBoleto = jest.fn();
    const hace = new Date(Date.now() - 3_600_000);
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([
        boletoDePrueba(hace, 3, 'AAAA1111'),
        boletoDePrueba(new Date(hace.getTime() - 60_000), 4, 'BBBB2222'),
      ]),
    );
    const pantalla = await dibujar({ alAbrirBoleto });
    expect(await pantalla.findByText('destinos')).toBeTruthy();
    await fireEvent.press(
      await pantalla.findByRole('button', {
        name: new RegExp(`^Ver los viajes del ${hace.getDate()} `),
      }),
    );
    expect(await pantalla.findAllByText('Viaje hecho')).toHaveLength(2);
    await fireEvent.press(pantalla.getByLabelText(/Asiento 3$/));
    expect(alAbrirBoleto).toHaveBeenCalledWith('bol_AAAA1111');
  });

  it('sin boletos muestra las ciudades con foto que llevan a buscar salidas', async () => {
    const alBuscar = jest.fn();
    const pantalla = await dibujar({ alBuscar });
    await pantalla.findByText('Todavía no tenés boletos');
    expect(pantalla.getByText('A dónde querés ir')).toBeTruthy();
    await fireEvent.press(pantalla.getByRole('link', { name: 'Boaco' }));
    expect(alBuscar).toHaveBeenCalledTimes(1);
  });

  describe('con la IA', () => {
    const ia: ValorIA = {
      activada: true,
      cambiar: async () => undefined,
      cargando: false,
      disponibilidad: 'disponible',
      nombre: 'Apple Intelligence',
      preguntar: async () => '',
      usable: true,
    };

    async function conBoleto(alPreguntar?: (p: string) => void) {
      await AsyncStorage.setItem(
        CLAVE_BOLETOS,
        JSON.stringify([boletoDePrueba(EN_UNA_HORA())]),
      );
      return renderPantalla(
        <ContextoIA.Provider value={ia}>
          <ProveedorBoletos>
            <Boletos
              alAbrirBoleto={() => undefined}
              alBuscar={() => undefined}
              alPreguntar={alPreguntar}
            />
          </ProveedorBoletos>
        </ContextoIA.Provider>,
      );
    }

    it('ofrece resumir los viajes y preguntar sobre ellos', async () => {
      const alPreguntar = jest.fn();
      const pantalla = await conBoleto(alPreguntar);
      expect(
        await pantalla.findByRole('button', {
          name: 'Resumir mis viajes con IA',
        }),
      ).toBeTruthy();
      await fireEvent.press(
        pantalla.getByRole('button', {
          name: '¿A qué hora debo llegar al punto de encuentro?',
        }),
      );
      expect(alPreguntar).toHaveBeenCalledWith(
        '¿A qué hora debo llegar al punto de encuentro?',
      );
    });

    it('en el historial ofrece entender los viajes y preguntar por ellos', async () => {
      const alPreguntar = jest.fn();
      await AsyncStorage.setItem(
        CLAVE_BOLETOS,
        JSON.stringify([
          boletoDePrueba(HACE_UNA_HORA(), 9, 'P3NS6TW4'),
          boletoDePrueba(EN_UNA_HORA(), 8, 'K7RM4QX9'),
        ]),
      );
      const pantalla = await renderPantalla(
        <ContextoIA.Provider value={ia}>
          <ProveedorBoletos>
            <Boletos
              alAbrirBoleto={() => undefined}
              alBuscar={() => undefined}
              alPreguntar={alPreguntar}
            />
          </ProveedorBoletos>
        </ContextoIA.Provider>,
      );
      await fireEvent.press(
        await pantalla.findByRole('tab', { name: 'Historial' }),
      );
      expect(
        await pantalla.findByRole('button', {
          name: 'Entender mis viajes con IA',
        }),
      ).toBeTruthy();
      await fireEvent.press(
        pantalla.getByRole('button', { name: '¿Cuánto gasté en total?' }),
      );
      expect(alPreguntar).toHaveBeenCalledWith('¿Cuánto gasté en total?');
    });

    it('sin la IA lista no aparece nada de eso', async () => {
      await AsyncStorage.setItem(
        CLAVE_BOLETOS,
        JSON.stringify([boletoDePrueba(EN_UNA_HORA())]),
      );
      const pantalla = await dibujar();
      await pantalla.findByText('Asiento');
      expect(pantalla.queryByText('Resumir mis viajes con IA')).toBeNull();
    });
  });
});
