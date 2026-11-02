import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { crearMuestra } from '@/datos/muestra';
import { armarSalidas, type Salida } from '@/datos/salidas';

import { FilaSalida } from './FilaSalida';

const AHORA = new Date(2026, 10, 2, 14, 20);
let granada: Salida;

beforeAll(() => {
  const salidas = armarSalidas(crearMuestra(AHORA), AHORA);
  granada = salidas.find((salida) => salida.destino === 'Granada') as Salida;
});

describe('FilaSalida', () => {
  it('se anuncia con destino, hora, servicio y andén', async () => {
    const pantalla = await render(<FilaSalida salida={granada} />);
    expect(
      pantalla.getByRole('button', {
        name: 'Granada, 2:40 p. m., Ordinario, andén 4',
      }),
    ).toBeTruthy();
  });

  it('avisa el viaje al presionarla', async () => {
    const alPresionar = jest.fn();
    const pantalla = await render(
      <FilaSalida alPresionar={alPresionar} salida={granada} />,
    );
    await fireEvent.press(pantalla.getByRole('button'));
    expect(alPresionar).toHaveBeenCalledWith(granada.viajeId);
  });

  it('muestra el destino y la hora', async () => {
    const pantalla = await render(<FilaSalida salida={granada} />);
    expect(pantalla.getByText('Granada')).toBeTruthy();
    expect(pantalla.getByText('2:40')).toBeTruthy();
  });
});
