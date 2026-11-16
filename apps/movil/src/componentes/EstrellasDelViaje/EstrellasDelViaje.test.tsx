import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { EstrellasDelViaje } from './EstrellasDelViaje';

describe('EstrellasDelViaje', () => {
  it('muestra cinco estrellas', async () => {
    const pantalla = await renderPantalla(
      <EstrellasDelViaje alElegir={jest.fn()} valor={0} />,
    );
    expect(pantalla.getAllByRole('radio')).toHaveLength(5);
  });

  it('tocar una estrella avisa cuántas son', async () => {
    const alElegir = jest.fn();
    const pantalla = await renderPantalla(
      <EstrellasDelViaje alElegir={alElegir} valor={0} />,
    );
    await fireEvent.press(pantalla.getByLabelText('4 de 5 estrellas'));
    expect(alElegir).toHaveBeenCalledWith(4);
  });

  it('marca como elegida solo la estrella del valor', async () => {
    const pantalla = await renderPantalla(
      <EstrellasDelViaje alElegir={jest.fn()} valor={3} />,
    );
    expect(
      pantalla.getByLabelText('3 de 5 estrellas').props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(
      pantalla.getByLabelText('2 de 5 estrellas').props.accessibilityState,
    ).toMatchObject({ selected: false });
  });
});
