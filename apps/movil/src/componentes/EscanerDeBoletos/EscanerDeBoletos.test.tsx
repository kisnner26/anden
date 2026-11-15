import { describe, expect, it, jest } from '@jest/globals';
import { fireEvent } from '@testing-library/react-native';

import type { ResultadoDeLectura } from '@/datos/lecturaDeBoleto';
import { renderPantalla } from '@/pruebas/render';

import { EscanerDeBoletos } from './EscanerDeBoletos';

function dibujar(resultado: ResultadoDeLectura) {
  const alLeer = jest.fn((_texto: string) => resultado);
  return renderPantalla(
    <EscanerDeBoletos alCerrar={() => undefined} alLeer={alLeer} visible />,
  ).then((p) => ({ alLeer, p }));
}

function escanear(p: Awaited<ReturnType<typeof renderPantalla>>, data: string) {
  return fireEvent(p.getByTestId('camara-qr'), 'barcodeScanned', { data });
}

describe('EscanerDeBoletos', () => {
  it('al principio pide apuntar al QR', async () => {
    const { p } = await dibujar({ tipo: 'invalido' });
    expect(p.getByText('Apuntá al QR del boleto.')).toBeTruthy();
  });

  it('un boleto válido dice quién sube y en qué asiento', async () => {
    const { alLeer, p } = await dibujar({
      asiento: 8,
      boletoId: 'bol_1',
      nombre: 'Ana Ruiz',
      tipo: 'ok',
    });
    await escanear(p, 'ANDEN:K7RM4QX9');
    expect(alLeer).toHaveBeenCalledWith('ANDEN:K7RM4QX9');
    expect(p.getByText('Sube: asiento 8, Ana Ruiz.')).toBeTruthy();
  });

  it('un boleto de otro viaje se rechaza', async () => {
    const { p } = await dibujar({ tipo: 'otroViaje' });
    await escanear(p, 'ANDEN:K7RM4QX9');
    expect(p.getByText('Este boleto es de otro viaje.')).toBeTruthy();
  });

  it('el mismo QR leído dos veces seguidas cuenta una sola vez', async () => {
    const { alLeer, p } = await dibujar({ tipo: 'invalido' });
    await escanear(p, 'ANDEN:K7RM4QX9');
    await escanear(p, 'ANDEN:K7RM4QX9');
    expect(alLeer).toHaveBeenCalledTimes(1);
  });
});
