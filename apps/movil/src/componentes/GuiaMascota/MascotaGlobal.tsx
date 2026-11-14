import { usePathname } from 'expo-router';

import type { PantallaMascota } from '@/datos/mascota';

import { GuiaMascota } from './GuiaMascota';

/** qué pestaña es cada ruta; en las demás pantallas Rumbo se queda en su casa */
const PANTALLAS: Readonly<Record<string, PantallaMascota>> = {
  '/': 'viajar',
  '/boletos': 'boletos',
  '/horarios': 'horarios',
  '/rutas': 'rutas',
  '/viajar': 'viajar',
};

/**
 * Rumbo es uno solo para toda la app: vive encima de las pestañas, no se reinicia al cambiar de una a otra y reacciona
 * a lo que pasa (comprar, calificar, pasar un boleto, perder la señal)
 */
export function MascotaGlobal() {
  const ruta = usePathname();
  const pantalla = PANTALLAS[ruta];
  if (pantalla === undefined) return null;
  return <GuiaMascota pantalla={pantalla} />;
}
