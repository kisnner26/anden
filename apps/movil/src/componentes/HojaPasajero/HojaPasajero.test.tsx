import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { HojaPasajero } from './HojaPasajero';

const PASAJERO = {
  asiento: 8,
  boletoId: 'bol_1',
  codigo: 'K7RM4QX9',
  esMenorEnBrazos: false,
  nombre: 'Ana Ruiz',
  precio: 66,
};

function dibujar(props: Partial<Parameters<typeof HojaPasajero>[0]> = {}) {
  return renderPantalla(
    <HojaPasajero
      abierta
      abordo={false}
      alAlternarAbordaje={() => undefined}
      alAlternarPago={() => undefined}
      alCerrar={() => undefined}
      pagado={false}
      pasajero={PASAJERO}
      {...props}
    />,
  );
}

describe('HojaPasajero', () => {
  it('sin la opción de llamar no muestra el botón', async () => {
    const p = await dibujar();
    expect(p.queryByRole('button', { name: 'Llamar' })).toBeNull();
  });

  it('con la opción de llamar la pide con el boleto del pasajero', async () => {
    const alLlamar = jest.fn();
    const p = await dibujar({ alLlamar });
    await fireEvent.press(p.getByRole('button', { name: 'Llamar' }));
    expect(alLlamar).toHaveBeenCalledWith('bol_1');
  });

  it('explica por qué no se pudo llamar', async () => {
    const p = await dibujar({
      alLlamar: () => undefined,
      llamadaFallida: true,
    });
    expect(p.getByText(/No se pudo llamar/)).toBeTruthy();
  });
});
