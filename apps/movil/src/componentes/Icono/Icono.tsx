import type { ReactElement } from 'react';
import { View } from 'react-native';

import { tamanosIcono } from '@/tema/espacios';

import { DibujoBoleto } from './dibujos/Boleto';
import { DibujoCampana } from './dibujos/Campana';
import { DibujoConfirmar } from './dibujos/Confirmar';
import { DibujoLupa } from './dibujos/Lupa';
import { DibujoMas } from './dibujos/Mas';
import { DibujoPestanaBoletos } from './dibujos/PestanaBoletos';
import { DibujoPestanaHorarios } from './dibujos/PestanaHorarios';
import { DibujoPestanaRutas } from './dibujos/PestanaRutas';
import { DibujoPestanaViajar } from './dibujos/PestanaViajar';
import { DibujoRayo } from './dibujos/Rayo';
import { DibujoReloj } from './dibujos/Reloj';
import { DibujoSiguiente } from './dibujos/Siguiente';
import { DibujoTaxi } from './dibujos/Taxi';
import type { PropiedadesDibujo } from './dibujos/tipos';
import { DibujoVolante } from './dibujos/Volante';
import { DibujoVolver } from './dibujos/Volver';

const DIBUJOS = {
  boleto: DibujoBoleto,
  campana: DibujoCampana,
  confirmar: DibujoConfirmar,
  lupa: DibujoLupa,
  mas: DibujoMas,
  pestanaBoletos: DibujoPestanaBoletos,
  pestanaHorarios: DibujoPestanaHorarios,
  pestanaRutas: DibujoPestanaRutas,
  pestanaViajar: DibujoPestanaViajar,
  rayo: DibujoRayo,
  reloj: DibujoReloj,
  siguiente: DibujoSiguiente,
  taxi: DibujoTaxi,
  volante: DibujoVolante,
  volver: DibujoVolver,
} satisfies Record<string, (propiedades: PropiedadesDibujo) => ReactElement>;

export type NombreIcono = keyof typeof DIBUJOS;
export type TamanoIcono = keyof typeof tamanosIcono;

export const NOMBRES_ICONO = Object.keys(DIBUJOS) as NombreIcono[];

export interface PropiedadesIcono {
  nombre: NombreIcono;
  tamano?: TamanoIcono;
  /** color de los glifos de un color; los íconos ilustrados traen el suyo */
  color?: string;
  /** color de los detalles recortados en los glifos de la barra de pestañas */
  colorDetalle?: string;
  /** sin etiqueta el ícono es decorativo y se oculta a los lectores de pantalla */
  etiquetaAccesible?: string;
}

export function Icono({
  nombre,
  tamano = 'destacado',
  color,
  colorDetalle,
  etiquetaAccesible,
}: PropiedadesIcono) {
  const Dibujo = DIBUJOS[nombre];
  const medida = tamanosIcono[tamano];
  const comunica = etiquetaAccesible !== undefined;

  return (
    <View
      accessibilityElementsHidden={!comunica}
      accessibilityLabel={etiquetaAccesible}
      accessibilityRole={comunica ? 'image' : undefined}
      accessible={comunica}
      importantForAccessibility={comunica ? 'yes' : 'no-hide-descendants'}
      style={{ height: medida, width: medida }}
    >
      <Dibujo color={color} colorDetalle={colorDetalle} tamano={medida} />
    </View>
  );
}
