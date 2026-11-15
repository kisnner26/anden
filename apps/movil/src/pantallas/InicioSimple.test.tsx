import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { CLAVE_BOLETOS, ProveedorBoletos } from '@/datos/ProveedorBoletos';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { InicioSimple } from './InicioSimple';

beforeEach(async () => {
  await AsyncStorage.clear();
  reiniciarMuestra();
});

function dibujar(props: Partial<Parameters<typeof InicioSimple>[0]> = {}) {
  return renderPantalla(
    <ProveedorBoletos>
      <InicioSimple
        alAbrirBoleto={() => undefined}
        alBuscar={() => undefined}
        alSalir={() => undefined}
        {...props}
      />
    </ProveedorBoletos>,
  );
}

describe('InicioSimple', () => {
  it('ofrece un botón grande por ciudad', async () => {
    const alBuscar = jest.fn();
    const p = await dibujar({ alBuscar });
    await fireEvent.press(await p.findByRole('button', { name: 'Ir a Boaco' }));
    expect(alBuscar).toHaveBeenCalledWith('Boaco');
  });

  it('muestra el próximo boleto y lo abre', async () => {
    await AsyncStorage.setItem(
      CLAVE_BOLETOS,
      JSON.stringify([boletoDePrueba(new Date(Date.now() + 3_600_000))]),
    );
    const alAbrirBoleto = jest.fn();
    const p = await dibujar({ alAbrirBoleto });
    await fireEvent.press(
      await p.findByRole('button', { name: /Tu boleto a Boaco/ }),
    );
    expect(alAbrirBoleto).toHaveBeenCalledWith('bol_K7RM4QX9');
  });

  it('permite volver al inicio de siempre', async () => {
    const alSalir = jest.fn();
    const p = await dibujar({ alSalir });
    await fireEvent.press(
      await p.findByRole('button', { name: 'Volver al inicio de siempre' }),
    );
    expect(alSalir).toHaveBeenCalledTimes(1);
  });
});
