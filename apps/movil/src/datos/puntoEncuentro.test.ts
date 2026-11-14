import { afterEach, describe, expect, it, jest } from '@jest/globals';
import { Linking } from 'react-native';

import { abrirPuntoEnMapa, etiquetaPunto, puntoCorto } from './puntoEncuentro';

afterEach(() => {
  jest.restoreAllMocks();
  jest.clearAllMocks();
});

describe('puntoCorto y etiquetaPunto', () => {
  it('muestran los últimos siete signos del código', () => {
    expect(puntoCorto('764M4PPX+HC')).toBe('4PPX+HC');
    expect(etiquetaPunto('764M4PPX+HC')).toBe('punto 4PPX+HC');
  });

  it('dicen que falta confirmar cuando el código está vacío', () => {
    expect(etiquetaPunto('')).toBe('punto por confirmar');
  });
});

describe('abrirPuntoEnMapa', () => {
  it('abre Google Maps con las coordenadas del punto', async () => {
    const abrir = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValue(true as never);
    expect(await abrirPuntoEnMapa('764M4PPX+HC')).toBe(true);
    expect(abrir.mock.calls[0]?.[0]).toMatch(
      /^https:\/\/www\.google\.com\/maps\/search\/\?api=1&query=12\.1\d+,-86\.2\d+$/,
    );
  });

  it('devuelve falso si el código no es válido o el teléfono no puede abrir el mapa', async () => {
    const abrir = jest
      .spyOn(Linking, 'openURL')
      .mockRejectedValue(new Error('x'));
    expect(await abrirPuntoEnMapa('')).toBe(false);
    expect(abrir).not.toHaveBeenCalled();
    expect(await abrirPuntoEnMapa('764M4PPX+HC')).toBe(false);
  });
});
