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
});
