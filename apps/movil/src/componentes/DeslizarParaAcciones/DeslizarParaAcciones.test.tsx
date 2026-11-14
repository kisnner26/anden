import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';

import { DeslizarParaAcciones } from './DeslizarParaAcciones';

const ACCION = {
  color: 'rgb(0, 0, 0)',
  colorTexto: 'rgb(255, 255, 255)',
  icono: 'campana',
} as const;

describe('DeslizarParaAcciones', () => {
  it('muestra el contenido y el nombre de cada acción', async () => {
    const p = await renderPantalla(
      <DeslizarParaAcciones
        derecha={{
          ...ACCION,
          alActivar: () => undefined,
          etiqueta: 'Avisarme',
        }}
        izquierda={{
          ...ACCION,
          alActivar: () => undefined,
          etiqueta: 'Favorita',
        }}
      >
        <Text>la fila</Text>
      </DeslizarParaAcciones>,
    );
    expect(p.getByText('la fila')).toBeTruthy();
    expect(p.getByText('Avisarme')).toBeTruthy();
    expect(p.getByText('Favorita')).toBeTruthy();
  });

  it('el lector de pantalla puede activar cada acción sin deslizar', async () => {
    const aviso = jest.fn();
    const favorita = jest.fn();
    const p = await renderPantalla(
      <DeslizarParaAcciones
        derecha={{ ...ACCION, alActivar: aviso, etiqueta: 'Avisarme' }}
        izquierda={{ ...ACCION, alActivar: favorita, etiqueta: 'Favorita' }}
      >
        <Text>la fila</Text>
      </DeslizarParaAcciones>,
    );
    const contenedor = p.getByTestId('deslizar-acciones');
    await fireEvent(contenedor, 'accessibilityAction', {
      nativeEvent: { actionName: 'derecha' },
    });
    expect(aviso).toHaveBeenCalledTimes(1);
    await fireEvent(contenedor, 'accessibilityAction', {
      nativeEvent: { actionName: 'izquierda' },
    });
    expect(favorita).toHaveBeenCalledTimes(1);
  });

  it('con una sola acción solo declara esa', async () => {
    const p = await renderPantalla(
      <DeslizarParaAcciones
        derecha={{
          ...ACCION,
          alActivar: () => undefined,
          etiqueta: 'Avisarme',
        }}
      >
        <Text>la fila</Text>
      </DeslizarParaAcciones>,
    );
    expect(p.getByText('Avisarme')).toBeTruthy();
    expect(p.queryByText('Favorita')).toBeNull();
  });
});
