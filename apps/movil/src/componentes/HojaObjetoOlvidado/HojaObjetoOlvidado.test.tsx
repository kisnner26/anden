import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import { renderPantalla } from '@/pruebas/render';

import { HojaObjetoOlvidado } from './HojaObjetoOlvidado';

describe('HojaObjetoOlvidado', () => {
  it('cerrada no muestra el formulario', async () => {
    const pantalla = await renderPantalla(
      <HojaObjetoOlvidado
        abierta={false}
        alCerrar={() => undefined}
        alEnviar={() => undefined}
      />,
    );
    expect(pantalla.queryByText('Objeto olvidado')).toBeNull();
  });

  it('envía la descripción escrita', async () => {
    const alEnviar = jest.fn();
    const pantalla = await renderPantalla(
      <HojaObjetoOlvidado
        abierta
        alCerrar={() => undefined}
        alEnviar={alEnviar}
      />,
    );
    await fireEvent.changeText(
      pantalla.getByLabelText('Qué dejaste'),
      'mochila azul',
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Guardar reporte' }),
    );
    expect(alEnviar).toHaveBeenCalledWith('mochila azul');
  });

  it('no envía si no se escribió nada y lo explica', async () => {
    const alEnviar = jest.fn();
    const pantalla = await renderPantalla(
      <HojaObjetoOlvidado
        abierta
        alCerrar={() => undefined}
        alEnviar={alEnviar}
      />,
    );
    await fireEvent.press(
      pantalla.getByRole('button', { name: 'Guardar reporte' }),
    );
    expect(alEnviar).not.toHaveBeenCalled();
    expect(
      pantalla.getByText('Escribí qué dejaste, en pocas palabras.'),
    ).toBeTruthy();
  });
});
