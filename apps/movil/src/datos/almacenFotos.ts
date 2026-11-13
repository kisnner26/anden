import { Directory, File, Paths } from 'expo-file-system';

/** carpeta, dentro de los documentos de la app, donde viven las fotos que la persona elige */
const CARPETA = 'fotos';
const PREFIJO = `${CARPETA}/`;

/** una referencia guardada empieza con la carpeta; cualquier otra es una ruta completa de una versión anterior */
export function esReferenciaGuardada(referencia: string): boolean {
  return referencia.startsWith(PREFIJO);
}

/** el nombre del archivo guardado: conserva la extensión del original y no repite nombres */
export function nombreDeFoto(
  origen: string,
  ahora: number,
  azar: number,
): string {
  const extension =
    /\.(jpe?g|png|heic|webp)(\?.*)?$/i.exec(origen)?.[1]?.toLowerCase() ??
    'jpg';
  return `${ahora.toString(36)}${Math.floor(azar * 1e9).toString(36)}.${extension}`;
}

/**
 * copia la foto elegida a los documentos de la app: la que entrega la galería vive en una carpeta temporal
 * que el sistema vacía, y con ella se perdería la foto de perfil o la de la cédula. Devuelve la referencia
 * relativa, que no cambia aunque el sistema mueva la carpeta de la app.
 */
export function guardarFoto(origen: string): string {
  const carpeta = new Directory(Paths.document, CARPETA);
  carpeta.create({ idempotent: true, intermediates: true });
  const nombre = nombreDeFoto(origen, Date.now(), Math.random());
  new File(origen).copy(new File(carpeta, nombre));
  return `${PREFIJO}${nombre}`;
}

/** la ruta que entiende <Image>: resuelve la referencia guardada contra los documentos de hoy */
export function resolverFoto(referencia: string): string {
  return esReferenciaGuardada(referencia)
    ? new File(Paths.document, referencia).uri
    : referencia;
}

/** quita la copia de una foto que la persona reemplazó o eliminó; con una ruta antigua no hace nada */
export function borrarFoto(referencia: string): void {
  if (!esReferenciaGuardada(referencia)) return;
  try {
    const archivo = new File(Paths.document, referencia);
    if (archivo.exists) archivo.delete();
  } catch {
    /* si no se puede borrar, solo queda un archivo huérfano */
  }
}
