import { BusFront, Map, Ticket, type LucideIcon } from 'lucide-react-native';

import { tamanosIcono } from '@/tema/espacios';

const ICONOS = {
  boleto: Ticket,
  bus: BusFront,
  ruta: Map,
} satisfies Record<string, LucideIcon>;

export type NombreIcono = keyof typeof ICONOS;
export type TamanoIcono = keyof typeof tamanosIcono;

export interface PropiedadesIcono {
  nombre: NombreIcono;
  color: string;
  tamano?: TamanoIcono;
  etiquetaAccesible?: string;
}

export function Icono({
  nombre,
  color,
  tamano = 'mediano',
  etiquetaAccesible,
}: PropiedadesIcono) {
  const Componente = ICONOS[nombre];
  return (
    <Componente
      accessibilityLabel={etiquetaAccesible}
      accessible={etiquetaAccesible !== undefined}
      color={color}
      size={tamanosIcono[tamano]}
      strokeWidth={1.75}
    />
  );
}
