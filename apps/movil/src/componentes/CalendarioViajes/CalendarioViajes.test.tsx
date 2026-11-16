import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent, render } from '@testing-library/react-native';

import { boletoDePrueba } from '@/pruebas/boletos';
import { t } from '@/textos/t';

import { CalendarioViajes } from './CalendarioViajes';

const AHORA = new Date(2026, 10, 20, 10, 0);
const BOLETOS = [
  boletoDePrueba(new Date(2026, 9, 5, 9, 0), 1, 'AAAA1111'),
  boletoDePrueba(new Date(2026, 10, 12, 9, 0), 2, 'BBBB2222'),
];

describe('CalendarioViajes', () => {
  it('empieza en el último mes con viajes', async () => {
    const pantalla = await render(
      <CalendarioViajes
        ahora={AHORA}
        alAbrirBoleto={jest.fn()}
        boletos={BOLETOS}
      />,
    );
    expect(pantalla.getByText('Noviembre')).toBeTruthy();
    expect(pantalla.getByText('2026')).toBeTruthy();
  });

  it('permite ir atrás pero no adelante desde el último mes', async () => {
    const pantalla = await render(
      <CalendarioViajes
        ahora={AHORA}
        alAbrirBoleto={jest.fn()}
        boletos={BOLETOS}
      />,
    );
    expect(
      pantalla.getByRole('button', { name: t('boletos.mesAnterior') }).props
        .accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: false }));
    expect(
      pantalla.getByRole('button', { name: t('boletos.mesSiguiente') }).props
        .accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true }));
  });

  it('el mes anterior muestra octubre', async () => {
    const pantalla = await render(
      <CalendarioViajes
        ahora={AHORA}
        alAbrirBoleto={jest.fn()}
        boletos={BOLETOS}
      />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: t('boletos.mesAnterior') }),
    );
    expect(pantalla.getByText('Octubre')).toBeTruthy();
  });

  it('en el primer mes con viajes ya no se puede ir más atrás', async () => {
    const pantalla = await render(
      <CalendarioViajes
        ahora={AHORA}
        alAbrirBoleto={jest.fn()}
        boletos={BOLETOS}
      />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: t('boletos.mesAnterior') }),
    );
    expect(
      pantalla.getByRole('button', { name: t('boletos.mesAnterior') }).props
        .accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true }));
  });

  it('sin boletos muestra el mes de hoy y las dos flechas apagadas', async () => {
    const pantalla = await render(
      <CalendarioViajes ahora={AHORA} alAbrirBoleto={jest.fn()} boletos={[]} />,
    );
    expect(pantalla.getByText('Noviembre')).toBeTruthy();
    expect(
      pantalla.getByRole('button', { name: t('boletos.mesAnterior') }).props
        .accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true }));
    expect(
      pantalla.getByRole('button', { name: t('boletos.mesSiguiente') }).props
        .accessibilityState,
    ).toEqual(expect.objectContaining({ disabled: true }));
  });
});
