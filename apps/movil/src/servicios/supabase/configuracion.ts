export interface ConfiguracionSupabase {
  claveAnonima: string;
  url: string;
}

/** las dos variables públicas del proyecto; sin ellas la app sigue con los servicios locales */
export function leerConfiguracion(
  entorno: Readonly<Record<string, string | undefined>> = process.env,
): ConfiguracionSupabase | null {
  const url = entorno.EXPO_PUBLIC_SUPABASE_URL?.trim();
  const claveAnonima = entorno.EXPO_PUBLIC_SUPABASE_ANON_KEY?.trim();
  if (!url || !claveAnonima) return null;
  if (!/^https:\/\//.test(url)) return null;
  return { claveAnonima, url };
}
