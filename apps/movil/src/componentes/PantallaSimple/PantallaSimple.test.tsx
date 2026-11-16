import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';
import { Text } from 'react-native';

import { renderPantalla } from '@/pruebas/render';
import { t } from '@/textos/t';

import { PantallaSimple } from './PantallaSimple';

describe('PantallaSimple', () => {
  it('muestra el título como encabezado', async () => {
    const pantalla = await renderPantalla(
      <PantallaSimple alSalir={jest.fn()} titulo="Tus boletos">
        <Text>hijo</Text>
      </PantallaSimple>,
    );
    expect(pantalla.getByRole('header')).toBeTruthy();
    expect(pantalla.getByText('Tus boletos')).toBeTruthy();
  });

  it('muestra lo que lleva dentro y la indicación', async () => {
    const pantalla = await renderPantalla(
      <PantallaSimple
        alSalir={jest.fn()}
        indicacion="Tocá un boleto"
        titulo="Tus boletos"
      >
        <Text>hijo</Text>
      </PantallaSimple>,
    );
    expect(pantalla.getByText('hijo')).toBeTruthy();
    expect(pantalla.getByText('Tocá un boleto')).toBeTruthy();
  });
});
