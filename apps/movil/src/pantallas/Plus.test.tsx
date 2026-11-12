import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { ProveedorSuscripcion } from '@/datos/ProveedorSuscripcion';
import { renderPantalla } from '@/pruebas/render';

import { Plus } from './Plus';

afterEach(async () => {
  await AsyncStorage.clear();
});

function dibujar() {
  return renderPantalla(
    <ProveedorSuscripcion>
      <Plus alVolver={() => undefined} />
    </ProveedorSuscripcion>,
  );
}

describe('Plus', () => {
  it('muestra el precio y el plan gratis al empezar', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('US$ 5')).toBeTruthy();
    expect(pantalla.getByText('al mes')).toBeTruthy();
    expect(pantalla.getByText('Estás en el plan gratis.')).toBeTruthy();
  });

  it('activa Plus y permite cancelarlo', async () => {
    const pantalla = await dibujar();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Activar Plus' }),
    );
    expect(await pantalla.findByText(/^Tenés Plus desde/)).toBeTruthy();
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Cancelar Plus' }),
    );
    expect(await pantalla.findByText('Estás en el plan gratis.')).toBeTruthy();
  });

  it('avisa que por ahora no se cobra', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText(/sin cobro/)).toBeTruthy();
  });
});
