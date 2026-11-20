import { describe, expect, it } from '@jest/globals';

import { boletoDePrueba } from '@/pruebas/boletos';
import { renderPantalla } from '@/pruebas/render';

import { BoletoDePapel } from './BoletoDePapel';

const GUARDADO = boletoDePrueba(new Date(2026, 10, 17, 8, 0));

async function dibujar(guardado = GUARDADO) {
  return renderPantalla(<BoletoDePapel guardado={guardado} />);
}

describe('BoletoDePapel', () => {
  it('lleva el nombre de la cooperativa en mayúsculas', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('COOPERATIVA DE MUESTRA')).toBeTruthy();
  });

  it('rotula el servicio y el trayecto como el boleto impreso', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('ORDINARIO INTERLOCAL')).toBeTruthy();
    expect(pantalla.getByText('BOACO')).toBeTruthy();
  });

  it('con terminal de origen el trayecto lleva las dos ciudades', async () => {
    const pantalla = await dibujar({
      ...GUARDADO,
      resumen: { ...GUARDADO.resumen, origen: 'Managua' },
    });
    expect(pantalla.getByText('MANAGUA–BOACO')).toBeTruthy();
  });

  it('muestra el asiento y el valor escritos a mano', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('8')).toBeTruthy();
    expect(pantalla.getByText('C$ 46')).toBeTruthy();
    expect(pantalla.getByText('ASIENTO')).toBeTruthy();
    expect(pantalla.getByText('VALOR')).toBeTruthy();
  });

  it('muestra los teléfonos de información con su operador', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('CLARO')).toBeTruthy();
    expect(pantalla.getByText('8000-0001')).toBeTruthy();
    expect(pantalla.getByText('TIGO')).toBeTruthy();
    expect(pantalla.getByText('8000-0002')).toBeTruthy();
  });

  it('trae el código de abordaje con su QR', async () => {
    const pantalla = await dibujar();
    expect(pantalla.getByText('K7RM4QX9')).toBeTruthy();
    expect(pantalla.getByLabelText('QR K7RM4QX9')).toBeTruthy();
  });

  it('cierra con las leyendas y la bendición', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByText('SE HACEN VIAJES DE TURISMO DENTRO Y FUERA DEL PAÍS'),
    ).toBeTruthy();
    expect(pantalla.getByText('Bendición de Dios')).toBeTruthy();
  });

  it('se anuncia completo a los lectores de pantalla', async () => {
    const pantalla = await dibujar();
    expect(
      pantalla.getByLabelText(
        /Tu boleto de papel: Ordinario interlocal BOACO, Asiento 8, Valor C\$ 46/,
      ),
    ).toBeTruthy();
  });
});
