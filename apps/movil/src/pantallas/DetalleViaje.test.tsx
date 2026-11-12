import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { VIAJE_BOACO } from '@/datos/muestra';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { DetalleViaje } from './DetalleViaje';

afterEach(() => reiniciarMuestra());

function dibujar(
  propiedades: Partial<Parameters<typeof DetalleViaje>[0]> = {},
) {
  return renderPantalla(
    <DetalleViaje
      alElegirAsiento={() => undefined}
      alVerChofer={() => undefined}
      alVolver={() => undefined}
      viajeId={VIAJE_BOACO}
      {...propiedades}
    />,
  );
}

describe('DetalleViaje', () => {
  it('muestra el destino y la ruta con el servicio', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByText(/Mercado Mayoreo → Boaco · Ordinario/),
    ).toBeTruthy();
  });

  it('muestra las dos horas con el camino entre las terminales', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByTestId('linea-viaje')).toBeTruthy();
    expect(pantalla.getByText(/^(a\. m\.|p\. m\.) · MAY$/)).toBeTruthy();
    expect(pantalla.getByText(/^(a\. m\.|p\. m\.) · BOA$/)).toBeTruthy();
  });

  it('dibuja el mapa del recorrido con los kilómetros de carretera', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByLabelText('Mapa del recorrido de esta salida'),
    ).toBeTruthy();
    expect(
      pantalla.getByText(/^82\.9 km de carretera · Trazo de la carretera/),
    ).toBeTruthy();
  });

  it('muestra la placa de la unidad', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByLabelText('Placa M 222-114')).toBeTruthy();
    expect(
      pantalla.getByText(/Cooperativa de muestra · 26 plazas/),
    ).toBeTruthy();
  });

  it('muestra el chofer con su nota y su licencia', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Marvin Lanzas')).toBeTruthy();
    expect(pantalla.getByText(/opiniones/)).toBeTruthy();
    expect(pantalla.getByText('Licencia verificada')).toBeTruthy();
  });

  it('muestra el recorrido con las dos terminales', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('Mercado Mayoreo')).toBeTruthy();
    expect(pantalla.getByText('Terminal de Buses de Managua')).toBeTruthy();
  });

  it('muestra la tarifa de muestra', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('C$ 70')).toBeTruthy();
    expect(pantalla.getByText('Tarifa de muestra')).toBeTruthy();
  });

  it('abre el perfil del chofer', async () => {
    const alVerChofer = jest.fn();
    const pantalla = await dibujar({ alVerChofer });
    await fireEvent.press(
      pantalla.getByRole('button', { name: /Chofer Marvin Lanzas/ }),
    );
    expect(alVerChofer).toHaveBeenCalledWith('cho_2');
  });

  it('lleva a elegir asiento', async () => {
    const alElegirAsiento = jest.fn();
    const pantalla = await dibujar({ alElegirAsiento });
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Elegir asiento' }),
    );
    expect(alElegirAsiento).toHaveBeenCalledWith(VIAJE_BOACO);
  });

  it('dice la venta cerrada en un viaje que ya salió', async () => {
    const pantalla = await dibujar({ viajeId: 'via_1' });
    expect(
      pantalla.getByRole('button', { name: 'Venta cerrada' }),
    ).toBeTruthy();
  });

  it('dice que no encontró un viaje inexistente', async () => {
    const pantalla = await dibujar({ viajeId: 'via_inexistente' });
    expect(pantalla.getByText('No encontramos este viaje.')).toBeTruthy();
  });
});
