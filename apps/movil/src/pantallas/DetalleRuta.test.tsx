import { beforeEach, describe, expect, it } from '@jest/globals';
import { useReducedMotion, withTiming } from 'react-native-reanimated';

import { renderPantalla } from '@/pruebas/render';
import { movimiento } from '@/tema/movimiento';

import { DetalleRuta } from './DetalleRuta';

interface MockSimulado {
  mockClear: () => void;
  mockReturnValue: (valor: boolean) => void;
}

const animar = withTiming as unknown as MockSimulado;
const reducir = useReducedMotion as unknown as MockSimulado;

beforeEach(() => {
  animar.mockClear();
  reducir.mockReturnValue(false);
});

describe('DetalleRuta', () => {
  it('presenta el corredor con un bus simulado marcado como tal', async () => {
    const pantalla = await renderPantalla(
      <DetalleRuta alVolver={() => undefined} rutaId="cor_boa_man" />,
    );

    expect(
      pantalla.getByRole('header', { name: 'Boaco → Managua' }),
    ).toBeTruthy();
    expect(
      pantalla.getByLabelText('Mapa del corredor con un bus simulado'),
    ).toBeTruthy();
    expect(pantalla.getByText('Simulación')).toBeTruthy();
    expect(pantalla.getByText(/^Llega en \d+ min$/)).toBeTruthy();
    expect(pantalla.getByText(/^Va por el \d+ % del recorrido$/)).toBeTruthy();
    expect(pantalla.getByText(/Posición simulada/)).toBeTruthy();
    expect(pantalla.getByLabelText('Origen: Boaco')).toBeTruthy();
    expect(pantalla.getByLabelText('Destino: Managua')).toBeTruthy();
    expect(pantalla.getByText('82.9 km de carretera')).toBeTruthy();
    expect(
      pantalla.getByText('Trazo de la carretera: OpenStreetMap'),
    ).toBeTruthy();
  });

  it('presenta paradas, tarifa de muestra y siguiente salida', async () => {
    const pantalla = await renderPantalla(
      <DetalleRuta alVolver={() => undefined} rutaId="rut_may_boa" />,
    );

    expect(pantalla.getByText('Paradas del recorrido')).toBeTruthy();
    expect(pantalla.getByText('Mercado Mayoreo')).toBeTruthy();
    expect(pantalla.getAllByText('Tarifas de muestra')).toHaveLength(2);
    expect(pantalla.getByText('Siguiente salida')).toBeTruthy();
  });

  it('anima el bus con la duración del tema', async () => {
    await renderPantalla(
      <DetalleRuta alVolver={() => undefined} rutaId="cor_man_boa" />,
    );

    expect(animar).toHaveBeenCalledWith(1, {
      duration: movimiento.recorridoCorredor,
    });
  });

  it('muestra el bus sin animarlo al reducir movimiento', async () => {
    reducir.mockReturnValue(true);
    await renderPantalla(
      <DetalleRuta alVolver={() => undefined} rutaId="cor_man_boa" />,
    );

    expect(animar).not.toHaveBeenCalled();
  });
});
