import { describe, expect, it } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { Avatar } from './Avatar';

describe('Avatar', () => {
  it('muestra las iniciales cuando no hay foto', async () => {
    const pantalla = await renderPantalla(
      <Avatar descripcion="Tu foto" iniciales="KR" />,
    );
    expect(pantalla.getByText('KR')).toBeTruthy();
    expect(pantalla.queryByTestId('avatar-foto')).toBeNull();
  });

  it('muestra la foto cuando hay una', async () => {
    const pantalla = await renderPantalla(
      <Avatar descripcion="Tu foto" iniciales="KR" uri="file:///foto.jpg" />,
    );
    expect(pantalla.getByTestId('avatar-foto')).toBeTruthy();
  });

  it('vuelve a las iniciales si la foto no carga', async () => {
    const pantalla = await renderPantalla(
      <Avatar descripcion="Tu foto" iniciales="KR" uri="file:///rota.jpg" />,
    );
    await fireEvent(pantalla.getByTestId('avatar-foto'), 'error');
    expect(pantalla.getByText('KR')).toBeTruthy();
  });

  it('se anuncia como imagen con su descripción', async () => {
    const pantalla = await renderPantalla(
      <Avatar descripcion="Tu foto" iniciales="" />,
    );
    expect(pantalla.getByRole('image', { name: 'Tu foto' })).toBeTruthy();
  });
});
