import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { Rutas } from './Rutas';

afterEach(() => reiniciarMuestra());

describe('Rutas', () => {
  it('lista las seis rutas de la terminal', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(pantalla.getAllByRole('header')).toHaveLength(6);
    expect(pantalla.getAllByText('Granada').length).toBeGreaterThan(0);
    expect(pantalla.getAllByText('Estelí').length).toBeGreaterThan(0);
  });

  it('muestra los kilómetros y la duración de cada ruta', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(pantalla.getByText('45 km · 55 min')).toBeTruthy();
    expect(pantalla.getByText('148 km · 2 h 30 min')).toBeTruthy();
  });

  it('muestra los servicios con su tarifa de muestra', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(pantalla.getByText('C$ 46')).toBeTruthy();
    expect(pantalla.getByText('Taxi interlocal')).toBeTruthy();
    expect(pantalla.getByText('C$ 120')).toBeTruthy();
  });

  it('abre el detalle desde un nodo del mapa', async () => {
    const alAbrirRuta = jest.fn();
    const pantalla = await renderPantalla(<Rutas alAbrirRuta={alAbrirRuta} />);
    await fireEvent.press(
      pantalla.getAllByRole('button', {
        name: 'Abrir ruta a Granada',
      })[0] as never,
    );
    expect(alAbrirRuta).toHaveBeenCalledWith('rut_uca_gra');
  });
});
