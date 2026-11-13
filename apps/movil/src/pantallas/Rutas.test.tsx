import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { Rutas } from './Rutas';

function total(pantalla: Awaited<ReturnType<typeof renderPantalla>>): number {
  const texto = pantalla.getByText(/^C\$ \d+$/).props.children as string;
  return Number(texto.replace('C$ ', ''));
}

describe('Rutas', () => {
  it('empieza con Boaco desde Managua y muestra el trayecto', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(pantalla.getByText('Rutas.')).toBeTruthy();
    expect(
      pantalla.getByRole('tab', { name: 'Boaco' }).props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(
      pantalla.getByRole('tab', { name: 'Desde Managua' }).props
        .accessibilityState,
    ).toMatchObject({ selected: true });
    expect(pantalla.getByText('duración (ETA)')).toBeTruthy();
  });

  it('cambiar de ciudad y de sentido cambia el trayecto', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    await fireEvent.press(pantalla.getByRole('tab', { name: 'Juigalpa' }));
    await fireEvent.press(pantalla.getByRole('tab', { name: 'Hacia Managua' }));
    expect(
      pantalla.getByRole('tab', { name: 'Juigalpa' }).props.accessibilityState,
    ).toMatchObject({ selected: true });
    expect(pantalla.getAllByText('Juigalpa').length).toBeGreaterThan(1);
  });

  it('ofrece las salidas como fichas y marca la elegida', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    const fichas = pantalla.getAllByRole('button', { name: /libres|Agotado/ });
    expect(fichas.length).toBeGreaterThan(0);
    expect(fichas[0]?.props.accessibilityState).toMatchObject({
      selected: true,
    });
    if (fichas.length > 1) {
      await fireEvent.press(fichas[1]!);
      expect(
        pantalla.getAllByRole('button', { name: /libres|Agotado/ })[1]?.props
          .accessibilityState,
      ).toMatchObject({ selected: true });
    }
  });

  it('el total sube con los pasajeros y no pasa de seis', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    const unitario = total(pantalla);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Más pasajeros' }),
    );
    expect(total(pantalla)).toBe(unitario * 2);
    for (let i = 0; i < 8; i += 1) {
      await fireEvent.press(
        pantalla.getByRole('button', { name: 'Más pasajeros' }),
      );
    }
    expect(total(pantalla)).toBe(unitario * 6);
    expect(
      pantalla.getByRole('button', { name: 'Más pasajeros' }).props
        .accessibilityState,
    ).toMatchObject({ disabled: true });
  });

  it('dice a qué hora llega como estimación y no como promesa', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(pantalla.getByText('Salís')).toBeTruthy();
    expect(pantalla.getByText('Llegás (ETA)')).toBeTruthy();
  });

  it('elegir asientos lleva a la salida escogida', async () => {
    const alElegirAsientos = jest.fn();
    const pantalla = await renderPantalla(
      <Rutas alElegirAsientos={alElegirAsientos} />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Elegir asientos' }),
    );
    expect(alElegirAsientos).toHaveBeenCalledTimes(1);
    expect(alElegirAsientos.mock.calls[0]?.[0]).toMatch(/^via_/);
  });

  it('abre el mapa del corredor', async () => {
    const alAbrirRuta = jest.fn();
    const pantalla = await renderPantalla(<Rutas alAbrirRuta={alAbrirRuta} />);
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Ver el mapa del corredor' }),
    );
    expect(alAbrirRuta).toHaveBeenCalledWith('cor_man_boa');
  });

  it('ofrece enviar una encomienda', async () => {
    const alAbrirEncomiendas = jest.fn();
    const pantalla = await renderPantalla(
      <Rutas alAbrirEncomiendas={alAbrirEncomiendas} />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: /Enviar una encomienda/ }),
    );
    expect(alAbrirEncomiendas).toHaveBeenCalledTimes(1);
  });

  it('avisa que los datos son ilustrativos', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(
      pantalla.getByText(/ilustrativos hasta tener datos en vivo/),
    ).toBeTruthy();
  });
});
