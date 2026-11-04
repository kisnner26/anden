import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { BarraPestanas, type Pestana } from './BarraPestanas';

const PESTANAS: Pestana[] = [
  { clave: 'viajar', icono: 'pestanaViajar', nombre: 'Viajar' },
  { clave: 'horarios', icono: 'pestanaHorarios', nombre: 'Horarios' },
  { clave: 'rutas', icono: 'pestanaRutas', nombre: 'Rutas' },
  { clave: 'boletos', icono: 'pestanaBoletos', nombre: 'Boletos' },
];

describe('BarraPestanas', () => {
  it('muestra las cuatro pestañas', async () => {
    const pantalla = await renderPantalla(
      <BarraPestanas
        activa="viajar"
        alSeleccionar={() => undefined}
        pestanas={PESTANAS}
      />,
    );
    expect(pantalla.getAllByRole('tab')).toHaveLength(4);
  });

  it('marca como seleccionada solo la activa', async () => {
    const pantalla = await renderPantalla(
      <BarraPestanas
        activa="horarios"
        alSeleccionar={() => undefined}
        pestanas={PESTANAS}
      />,
    );
    expect(
      pantalla.getByRole('tab', { name: 'Horarios' }).props.accessibilityState,
    ).toEqual({ selected: true });
    expect(
      pantalla.getByRole('tab', { name: 'Viajar' }).props.accessibilityState,
    ).toEqual({ selected: false });
  });

  it('avisa la clave de la pestaña presionada', async () => {
    const alSeleccionar = jest.fn();
    const pantalla = await renderPantalla(
      <BarraPestanas
        activa="viajar"
        alSeleccionar={alSeleccionar}
        pestanas={PESTANAS}
      />,
    );
    await fireEvent.press(pantalla.getByRole('tab', { name: 'Boletos' }));
    expect(alSeleccionar).toHaveBeenCalledWith('boletos');
  });
});
