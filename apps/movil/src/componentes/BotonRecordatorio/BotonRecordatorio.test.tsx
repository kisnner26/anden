import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { BotonRecordatorio } from './BotonRecordatorio';

describe('BotonRecordatorio', () => {
  it('avisa al tocarlo y refleja si hay aviso puesto', async () => {
    const alPresionar = jest.fn();
    const pantalla = await renderPantalla(
      <BotonRecordatorio activo alPresionar={alPresionar} etiqueta="Aviso" />,
    );
    const boton = pantalla.getByRole('button', { name: 'Aviso' });
    expect(boton.props.accessibilityState).toEqual({ selected: true });
    await fireEvent.press(boton);
    expect(alPresionar).toHaveBeenCalledTimes(1);
  });
});
