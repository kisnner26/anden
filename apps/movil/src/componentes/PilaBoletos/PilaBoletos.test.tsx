import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { BoletoGuardado } from '@/datos/reserva';
import { renderPantalla } from '@/pruebas/render';

import { PilaBoletos } from './PilaBoletos';

function guardado(id: string, asiento: number): BoletoGuardado {
  return {
    boleto: { asiento, codigo: `C${id}`, id },
    resumen: {
      anden: 3,
      destino: 'Boaco',
      salida: new Date(Date.now() + 3_600_000).toISOString(),
    },
  } as unknown as BoletoGuardado;
}

describe('PilaBoletos', () => {
  it('un solo boleto abre directo', async () => {
    const alAbrir = jest.fn();
    const pantalla = await renderPantalla(
      <PilaBoletos
        ahora={new Date()}
        alAbrirBoleto={alAbrir}
        grupo={{ boletos: [guardado('a', 4)], clave: 'k' }}
      />,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: /Asiento 4/ }));
    expect(alAbrir).toHaveBeenCalledWith('a');
  });

  it('varios se apilan, se despliegan y se recogen', async () => {
    const alAbrir = jest.fn();
    const pantalla = await renderPantalla(
      <PilaBoletos
        ahora={new Date()}
        alAbrirBoleto={alAbrir}
        grupo={{
          boletos: [guardado('a', 4), guardado('b', 5)],
          clave: 'k',
        }}
      />,
    );
    expect(pantalla.getByText('2 boletos')).toBeTruthy();
    await fireEvent.press(pantalla.getByRole('button', { name: /2 boletos/ }));
    expect(alAbrir).not.toHaveBeenCalled();
    await fireEvent.press(pantalla.getByRole('button', { name: /Asiento 5/ }));
    expect(alAbrir).toHaveBeenCalledWith('b');
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Recoger las tarjetas' }),
    );
    expect(pantalla.getByText('2 boletos')).toBeTruthy();
  });
});
