import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

jest.mock('@/servicios/supabase/objetosPerdidosSupabase', () => ({
  reportarObjeto: jest.fn(async () => true),
}));

import * as servicio from '@/servicios/supabase/objetosPerdidosSupabase';
import { renderPantalla } from '@/pruebas/render';

import { ReportarObjeto } from './ReportarObjeto';

function dibujar() {
  return renderPantalla(
    <ReportarObjeto abierta alCerrar={() => undefined} viajeId="via_1" />,
  );
}

describe('ReportarObjeto', () => {
  it('no deja avisar sin decir qué es', async () => {
    const p = await dibujar();
    expect(
      p.getByRole('button', { name: 'Avisar a los pasajeros' }).props
        .accessibilityState?.disabled,
    ).toBe(true);
  });

  it('manda el objeto con su descripción y confirma', async () => {
    const p = await dibujar();
    await fireEvent.changeText(p.getByLabelText('¿Qué es?'), 'Mochila negra');
    await fireEvent.press(
      p.getByRole('button', { name: 'Avisar a los pasajeros' }),
    );
    expect(servicio.reportarObjeto).toHaveBeenCalledWith(
      'via_1',
      'Mochila negra',
      null,
    );
    expect(
      await p.findByText('Listo: quienes viajaron ya lo ven en su boleto.'),
    ).toBeTruthy();
  });
});
