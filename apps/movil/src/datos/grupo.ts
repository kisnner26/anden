import { asientosDe, type ConfiguracionBus } from '@anden/dominio';

import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

/** el enlace que se manda a los amigos: abre el grupo dentro de Andén */
export function enlaceDeGrupo(codigo: string): string {
  return `anden://grupo/${codigo.trim().toUpperCase()}`;
}

/** el mensaje que acompaña al enlace cuando se comparte el grupo */
export function mensajeDeGrupo(datos: {
  codigo: string;
  cupo: number;
  destino: string;
  hora: string;
}): string {
  return rellenar(t('grupo.mensaje'), {
    cupo: datos.cupo,
    destino: datos.destino,
    enlace: enlaceDeGrupo(datos.codigo),
    hora: datos.hora,
  });
}

/**
 * los asientos libres que quedan pegados a los que ya eligieron los del grupo: el de al lado en la misma fila, sin cruzar
 * el pasillo, o el de adelante y el de atrás. Los más pegados primero; sin asientos del grupo no hay sugerencia
 */
export function asientosJuntos(
  configuracion: ConfiguracionBus,
  libres: ReadonlySet<number>,
  delGrupo: readonly number[],
): number[] {
  if (delGrupo.length === 0) return [];
  const todos = asientosDe(configuracion);
  const delGrupoEnPlano = todos.filter((a) => delGrupo.includes(a.numero));
  const sugeridos = new Map<number, number>();
  for (const candidato of todos) {
    if (!libres.has(candidato.numero) || delGrupo.includes(candidato.numero)) {
      continue;
    }
    for (const amigo of delGrupoEnPlano) {
      const dFila = Math.abs(candidato.fila - amigo.fila);
      const dColumna = Math.abs(candidato.columna - amigo.columna);
      const alLado = dFila === 0 && dColumna === 1;
      const enFila = dColumna === 0 && dFila === 1;
      if (alLado || enFila) {
        // al lado pesa más que adelante o atrás
        const peso = alLado ? 1 : 2;
        sugeridos.set(
          candidato.numero,
          Math.min(sugeridos.get(candidato.numero) ?? 9, peso),
        );
      }
    }
  }
  return [...sugeridos.entries()]
    .sort((a, b) => a[1] - b[1] || a[0] - b[0])
    .map(([numero]) => numero);
}
