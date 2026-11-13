export const dinero = (n: number) => `C$ ${n.toLocaleString('es-NI')}`;
export const horaCorta = (iso: string) =>
  new Date(iso).toLocaleTimeString('es-NI', {
    hour: '2-digit',
    minute: '2-digit',
  });
export const fechaCorta = (iso: string) =>
  new Date(iso).toLocaleDateString('es-NI', { day: '2-digit', month: 'short' });
export const fechaHora = (iso: string) =>
  `${fechaCorta(iso)} · ${horaCorta(iso)}`;
export const minutosEntre = (desde: string, hasta: string) =>
  Math.round((new Date(hasta).getTime() - new Date(desde).getTime()) / 60_000);

/** hace cuánto pasó algo, en palabras cortas */
export function hace(iso: string, ahora: Date = new Date()): string {
  const min = Math.max(
    0,
    Math.round((ahora.getTime() - new Date(iso).getTime()) / 60_000),
  );
  if (min < 1) return 'ahora';
  if (min < 60) return `hace ${min} min`;
  if (min < 1440) return `hace ${Math.round(min / 60)} h`;
  return `hace ${Math.round(min / 1440)} d`;
}
