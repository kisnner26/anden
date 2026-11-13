import { describe, expect, it } from '@jest/globals';

import { Autobus } from '@/componentes/Autobus';
import { renderPantalla } from '@/pruebas/render';

import { VehiculoPlus } from './VehiculoPlus';
import { VEHICULOS_PLUS, esVehiculoPlus, nombreDeVehiculo } from './vehiculos';

describe('vehículos de Plus', () => {
  it('hay seis, todos distintos', () => {
    expect(VEHICULOS_PLUS).toHaveLength(6);
    expect(new Set(VEHICULOS_PLUS.map((v) => v.id)).size).toBe(6);
  });

  it('reconoce los identificadores válidos', () => {
    expect(esVehiculoPlus('avion')).toBe(true);
    expect(esVehiculoPlus('clasico-ambar')).toBe(false);
    expect(nombreDeVehiculo('nave')).toBe('Nave espacial');
  });

  it('cada uno se dibuja y se describe cuando se pide', async () => {
    for (const { id, nombre } of VEHICULOS_PLUS) {
      const pantalla = await renderPantalla(
        <VehiculoPlus ancho={100} etiquetaAccesible={nombre} id={id} />,
      );
      expect(pantalla.getByLabelText(nombre)).toBeTruthy();
    }
  });

  it('el bus acepta un vehículo en lugar de una variante', async () => {
    const pantalla = await renderPantalla(
      <Autobus ancho={100} etiquetaAccesible="Mi unidad" variante="tractor" />,
    );
    expect(pantalla.getByLabelText('Mi unidad')).toBeTruthy();
  });
});
