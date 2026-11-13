export type Tema = 'claro' | 'oscuro';
export type Densidad = 'compacta' | 'comoda';

const CLAVE = 'anden.panel.ajustes';

export interface AjustesPanel {
  densidad: Densidad;
  menuAbierto: boolean;
  tema: Tema;
}

const INICIALES: AjustesPanel = {
  densidad: 'compacta',
  menuAbierto: true,
  tema: 'oscuro',
};

/** lo que la persona eligió la última vez; si el navegador no deja leerlo se usan los valores de siempre */
export function leerAjustes(): AjustesPanel {
  try {
    return {
      ...INICIALES,
      ...(JSON.parse(
        localStorage.getItem(CLAVE) ?? '{}',
      ) as Partial<AjustesPanel>),
    };
  } catch {
    return INICIALES;
  }
}

export function guardarAjustes(ajustes: AjustesPanel): void {
  try {
    localStorage.setItem(CLAVE, JSON.stringify(ajustes));
  } catch {
    // sin almacenamiento el panel igual funciona
  }
}
