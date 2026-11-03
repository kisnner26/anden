import { afterEach, describe, expect, it } from '@jest/globals';

import { reiniciarMuestra } from '@/datos/useSalidas';
import { renderPantalla } from '@/pruebas/render';

import { Rutas } from './Rutas';

afterEach(() => reiniciarMuestra());

describe('Rutas', () => {
  it('lista las seis rutas de la terminal', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(pantalla.getAllByRole('header')).toHaveLength(6);
    expect(pantalla.getByText('Granada')).toBeTruthy();
    expect(pantalla.getByText('Estelí')).toBeTruthy();
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

  it('anuncia que el mapa llega pronto', async () => {
    const pantalla = await renderPantalla(<Rutas />);
    expect(
      pantalla.getByText(
        'El mapa con el recorrido y el bus en vivo llega pronto.',
      ),
    ).toBeTruthy();
  });
});
