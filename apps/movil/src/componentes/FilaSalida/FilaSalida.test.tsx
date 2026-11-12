import { beforeAll, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { crearMuestra, VIAJE_BOACO } from '@/datos/muestra';
import { armarSalidas, type Salida } from '@/datos/salidas';

import { FilaSalida } from './FilaSalida';

const AHORA = new Date(2026, 10, 2, 14, 20);
let boaco: Salida;

beforeAll(() => {
  const salidas = armarSalidas(crearMuestra(AHORA), AHORA);
  boaco = salidas.find((salida) => salida.viajeId === VIAJE_BOACO) as Salida;
});

describe('FilaSalida', () => {
  it('se anuncia con destino, hora, servicio y andén', async () => {
    const pantalla = await render(<FilaSalida salida={boaco} />);
    expect(
      pantalla.getByRole('button', {
        name: 'Boaco, 2:40 p. m., Ordinario, andén 3',
      }),
    ).toBeTruthy();
  });

  it('avisa el viaje al presionarla', async () => {
    const alPresionar = jest.fn();
    const pantalla = await render(
      <FilaSalida alPresionar={alPresionar} salida={boaco} />,
    );
    await fireEvent.press(pantalla.getByRole('button'));
    expect(alPresionar).toHaveBeenCalledWith(boaco.viajeId);
  });

  it('muestra el destino y la hora', async () => {
    const pantalla = await render(<FilaSalida salida={boaco} />);
    expect(pantalla.getByText('Boaco')).toBeTruthy();
    expect(pantalla.getByText('2:40')).toBeTruthy();
    expect(pantalla.getByText('p. m.')).toBeTruthy();
  });

  it('sin boleto la fila no suma elementos decorativos', async () => {
    const sin = await render(<FilaSalida salida={boaco} />);
    const con = await render(<FilaSalida conBoleto salida={boaco} />);
    const contar = (nodo: unknown): number =>
      typeof nodo === 'object' && nodo !== null && 'children' in nodo
        ? 1 +
          (
            (nodo as { children: unknown[] | null }).children ?? []
          ).reduce<number>((suma, hijo) => suma + contar(hijo), 0)
        : 0;
    expect(contar(con.toJSON())).toBeGreaterThan(contar(sin.toJSON()));
  });

  it('muestra la placa en el taxi interlocal y no en el ordinario', async () => {
    const todas = armarSalidas(crearMuestra(AHORA), AHORA);
    const taxi = todas.find(
      (salida) => salida.servicio === 'taxi-interlocal',
    ) as Salida;
    const pantalla = await render(<FilaSalida salida={taxi} />);
    expect(
      pantalla.getByText(`Taxi interlocal · andén 6 · ${taxi.placa}`),
    ).toBeTruthy();
    const ordinario = await render(<FilaSalida salida={boaco} />);
    expect(ordinario.queryByText(new RegExp(boaco.placa))).toBeNull();
  });

  it('muestra los asientos libres solo si se pide', async () => {
    const sin = await render(<FilaSalida salida={boaco} />);
    expect(sin.queryByText(/libres|Pocos asientos|Agotado/)).toBeNull();
    const con = await render(
      <FilaSalida mostrarDisponibilidad salida={boaco} />,
    );
    expect(con.getByText(/libres|Pocos asientos|Agotado/)).toBeTruthy();
  });

  it('avisa cuando quedan pocos asientos o ninguno', async () => {
    const pocos = await render(
      <FilaSalida
        mostrarDisponibilidad
        salida={{ ...boaco, asientosLibres: 3 }}
      />,
    );
    expect(pocos.getByText('Pocos asientos · 3')).toBeTruthy();
    const ninguno = await render(
      <FilaSalida
        mostrarDisponibilidad
        salida={{ ...boaco, asientosLibres: 0 }}
      />,
    );
    expect(ninguno.getByText('Agotado')).toBeTruthy();
  });
});
