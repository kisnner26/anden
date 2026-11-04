import { beforeAll, describe, expect, it } from '@jest/globals';
import { render } from '@testing-library/react-native';

import { crearMuestra } from '@/datos/muestra';
import { armarSalidas, type Salida } from '@/datos/salidas';

import { estadoTablero, TableroSalidas } from './TableroSalidas';

const AHORA = new Date(2026, 10, 2, 14, 20);
let salidas: Salida[];

beforeAll(() => {
  salidas = armarSalidas(crearMuestra(AHORA), AHORA);
});

function de(destino: string, servicio: string, atraso = 0): Salida {
  return salidas.find(
    (salida) =>
      salida.destino === destino &&
      salida.servicio === servicio &&
      salida.minutosAtraso === atraso &&
      salida.estado !== 'en-ruta',
  ) as Salida;
}

describe('estadoTablero', () => {
  it('dice "Salió" y usa una raya si ya partió', () => {
    expect(estadoTablero(salidas[0] as Salida)).toMatchObject({
      forma: 'raya',
      texto: 'Salió',
    });
  });

  it('dice "Abordando" con un punto desde 20 minutos antes', () => {
    expect(estadoTablero(de('Boaco', 'ordinario'))).toMatchObject({
      forma: 'punto',
      texto: 'Abordando',
    });
  });

  it('dice "A tiempo" con un anillo si está programada', () => {
    expect(estadoTablero(de('Juigalpa', 'ordinario'))).toMatchObject({
      forma: 'anillo',
      texto: 'A tiempo',
    });
  });

  it('muestra los minutos de atraso con un rombo', () => {
    expect(estadoTablero(de('Juigalpa', 'expreso', 10))).toMatchObject({
      forma: 'rombo',
      texto: '+10 min',
    });
  });
});

describe('TableroSalidas', () => {
  it('muestra una fila por salida con su resumen accesible', async () => {
    const pantalla = await render(<TableroSalidas salidas={salidas} />);
    expect(pantalla.getByLabelText('Boaco, 2:40, Abordando')).toBeTruthy();
    expect(pantalla.getByLabelText('Juigalpa, 2:52, +10 min')).toBeTruthy();
  });

  it('muestra los encabezados de las columnas', async () => {
    const pantalla = await render(<TableroSalidas salidas={salidas} />);
    expect(pantalla.getByText('Hora')).toBeTruthy();
    expect(pantalla.getByText('Destino')).toBeTruthy();
    expect(pantalla.getByText('Andén')).toBeTruthy();
    expect(pantalla.getByText('Estado')).toBeTruthy();
  });

  it('explica cuando el filtro no deja salidas visibles', async () => {
    const pantalla = await render(<TableroSalidas salidas={[]} />);
    const vacio = pantalla.getByText('No hay salidas con este filtro.');

    expect(vacio.props.accessibilityLiveRegion).toBe('polite');
  });
});
