import AsyncStorage from '@react-native-async-storage/async-storage';
import {
  afterEach,
  beforeEach,
  describe,
  expect,
  it,
  jest,
} from '@jest/globals';
import { act, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('@/datos/transmisor', () => ({
  detenerTransmision: jest.fn(),
  iniciarTransmision: jest.fn(),
}));

import { VIAJE_BOACO } from '@/datos/muestra';
import { ProveedorBoletos } from '@/datos/ProveedorBoletos';
import { ProveedorPagos } from '@/datos/ProveedorPagos';
import { ProveedorSesion } from '@/datos/ProveedorSesion';
import { detenerTransmision, iniciarTransmision } from '@/datos/transmisor';
import { trazoEntre } from '@/datos/trazoCorredor';
import { obtenerMuestra, reiniciarMuestra } from '@/datos/useSalidas';
import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';
import { TRANSMISION } from '@/servicios/transmision';

import { ConductorViaje } from './ConductorViaje';

beforeEach(async () => {
  jest.clearAllMocks();
  await AsyncStorage.clear();
  await AsyncStorage.setItem(
    'anden.sesion',
    JSON.stringify({
      choferId: 'cho_2',
      nombre: 'Marvin Lanzas',
      rol: 'conductor',
    }),
  );
});

afterEach(() => {
  TRANSMISION.detener(VIAJE_BOACO);
  reiniciarMuestra();
});

function dibujar() {
  return renderPantalla(
    <ProveedorSesion>
      <ProveedorBoletos>
        <ProveedorPagos>
          <ConductorViaje alVolver={() => undefined} viajeId={VIAJE_BOACO} />
        </ProveedorPagos>
      </ProveedorBoletos>
    </ProveedorSesion>,
  );
}

describe('ConductorViaje', () => {
  it('en un viaje inexistente hay una flecha para volver', async () => {
    const alVolver = jest.fn();
    const pantalla = await renderPantalla(
      <ProveedorSesion>
        <ProveedorBoletos>
          <ProveedorPagos>
            <ConductorViaje alVolver={alVolver} viajeId="via_inexistente" />
          </ProveedorPagos>
        </ProveedorBoletos>
      </ProveedorSesion>,
    );
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Volver' }),
    );
    expect(alVolver).toHaveBeenCalledTimes(1);
  });

  it('abre un viaje de vuelta que sale de Boaco en vez de decir que no existe', async () => {
    const vuelta = obtenerMuestra().viajes.find(
      (viaje) => viaje.rutaId === 'rut_boa_may',
    );
    expect(vuelta).toBeDefined();
    await AsyncStorage.setItem(
      'anden.sesion',
      JSON.stringify({
        choferId: vuelta!.choferId,
        nombre: 'Chofer de vuelta',
        rol: 'conductor',
      }),
    );
    const pantalla = await renderPantalla(
      <ProveedorSesion>
        <ProveedorBoletos>
          <ProveedorPagos>
            <ConductorViaje alVolver={() => undefined} viajeId={vuelta!.id} />
          </ProveedorPagos>
        </ProveedorBoletos>
      </ProveedorSesion>,
    );
    expect(
      await pantalla.findByRole('button', { name: 'Iniciar viaje' }),
    ).toBeTruthy();
    expect(pantalla.queryByText('No encontramos este viaje.')).toBeNull();
  });

  it('antes de empezar explica qué se comparte y ofrece iniciar el viaje', async () => {
    const pantalla = await dibujar();
    expect(
      await pantalla.findByText('Todavía no compartís tu ubicación'),
    ).toBeTruthy();
    expect(
      pantalla.getByText(/Los pasajeros ven dónde va la unidad/),
    ).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: 'Iniciar viaje' }),
    ).toBeTruthy();
  });

  it('al iniciar pide la transmisión de este viaje con el chofer de la sesión', async () => {
    jest.mocked(iniciarTransmision).mockResolvedValue('ok');
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Iniciar viaje' }),
    );
    expect(iniciarTransmision).toHaveBeenCalledWith(VIAJE_BOACO, 'cho_2');
  });

  it('explica cuando se negó el permiso de ubicación', async () => {
    jest.mocked(iniciarTransmision).mockResolvedValue('permiso-negado');
    const pantalla = await dibujar();
    await fireEvent.press(
      await pantalla.findByRole('button', { name: 'Iniciar viaje' }),
    );
    expect(
      await pantalla.findByText(
        /Sin el permiso de ubicación no se puede compartir/,
      ),
    ).toBeTruthy();
  });

  it('mientras comparte muestra el avance y deja terminar el viaje', async () => {
    const pantalla = await dibujar();
    await pantalla.findByText('Todavía no compartís tu ubicación');
    const trazo = trazoEntre('Managua', 'Boaco')!;
    const medio = trazo.puntos[Math.floor(trazo.puntos.length / 2)]!;
    await act(async () => {
      TRANSMISION.iniciar(VIAJE_BOACO, 'cho_2');
      TRANSMISION.publicar(VIAJE_BOACO, {
        lat: medio.lat,
        lng: medio.lng,
        registradaEn: new Date().toISOString(),
        velocidadMs: 15,
      });
    });

    expect(await pantalla.findByText('Compartiendo tu ubicación')).toBeTruthy();
    expect(pantalla.getByText(/^\d+ %$/)).toBeTruthy();
    expect(pantalla.getByText(/^Llegás en \d+ min$/)).toBeTruthy();
    expect(pantalla.getByText(/km recorridos · .* km restantes/)).toBeTruthy();

    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Terminar viaje' }),
    );
    expect(detenerTransmision).toHaveBeenCalledWith(VIAJE_BOACO);
  });

  it('avisa que espera la señal si todavía no llegó ninguna posición', async () => {
    const pantalla = await dibujar();
    await pantalla.findByText('Todavía no compartís tu ubicación');
    await act(async () => {
      TRANSMISION.iniciar(VIAJE_BOACO, 'cho_2');
    });
    expect(
      await pantalla.findByText('Esperando la señal del GPS…'),
    ).toBeTruthy();
  });

  it('sin boletos dice que no hay pasajeros en este teléfono', async () => {
    const pantalla = await dibujar();
    expect(
      await pantalla.findByText(/Todavía no hay boletos de este viaje/),
    ).toBeTruthy();
  });

  it('marca y quita el pago en efectivo de un pasajero y suma lo cobrado', async () => {
    await AsyncStorage.setItem(
      'anden.boletos',
      JSON.stringify([boletoDePrueba(new Date(Date.now() + 3_600_000), 8)]),
    );
    const pantalla = await dibujar();
    expect(await pantalla.findByText('Asiento 8 · Ana Ruiz')).toBeTruthy();
    expect(pantalla.getByText('0 de 1 pagaron')).toBeTruthy();

    await fireEvent.press(
      pantalla.getByRole('button', { name: /^Marcar pagado, Ana Ruiz/ }),
    );
    expect(await pantalla.findByText('Pagado en efectivo')).toBeTruthy();
    expect(pantalla.getByText('1 de 1 pagaron')).toBeTruthy();
    expect(
      pantalla.getByText(/Cobrado C\$ 46 · Por cobrar C\$ 0/),
    ).toBeTruthy();

    await fireEvent.press(
      pantalla.getByRole('button', { name: /^Quitar el pago, Ana Ruiz/ }),
    );
    await waitFor(() =>
      expect(pantalla.getByText('0 de 1 pagaron')).toBeTruthy(),
    );
  });
});
