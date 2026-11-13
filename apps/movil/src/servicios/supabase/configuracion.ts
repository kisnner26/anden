export interface ConfiguracionSupabase {
  claveAnonima: string;
  url: string;
}

/**
 * las variables públicas se leen con el nombre completo y punto: así Expo las escribe dentro del
 * empaquetado al compilar. Leer `process.env` entero las deja vacías en la app instalada.
 */
function variablesDelEntorno(): Record<string, string | undefined> {
  return {
    EXPO_PUBLIC_SUPABASE_ANON_KEY: process.env.EXPO_PUBLIC_SUPABASE_ANON_KEY,
    EXPO_PUBLIC_SUPABASE_URL: process.env.EXPO_PUBLIC_SUPABASE_URL,
  };
}

/** las dos variables públicas del proyecto; sin ellas la app sigue con los servicios locales */
export function leerConfiguracion(
  entorno: Readonly<Record<string, string | undefined>> = variablesDelEntorno(),
): ConfiguracionSupabase | null {
  const url = entorno.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const claveAnonima = entorno.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !claveAnonima) return null;
  if (!/^https:\/\//.test(url)) return null;
  return { claveAnonima, url };
}
