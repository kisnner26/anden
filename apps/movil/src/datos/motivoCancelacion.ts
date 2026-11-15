/** por qué un conductor cancela un viaje con pasajeros; se guarda en el viaje y lo ven quienes tenían boleto */
export const MOTIVOS_CANCELACION = [
  'averia',
  'clima',
  'pocos',
  'otro',
] as const;

export type MotivoCancelacion = (typeof MOTIVOS_CANCELACION)[number];

export function esMotivoCancelacion(
  valor: unknown,
): valor is MotivoCancelacion {
  return (
    typeof valor === 'string' &&
    (MOTIVOS_CANCELACION as readonly string[]).includes(valor)
  );
}
