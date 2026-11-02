import { describe, expect, it, jest } from '@jest/globals';
import { render } from '@testing-library/react-native';

jest.mock('lucide-react-native', () => {
  const ReactLocal = require('react') as typeof import('react');
  const { View: Vista } =
    require('react-native') as typeof import('react-native');
  const Componente = (propiedades: React.ComponentProps<typeof Vista>) =>
    ReactLocal.createElement(Vista, propiedades);
  return { BusFront: Componente, Map: Componente, Ticket: Componente };
});

import { coloresOscuros } from '@/tema/colores';
import { t } from '@/textos/t';

import { Icono } from './Icono';

describe('Icono', () => {
  it('expone una etiqueta cuando comunica significado', async () => {
    const pantalla = await render(
      <Icono
        color={coloresOscuros.ambar}
        etiquetaAccesible={t('vitrina.iconoBus')}
        nombre="bus"
      />,
    );
    expect(pantalla.getByLabelText('Bus')).toBeTruthy();
  });
});
