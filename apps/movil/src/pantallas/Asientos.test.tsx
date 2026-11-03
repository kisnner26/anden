import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { VIAJE_GRANADA } from '@/datos/muestra';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { Asientos } from './Asientos';

afterEach(() => reiniciarMuestra());

describe('Asientos', () => {
  it('muestra el título, la ruta y la cuenta de la retención', async () => {
    const pantalla = await renderPantalla(
      <Asientos
        alSeguir={() => undefined}
        alVolver={() => undefined}
        viajeId={VIAJE_GRANADA}
      />,
    );
    expect(pantalla.getByText(/Elegí tu/)).toBeTruthy();
    expect(pantalla.getByText(/UCA → Granada/)).toBeTruthy();
    expect(pantalla.getByText('10:00')).toBeTruthy();
  });

  it('empieza con el botón Seguir deshabilitado y total cero', async () => {
    const pantalla = await renderPantalla(
      <Asientos
        alSeguir={() => undefined}
        alVolver={() => undefined}
        viajeId={VIAJE_GRANADA}
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
        viajeId={VIAJE_GRANADA}
      />,
    );
    await fireEvent.press(pantalla.getByLabelText('Asiento 8, pasillo, libre'));
    expect(pantalla.getByText('C$ 46')).toBeTruthy();
    await fireEvent.press(pantalla.getByLabelText('Asiento 9, ventana, libre'));
    expect(pantalla.getByText('C$ 92')).toBeTruthy();
  });

  it('lleva a los pasajeros con los asientos elegidos en orden', async () => {
    const alSeguir = jest.fn();
    const pantalla = await renderPantalla(
      <Asientos
        alSeguir={alSeguir}
        alVolver={() => undefined}
        viajeId={VIAJE_GRANADA}
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
        viajeId={VIAJE_GRANADA}
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
});
