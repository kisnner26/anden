import AsyncStorage from '@react-native-async-storage/async-storage';
import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { fireEvent, waitFor } from '@testing-library/react-native';

import { CLAVE_OPINIONES } from '@/datos/opiniones';
import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { CalificarViaje } from './CalificarViaje';

const GUARDADO = boletoDePrueba(new Date(2026, 10, 13, 8, 0));

beforeEach(async () => {
  await AsyncStorage.clear();
});

describe('CalificarViaje', () => {
  it('pregunta cómo le fue con el chofer y muestra las cinco estrellas', async () => {
    const p = await renderPantalla(<CalificarViaje guardado={GUARDADO} />);
    expect(await p.findByText('¿Cómo te fue con Marvin?')).toBeTruthy();
    expect(p.getAllByRole('button', { name: /estrellas$/ })).toHaveLength(5);
  });

  it('elegir estrellas muestra la palabra, las etiquetas rápidas y el botón', async () => {
    const p = await renderPantalla(<CalificarViaje guardado={GUARDADO} />);
    await p.findByText('¿Cómo te fue con Marvin?');
    await fireEvent.press(p.getByRole('button', { name: '5 estrellas' }));
    expect(p.getByText('Excelente')).toBeTruthy();
    expect(p.getByRole('button', { name: 'Puntual' })).toBeTruthy();
    expect(p.getByRole('button', { name: 'Enviar opinión' })).toBeTruthy();
  });

  it('con pocas estrellas las etiquetas señalan lo que falló', async () => {
    const p = await renderPantalla(<CalificarViaje guardado={GUARDADO} />);
    await p.findByText('¿Cómo te fue con Marvin?');
    await fireEvent.press(p.getByRole('button', { name: '2 estrellas' }));
    expect(p.getByRole('button', { name: 'Llegó tarde' })).toBeTruthy();
    expect(p.queryByRole('button', { name: 'Puntual' })).toBeNull();
  });

  it('al enviar guarda la opinión del boleto con las etiquetas y agradece', async () => {
    const alCalificar = jest.fn();
    const p = await renderPantalla(
      <CalificarViaje alCalificar={alCalificar} guardado={GUARDADO} />,
    );
    await p.findByText('¿Cómo te fue con Marvin?');
    await fireEvent.press(p.getByRole('button', { name: '4 estrellas' }));
    await fireEvent.press(p.getByRole('button', { name: 'Puntual' }));
    await fireEvent.changeText(
      p.getByLabelText('Comentario (opcional)'),
      'todo bien',
    );
    await fireEvent.press(p.getByRole('button', { name: 'Enviar opinión' }));
    expect(await p.findByTestId('calificacion-enviada')).toBeTruthy();
    expect(alCalificar).toHaveBeenCalledTimes(1);
    const guardado = JSON.parse(
      (await AsyncStorage.getItem(CLAVE_OPINIONES)) ?? '[]',
    );
    expect(guardado).toHaveLength(1);
    expect(guardado[0]).toMatchObject({
      boletoId: 'bol_K7RM4QX9',
      choferId: 'cho_2',
      comentario: 'Puntual · todo bien',
      estrellas: 4,
    });
  });

  it('un viaje que ya se calificó no vuelve a pedirlo', async () => {
    await AsyncStorage.setItem(
      CLAVE_OPINIONES,
      JSON.stringify([
        {
          boletoId: 'bol_K7RM4QX9',
          choferId: 'cho_2',
          comentario: '',
          creadaEn: new Date().toISOString(),
          estrellas: 5,
          id: 'op_1',
        },
      ]),
    );
    const p = await renderPantalla(<CalificarViaje guardado={GUARDADO} />);
    await waitFor(() => expect(p.queryByTestId('calificar-viaje')).toBeNull());
    expect(p.queryByText('¿Cómo te fue con Marvin?')).toBeNull();
  });
});
