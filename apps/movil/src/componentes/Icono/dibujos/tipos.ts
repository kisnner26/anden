export interface PropiedadesDibujo {
  tamano: number;
  /** solo lo usan los glifos de un color; los íconos ilustrados traen el suyo */
  color?: string;
  /** color de los detalles recortados en los glifos de la barra de pestañas */
  colorDetalle?: string;
}
