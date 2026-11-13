import { describe, expect, it } from '@jest/globals';

import { Autobus } from '@/componentes/Autobus';
import { VEHICULOS_PLUS, VehiculoPlus } from '@/componentes/VehiculoPlus';
import { ContextoBusPropio } from '@/datos/useBusPropio';
import { renderPantalla } from '@/pruebas/render';

describe('efectos de los vehículos', () => {
  it('cada vehículo de Plus se anima sin romperse', async () => {
    for (const { id, nombre } of VEHICULOS_PLUS) {
      const pantalla = await renderPantalla(
        <VehiculoPlus animado ancho={160} etiquetaAccesible={nombre} id={id} />,
      );
      expect(pantalla.getByLabelText(nombre)).toBeTruthy();
    }
  });

  it('un bus animado y espejado también se dibuja', async () => {
    const pantalla = await renderPantalla(
      <Autobus animado ancho={120} espejo etiquetaAccesible="Bus" />,
    );
    expect(pantalla.getByLabelText('Bus')).toBeTruthy();
  });
});

describe('la unidad que eligió la persona', () => {
  const contexto = (efectivo: 'avion' | null) => ({
    efectivo,
    elegido: efectivo,
    elegir: async () => undefined,
  });

  it('con Plus reemplaza al bus genérico por su vehículo', async () => {
    const pantalla = await renderPantalla(
      <ContextoBusPropio.Provider value={contexto('avion')}>
        <Autobus
          ancho={100}

          usarMiUnidad
          variante="clasico-verde"
        />
      </ContextoBusPropio.Provider>,
    );
    expect(
      pantalla.queryByLabelText('Avión', { includeHiddenElements: true }),
    ).toBeTruthy();
  });

  it('sin Plus o sin pedirlo se queda el bus', async () => {
    const sinPlus = await renderPantalla(
      <ContextoBusPropio.Provider value={contexto(null)}>
        <Autobus
          ancho={100}

          usarMiUnidad
          variante="clasico-verde"
        />
      </ContextoBusPropio.Provider>,
    );
    expect(
      sinPlus.queryByLabelText('Avión', { includeHiddenElements: true }),
    ).toBeNull();
    const sinPedir = await renderPantalla(
      <ContextoBusPropio.Provider value={contexto('avion')}>
        <Autobus
          ancho={100}

          variante="clasico-verde"
        />
      </ContextoBusPropio.Provider>,
    );
    expect(
      sinPedir.queryByLabelText('Avión', { includeHiddenElements: true }),
    ).toBeNull();
  });
});
