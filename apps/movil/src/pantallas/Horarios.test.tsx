import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { ProveedorFavoritos } from '@/datos/ProveedorFavoritos';
import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { Horarios } from './Horarios';

afterEach(() => reiniciarMuestra());

describe('Horarios', () => {
  it('muestra el título y la terminal', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    expect(pantalla.getByText('Mercado Mayoreo')).toBeTruthy();
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

  it('la lupa abre el buscador', async () => {
    const alAbrirBuscador = jest.fn();
    const pantalla = await renderPantalla(
      <Horarios alAbrirBuscador={alAbrirBuscador} />,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Buscar' }));
    expect(alAbrirBuscador).toHaveBeenCalledTimes(1);
  });

  it('destaca la próxima salida con cuánto falta y los asientos', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    expect(pantalla.getByText('Próxima salida')).toBeTruthy();
    expect(
      pantalla.getByText(/^Sale en \d+ min · (\d+ libres|Pocos asientos)$/),
    ).toBeTruthy();
  });

  it('lista la disponibilidad de las salidas que faltan', async () => {
    const pantalla = await renderPantalla(<Horarios />);
    expect(pantalla.getByText('Disponibilidad')).toBeTruthy();
    expect(
      pantalla.getAllByText(/^\d+ libres$|^Pocos asientos · \d+$|^Agotado$/)
        .length,
    ).toBeGreaterThan(0);
  });

  it('explica cómo marcar favoritas cuando no hay ninguna', async () => {
    const pantalla = await renderPantalla(
      <ProveedorFavoritos>
        <Horarios />
      </ProveedorFavoritos>,
    );
    await fireEvent.press(pantalla.getByRole('button', { name: 'Mis rutas' }));
    expect(
      pantalla.getByText('Marcá una ruta con la estrella para verla acá.'),
    ).toBeTruthy();
  });
});
