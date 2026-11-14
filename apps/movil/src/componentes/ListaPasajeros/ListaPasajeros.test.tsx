import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { ListaPasajeros, type PasajeroDeLista } from './ListaPasajeros';

const PASAJEROS: PasajeroDeLista[] = [
  {
    asiento: 3,
    boletoId: 'bol_1',
    cedula: '001-010190-0001A',
    codigo: 'ABCD2345',
    esMenorEnBrazos: false,
    nombre: 'ana ruiz',
    precio: 66,
  },
  {
    asiento: 7,
    boletoId: 'bol_2',
    codigo: 'WXYZ6789',
    esMenorEnBrazos: true,
    nombre: 'luis perez',
    plus: true,
    precio: 66,
    unidadPlus: 'microbus',
  },
];

function dibujar(extra: Partial<Parameters<typeof ListaPasajeros>[0]> = {}) {
  return renderPantalla(
    <ListaPasajeros
      abordo={() => false}
      alAlternarAbordaje={() => undefined}
      alAlternarPago={() => undefined}
      pagado={() => false}
      pasajeros={PASAJEROS}
      {...extra}
    />,
  );
}

describe('ListaPasajeros', () => {
  it('tocar a un pasajero abre su ficha con sus datos', async () => {
    const p = await dibujar();
    expect(p.queryByTestId('ficha-pasajero')).toBeNull();
    await fireEvent.press(p.getByTestId('pasajero-bol_1'));
    expect(await p.findByTestId('ficha-pasajero')).toBeTruthy();
    expect(p.getByText('ABCD2345')).toBeTruthy();
    expect(p.getByText('001-010190-0001A')).toBeTruthy();
    expect(p.getByText('Pasajero')).toBeTruthy();
  });

  it('la ficha de una persona Plus lo dice y avisa su prioridad', async () => {
    const p = await dibujar();
    await fireEvent.press(p.getByTestId('pasajero-bol_2'));
    expect(await p.findByText(/Tiene Andén Plus: sube primero/)).toBeTruthy();
  });

  it('desde la ficha se puede marcar que abordó', async () => {
    const alAlternarAbordaje = jest.fn();
    const p = await dibujar({ alAlternarAbordaje });
    await fireEvent.press(p.getByTestId('pasajero-bol_1'));
    const botones = await p.findAllByRole('button', {
      name: 'Marcar que abordó',
    });
    await fireEvent.press(botones[botones.length - 1]!);
    expect(alAlternarAbordaje).toHaveBeenCalledWith('bol_1');
  });
});
