import AsyncStorage from '@react-native-async-storage/async-storage';
import { afterEach, describe, expect, it } from '@jest/globals';
import { waitFor } from '@testing-library/react-native';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { CLAVE_MODO_USO } from './modoUso';
import { ProveedorModoUso } from './ProveedorModoUso';
import { establecerEscalaTexto, tipografia } from './tipografia';
import { useModoUso } from './useModoUso';
import { useMovimientoReducido } from './useMovimientoReducido';

afterEach(async () => {
  establecerEscalaTexto(1);
  await AsyncStorage.clear();
});

function Sonda() {
  const { modo } = useModoUso();
  const reducido = useMovimientoReducido();
  return (
    <Text>{`${modo}|${tipografia.cuerpo.fontSize}|${reducido ? 'quieto' : 'anima'}`}</Text>
  );
}

describe('ProveedorModoUso', () => {
  it('arranca en completo sin tocar la letra ni el movimiento', async () => {
    const pantalla = await renderPantalla(
      <ProveedorModoUso>
        <Sonda />
      </ProveedorModoUso>,
    );
    expect(pantalla.getByText('completo|16|anima')).toBeTruthy();
  });

  it('aplica el modo sencillo guardado: letra grande y sin movimiento', async () => {
    await AsyncStorage.setItem(CLAVE_MODO_USO, 'sencillo');
    const pantalla = await renderPantalla(
      <ProveedorModoUso>
        <Sonda />
      </ProveedorModoUso>,
    );
    await waitFor(() =>
      expect(pantalla.getByText('sencillo|20|quieto')).toBeTruthy(),
    );
  });

  it('el modo rápido quita el movimiento sin agrandar la letra', async () => {
    await AsyncStorage.setItem(CLAVE_MODO_USO, 'rapido');
    const pantalla = await renderPantalla(
      <ProveedorModoUso>
        <Sonda />
      </ProveedorModoUso>,
    );
    await waitFor(() =>
      expect(pantalla.getByText('rapido|16|quieto')).toBeTruthy(),
    );
  });
});
