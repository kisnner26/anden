import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { BotonFavorito } from './BotonFavorito';

describe('BotonFavorito', () => {
  it('avisa al tocarlo y refleja si está activo', async () => {
    const alCambiar = jest.fn();
    const pantalla = await renderPantalla(
      <BotonFavorito activo alCambiar={alCambiar} etiqueta="Favorita" />,
    );
    const boton = pantalla.getByRole('button', { name: 'Favorita' });
    expect(boton.props.accessibilityState).toEqual({ selected: true });
    await fireEvent.press(boton);
    expect(alCambiar).toHaveBeenCalledTimes(1);
  });
});
