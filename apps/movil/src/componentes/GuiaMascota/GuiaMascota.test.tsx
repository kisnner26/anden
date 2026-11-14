import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { ContextoMascota, type ValorMascota } from '@/datos/useMascota';
import { renderPantalla } from '@/pruebas/render';

import { GuiaMascota } from './GuiaMascota';

beforeEach(async () => {
  await AsyncStorage.clear();
});

function dibujar(
  valor: Partial<ValorMascota> = {},
  pantalla: 'boletos' | 'rutas' | 'viajar' = 'rutas',
) {
  const completo: ValorMascota = {
    activa: true,
    cambiar: async () => undefined,
    marcar: jest.fn(),
    vistos: {},
    ...valor,
  };
  return {
    completo,
    pantalla: renderPantalla(
      <ContextoMascota.Provider value={completo}>
        <GuiaMascota pantalla={pantalla} />
      </ContextoMascota.Provider>,
    ),
  };
}

describe('GuiaMascota', () => {
  it('apagada no dibuja nada', async () => {
    const { pantalla } = dibujar({ activa: false });
    const p = await pantalla;
    expect(p.queryByTestId('guia-mascota')).toBeNull();
  });

  it('activa muestra un consejo de la pantalla', async () => {
    const { pantalla } = dibujar();
    const p = await pantalla;
    expect(await p.findByTestId('guia-mascota')).toBeTruthy();
    expect(
      p.getByText('Elegí una ciudad y te muestro cuánto dura el viaje.'),
    ).toBeTruthy();
  });

  it('tocarla la despide y marca el consejo como visto', async () => {
    const { completo, pantalla } = dibujar();
    const p = await pantalla;
    await fireEvent.press(await p.findByRole('button'));
    expect(completo.marcar).toHaveBeenCalledWith('truco-rutas');
    await waitFor(() => expect(p.queryByTestId('guia-mascota')).toBeNull());
  });

  it('un consejo ya visto hoy no vuelve a salir', async () => {
    const hoy = new Date();
    const dia = `${hoy.getFullYear()}-${String(hoy.getMonth() + 1).padStart(2, '0')}-${String(hoy.getDate()).padStart(2, '0')}`;
    const { pantalla } = dibujar({ vistos: { 'truco-rutas': dia } });
    const p = await pantalla;
    expect(p.queryByTestId('guia-mascota')).toBeNull();
  });
});
