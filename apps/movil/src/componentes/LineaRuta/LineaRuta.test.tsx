import { describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { LineaRuta } from './LineaRuta';

const PARADAS = [
  { hora: new Date(2026, 10, 2, 14, 40), nombre: 'Terminal UCA' },
  { hora: new Date(2026, 10, 2, 15, 35), nombre: 'Terminal Boaco' },
];

describe('LineaRuta', () => {
  it('muestra una parada por línea con su hora y su nombre', async () => {
    const pantalla = await render(<LineaRuta paradas={PARADAS} />);
    expect(pantalla.getByLabelText('Terminal UCA, 2:40')).toBeTruthy();
    expect(pantalla.getByLabelText('Terminal Boaco, 3:35')).toBeTruthy();
  });

  it('funciona con una sola parada', async () => {
    const pantalla = await render(<LineaRuta paradas={PARADAS.slice(0, 1)} />);
    expect(pantalla.getByText('Terminal UCA')).toBeTruthy();
  });
});
