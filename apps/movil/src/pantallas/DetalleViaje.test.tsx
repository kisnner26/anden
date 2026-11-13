import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { act, fireEvent } from '@testing-library/react-native';

import { VIAJE_BOACO } from '@/datos/muestra';
import { ProveedorEspera } from '@/datos/ProveedorEspera';
import { trazoEntre } from '@/datos/trazoCorredor';
import { obtenerMuestra, reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';
import { TRANSMISION } from '@/servicios/transmision';

import { DetalleViaje } from './DetalleViaje';

afterEach(() => {
  TRANSMISION.detener(VIAJE_BOACO);
  reiniciarMuestra();
});

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
    expect(pantalla.getByText('MAY')).toBeTruthy();
    expect(pantalla.getByText('BOA')).toBeTruthy();
    expect(pantalla.getAllByText(/^(a\. m\.|p\. m\.)$/)).toHaveLength(2);
  });

  it('dibuja el mapa del recorrido con los kilómetros de carretera', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByLabelText('Mapa del recorrido de esta salida'),
    ).toBeTruthy();
    expect(
      pantalla.getByText(/^82\.6 km de carretera · Trazo de la carretera/),
    ).toBeTruthy();
  });

  it('sin transmisión no muestra el seguimiento en vivo', async () => {
    const pantalla = await dibujar();
    expect(pantalla.queryByText('En vivo')).toBeNull();
  });

  it('cuando el conductor comparte el viaje muestra cuánto falta para llegar', async () => {
    const pantalla = await dibujar();
    const medio = trazoEntre('Managua', 'Boaco')!.puntos[40]!;
    await act(async () => {
      TRANSMISION.iniciar(VIAJE_BOACO, 'cho_2');
      TRANSMISION.publicar(VIAJE_BOACO, {
        lat: medio.lat,
        lng: medio.lng,
        registradaEn: new Date().toISOString(),
        velocidadMs: 14,
      });
    });
    expect(await pantalla.findByText('En vivo')).toBeTruthy();
    expect(pantalla.getByText(/^Llega en unos \d+ min \(ETA\)$/)).toBeTruthy();
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
    expect(pantalla.getByText('Terminal de Buses de Boaco')).toBeTruthy();
  });

  it('muestra la tarifa de muestra', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('C$ 66')).toBeTruthy();
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

  it('en un viaje inexistente hay una flecha para volver', async () => {
    const alVolver = jest.fn();
    const pantalla = await dibujar({ alVolver, viajeId: 'via_inexistente' });
    await fireEvent.press(pantalla.getByRole('button', { name: 'Volver' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });

  it('dice que no encontró un viaje inexistente', async () => {
    const pantalla = await dibujar({ viajeId: 'via_inexistente' });
    expect(pantalla.getByText('No encontramos este viaje.')).toBeTruthy();
  });

  it('en una salida llena ofrece que se avise si se libera un asiento', async () => {
    const muestra = obtenerMuestra();
    for (let asiento = 1; asiento <= 26; asiento += 1) {
      muestra.ocupaciones.push({
        asiento,
        boletoId: `bol_lleno_${asiento}`,
        duenoId: 'usu_otro',
        estado: 'vendido',
        viajeId: 'via_3',
      });
    }
    const pantalla = await renderPantalla(
      <ProveedorEspera>
        <DetalleViaje
          alElegirAsiento={() => undefined}
          alVerChofer={() => undefined}
          alVolver={() => undefined}
          viajeId="via_3"
        />
      </ProveedorEspera>,
    );
    expect(
      pantalla.queryByRole('button', { name: 'Elegir asiento' }),
    ).toBeNull();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Avisarme si se libera' }),
    );
    expect(
      await pantalla.findByRole('button', { name: 'Te avisamos si se libera' }),
    ).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Te avisamos si se libera' }),
    );
    expect(
      await pantalla.findByRole('button', { name: 'Avisarme si se libera' }),
    ).toBeTruthy();
  });

  it('con asientos libres sigue ofreciendo elegir asiento', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByRole('button', { name: 'Elegir asiento' }),
    ).toBeTruthy();
    expect(
      pantalla.queryByRole('button', { name: 'Avisarme si se libera' }),
    ).toBeNull();
  });
});
