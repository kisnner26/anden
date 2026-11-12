import { describe, expect, it, jest } from '@jest/globals';
import { Linking } from 'react-native';

import { abrirIndicacionesAppleMaps, urlIndicacionesAppleMaps } from './mapas';

const MAYOREO = {
  coordenadas: { lat: 12.13413, lng: -86.1933 },
  nombre: 'Mercado Mayoreo',
};

describe('urlIndicacionesAppleMaps', () => {
  it('apunta al dominio de Apple Maps con destino y modo en auto', () => {
    const url = new URL(urlIndicacionesAppleMaps(MAYOREO));
    expect(url.origin).toBe('https://maps.apple.com');
    expect(url.searchParams.get('daddr')).toBe('Mercado Mayoreo');
    expect(url.searchParams.get('ll')).toBe('12.13413,-86.1933');
    expect(url.searchParams.get('dirflg')).toBe('d');
  });

  it('codifica el nombre del lugar', () => {
    const url = urlIndicacionesAppleMaps({
      coordenadas: { lat: 12.09172, lng: -85.36106 },
      nombre: 'Terminal Mayales & Anexo',
    });
    expect(url).toContain('daddr=Terminal%20Mayales%20%26%20Anexo');
  });

  it('no incluye la posición de la persona', () => {
    // ll son las coordenadas del destino, no las de la persona
    expect(urlIndicacionesAppleMaps(MAYOREO)).not.toMatch(/saddr/);
  });
});

describe('abrirIndicacionesAppleMaps', () => {
  it('abre el enlace y confirma', async () => {
    const abrir = jest
      .spyOn(Linking, 'openURL')
      .mockResolvedValueOnce(undefined as never);
    await expect(abrirIndicacionesAppleMaps(MAYOREO)).resolves.toBe(true);
    expect(abrir).toHaveBeenCalledWith(urlIndicacionesAppleMaps(MAYOREO));
  });

  it('devuelve false si el sistema no puede abrirlo', async () => {
    jest.spyOn(Linking, 'openURL').mockRejectedValueOnce(new Error('no'));
    await expect(abrirIndicacionesAppleMaps(MAYOREO)).resolves.toBe(false);
  });
});
