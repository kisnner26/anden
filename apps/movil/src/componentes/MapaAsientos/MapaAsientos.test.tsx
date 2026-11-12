import type { EstadoAsiento } from '@anden/dominio';
import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';
import { StyleSheet } from 'react-native';

import { MapaAsientos } from './MapaAsientos';

const ESTADOS = new Map<number, EstadoAsiento>([
  [2, 'vendido'],
  [6, 'retenido'],
]);

describe('MapaAsientos', () => {
  it('dibuja los 26 asientos de la coaster', async () => {
    const pantalla = await render(
      <MapaAsientos
        alElegir={() => undefined}
        configuracion="coaster26"
        elegidos={[]}
        estados={ESTADOS}
      />,
    );
    expect(pantalla.getAllByLabelText(/^Asiento \d+,/)).toHaveLength(26);
  });

  it('avisa el número del asiento libre que se presiona', async () => {
    const alElegir = jest.fn();
    const pantalla = await render(
      <MapaAsientos
        alElegir={alElegir}
        configuracion="coaster26"
        elegidos={[]}
        estados={ESTADOS}
      />,
    );
    await fireEvent.press(pantalla.getByLabelText('Asiento 8, pasillo, libre'));
    expect(alElegir).toHaveBeenCalledWith(8);
  });

  it('no deja elegir un asiento vendido ni uno apartado', async () => {
    const alElegir = jest.fn();
    const pantalla = await render(
      <MapaAsientos
        alElegir={alElegir}
        configuracion="coaster26"
        elegidos={[]}
        estados={ESTADOS}
      />,
    );
    await fireEvent.press(
      pantalla.getByLabelText('Asiento 2, preferencial, vendido'),
    );
    await fireEvent.press(
      pantalla.getByLabelText('Asiento 6, ventana, apartado'),
    );
    expect(alElegir).not.toHaveBeenCalled();
  });

  it('marca como tuyo el asiento elegido', async () => {
    const pantalla = await render(
      <MapaAsientos
        alElegir={() => undefined}
        configuracion="coaster26"
        elegidos={[9]}
        estados={ESTADOS}
      />,
    );
    expect(
      pantalla.getByLabelText('Asiento 9, ventana, tuyo').props
        .accessibilityState,
    ).toMatchObject({ selected: true });
  });

  it('dibuja la puerta una sola vez aunque ocupe dos celdas', async () => {
    const pantalla = await render(
      <MapaAsientos
        alElegir={() => undefined}
        configuracion="coaster26"
        elegidos={[]}
        estados={ESTADOS}
      />,
    );
    expect(pantalla.getAllByText('Puerta')).toHaveLength(1);
  });

  it('el número de un asiento vendido va tachado y el de uno apartado no', async () => {
    const pantalla = await render(
      <MapaAsientos
        alElegir={() => undefined}
        configuracion="coaster26"
        elegidos={[]}
        estados={ESTADOS}
      />,
    );
    const estiloDe = (numero: string) =>
      StyleSheet.flatten(pantalla.getByText(numero).props.style);
    expect(estiloDe('2').textDecorationLine).toBe('line-through');
    expect(estiloDe('6').textDecorationLine).toBeUndefined();
    expect(estiloDe('8').textDecorationLine).toBeUndefined();
  });
});
