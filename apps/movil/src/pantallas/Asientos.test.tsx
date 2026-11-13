import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { VIAJE_BOACO } from '@/datos/muestra';
import { formatoFechaCorta } from '@/datos/formato';
import { obtenerMuestra, reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { Asientos } from './Asientos';

afterEach(() => reiniciarMuestra());

describe('Asientos', () => {
  it('muestra el título, la ruta y la cuenta de la retención', async () => {
    const pantalla = await renderPantalla(
      <Asientos
        alSeguir={() => undefined}
        alVolver={() => undefined}
        viajeId={VIAJE_BOACO}
      />,
    );
    expect(pantalla.getByText(/Elegí tu/)).toBeTruthy();
    expect(pantalla.getByText(/Mercado Mayoreo → Boaco/)).toBeTruthy();
    expect(pantalla.getByText('10:00')).toBeTruthy();
  });

  it('empieza con el botón Seguir deshabilitado y total cero', async () => {
    const pantalla = await renderPantalla(
      <Asientos
        alSeguir={() => undefined}
        alVolver={() => undefined}
        viajeId={VIAJE_BOACO}
      />,
    );
    expect(
      pantalla.getByRole('button', { name: 'Seguir' }).props.accessibilityState,
    ).toMatchObject({ disabled: true });
    expect(pantalla.getByText('C$ 0')).toBeTruthy();
  });

  it('suma la tarifa de muestra por cada asiento elegido', async () => {
    const pantalla = await renderPantalla(
      <Asientos
        alSeguir={() => undefined}
        alVolver={() => undefined}
        viajeId={VIAJE_BOACO}
      />,
    );
    await fireEvent.press(pantalla.getByLabelText('Asiento 8, pasillo, libre'));
    expect(pantalla.getByText('C$ 66')).toBeTruthy();
    await fireEvent.press(pantalla.getByLabelText('Asiento 9, ventana, libre'));
    expect(pantalla.getByText('C$ 132')).toBeTruthy();
  });

  it('lleva a los pasajeros con los asientos elegidos en orden', async () => {
    const alSeguir = jest.fn();
    const pantalla = await renderPantalla(
      <Asientos
        alSeguir={alSeguir}
        alVolver={() => undefined}
        viajeId={VIAJE_BOACO}
      />,
    );
    await fireEvent.press(pantalla.getByLabelText('Asiento 9, ventana, libre'));
    await fireEvent.press(pantalla.getByLabelText('Asiento 8, pasillo, libre'));
    await fireEvent.press(pantalla.getByRole('button', { name: 'Seguir' }));
    expect(alSeguir).toHaveBeenCalledWith([8, 9]);
  });

  it('vuelve al presionar la flecha', async () => {
    const alVolver = jest.fn();
    const pantalla = await renderPantalla(
      <Asientos
        alSeguir={() => undefined}
        alVolver={alVolver}
        viajeId={VIAJE_BOACO}
      />,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Volver' }));
    expect(alVolver).toHaveBeenCalledTimes(1);
  });

  it('dice que no encontró un viaje inexistente', async () => {
    const pantalla = await renderPantalla(
      <Asientos
        alSeguir={() => undefined}
        alVolver={() => undefined}
        viajeId="via_inexistente"
      />,
    );
    expect(pantalla.getByText('No encontramos este viaje.')).toBeTruthy();
  });

  it('sin asientos el pie dice una sola vez que hay que elegir', async () => {
    const pantalla = await renderPantalla(
      <Asientos
        alSeguir={() => undefined}
        alVolver={() => undefined}
        viajeId={VIAJE_BOACO}
      />,
    );
    expect(pantalla.getAllByText('Elegí al menos un asiento')).toHaveLength(1);
    expect(pantalla.getByText('Total')).toBeTruthy();
    expect(pantalla.getByText('C$ 0')).toBeTruthy();
  });

  it('permite reservar un viaje de otro día y dice qué día es', async () => {
    const manana = obtenerMuestra().viajes.find(
      (viaje) => viaje.id === 'via_d1_0_0',
    );
    expect(manana).toBeDefined();
    const pantalla = await renderPantalla(
      <Asientos
        alSeguir={() => undefined}
        alVolver={() => undefined}
        viajeId={manana!.id}
      />,
    );
    expect(
      pantalla.getByText(
        new RegExp(formatoFechaCorta(new Date(manana!.salida))),
      ),
    ).toBeTruthy();
    // un viaje de mañana tiene todos los asientos libres
    await fireEvent.press(pantalla.getByLabelText(/^Asiento 2, .*libre$/));
    expect(pantalla.getByText('C$ 66')).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: 'Seguir' }).props.accessibilityState,
    ).toMatchObject({ disabled: false });
  });
});
