import { afterEach, describe, expect, it } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { Horarios } from './Horarios';

afterEach(() => reiniciarMuestra());

describe('Horarios', () => {
  it('muestra el título y la terminal', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    expect(pantalla.getByText('Terminal UCA')).toBeTruthy();
    expect(pantalla.getByTestId('tablero-salidas')).toBeTruthy();
  });

  it('muestra las ocho salidas sin filtro', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    expect(
      pantalla.getAllByLabelText(/, (Salió|Abordando|A tiempo|\+\d+ min)$/),
    ).toHaveLength(8);
  });

  it('filtra por servicio expreso', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    await fireEvent.press(pantalla.getByRole('button', { name: 'Expreso' }));
    expect(
      pantalla.getAllByLabelText(/, (Salió|Abordando|A tiempo|\+\d+ min)$/),
    ).toHaveLength(3);
    expect(
      pantalla.getByRole('button', { name: 'Expreso' }).props
        .accessibilityState,
    ).toMatchObject({ selected: true });
  });

  it('vuelve a mostrar todas con el filtro Todos', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    await fireEvent.press(pantalla.getByRole('button', { name: 'Taxi' }));
    await fireEvent.press(pantalla.getByRole('button', { name: 'Todos' }));
    expect(
      pantalla.getAllByLabelText(/, (Salió|Abordando|A tiempo|\+\d+ min)$/),
    ).toHaveLength(8);
  });
});
