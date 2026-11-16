import { Clasificador, MODELO_INTENCIONES } from '@anden/neuronal';

import type { AccionIA } from './accionesIA';
import { salidaMasBarata } from './ayudasIA';
import { boletosVigentes } from './boletosVigentes';
import { entenderPregunta, etiquetaDia, type EstadoApp } from './consultaIA';
import { RESPUESTA_VACIA, type RespuestaRica } from './conversacionIA';
import { mismoDia } from './dias';
import { FICHAS } from './fichasCiudad';
import { formatoHoraCompleta } from './formato';
import { gustosDeViaje } from './gustosDeViaje';
import { esTomable, mejorSalida } from './mejorSalida';
import { sinTildes } from './texto';
import type { Salida } from './salidas';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

/** con menos seguridad que esto la red no decide y la persona recibe un "no te entendí" en vez de una respuesta equivocada */
export const UMBRAL_DE_CONFIANZA = 0.45;

let clasificador: Clasificador | null = null;

function clasificadorDeIntenciones(): Clasificador {
  clasificador ??= new Clasificador(MODELO_INTENCIONES);
  return clasificador;
}

export interface IntencionLocal {
  etiqueta: string;
  probabilidad: number;
}

/** de qué trata la frase según la red neuronal del teléfono; nulo si no está lo bastante segura */
export function intencionLocal(pregunta: string): IntencionLocal | null {
  return clasificadorDeIntenciones().mejor(pregunta, UMBRAL_DE_CONFIANZA);
}

function respuesta(
  texto: string,
  extra: Partial<RespuestaRica> = {},
): RespuestaRica {
  return { ...RESPUESTA_VACIA, texto, ...extra };
}

/** "a Boaco " o vacío: va pegado a una frase que sigue sin destino si no se lo pidieron */
function haciaDestino(destino: string | null): string {
  return destino ? `a ${destino} ` : '';
}

function descripcion(
  salida: Salida,
  ahora: Date,
): Record<string, string | number> {
  return {
    cuando: etiquetaDia(salida.salida, ahora),
    hora: formatoHoraCompleta(salida.salida),
    libres: salida.asientosLibres,
    punto: salida.puntoEncuentro || 'por confirmar',
    servicio: t(`servicios.${salida.servicio}`),
    tarifa: salida.tarifa ?? 'sin tarifa',
  };
}

function tomables(
  estado: EstadoApp,
  destino: string | null,
  origen: string | null,
  dia: Date | null,
): Salida[] {
  return estado.salidas
    .filter(
      (s) =>
        esTomable(s, estado.ahora) &&
        (destino === null || s.destino === destino) &&
        (origen === null || s.origen === origen) &&
        (dia === null || mismoDia(s.salida, dia)),
    )
    .sort((a, b) => a.salida.getTime() - b.salida.getTime());
}

/**
 * contesta una pregunta sin ayuda de Apple Intelligence ni de Gemini: una red neuronal pequeña reconoce de qué trata y
 * la app arma la respuesta con los datos reales. Sirve en cualquier teléfono, no envía nada fuera de él y nunca inventa
 * un horario ni un precio.
 */
export function responderLocal(
  pregunta: string,
  estado: EstadoApp,
): RespuestaRica {
  const intencion = intencionLocal(pregunta);
  if (!intencion || intencion.etiqueta === 'otro')
    return respuesta(t('asistenteLocal.noEntendi'));
  const { destino, dia, origen } = entenderPregunta(
    pregunta,
    estado.ciudades,
    estado.ahora,
  );
  const texto = sinTildes(pregunta);
  const acciones: AccionIA[] = [];

  switch (intencion.etiqueta) {
    case 'saludo': {
      const nombre = estado.nombre ? `, ${estado.nombre}` : '';
      return respuesta(rellenar(t('asistenteLocal.saludo'), { nombre }));
    }
    case 'gracias':
      return respuesta(t('asistenteLocal.gracias'));
    case 'ayuda':
      return respuesta(t('asistenteLocal.ayuda'));
    case 'proximo_bus': {
      const [primera] = tomables(estado, destino, origen, dia);
      if (!primera) {
        return respuesta(
          rellenar(t('asistenteLocal.sinSalidas'), {
            destino: haciaDestino(destino),
          }),
        );
      }
      return respuesta(
        rellenar(t('asistenteLocal.proxima'), {
          ...descripcion(primera, estado.ahora),
          destino: haciaDestino(destino),
        }),
        { salidas: tomables(estado, destino, origen, dia).slice(0, 3) },
      );
    }
    case 'precio': {
      const tarifas = estado.salidas
        .filter(
          (s) =>
            (destino === null || s.destino === destino) &&
            (origen === null || s.origen === origen),
        )
        .map((s) => s.tarifa)
        .filter((tarifa): tarifa is number => tarifa !== null);
      if (tarifas.length === 0) return respuesta(t('asistenteLocal.sinPrecio'));
      const minimo = Math.min(...tarifas);
      const maximo = Math.max(...tarifas);
      return respuesta(
        rellenar(t('asistenteLocal.precio'), {
          destino: haciaDestino(destino),
          rango:
            minimo === maximo
              ? `C$ ${minimo}`
              : `desde C$ ${minimo} hasta C$ ${maximo}`,
        }),
      );
    }
    case 'asientos': {
      const [primera] = tomables(estado, destino, origen, dia);
      if (!primera) {
        return respuesta(
          rellenar(t('asistenteLocal.sinSalidas'), {
            destino: haciaDestino(destino),
          }),
        );
      }
      return respuesta(
        rellenar(t('asistenteLocal.queda'), {
          destino: haciaDestino(destino),
          hora: formatoHoraCompleta(primera.salida),
          libres: primera.asientosLibres,
        }),
        { salidas: [primera] },
      );
    }
    case 'mi_boleto': {
      const proximo = boletosVigentes(estado.boletos).find(
        ({ resumen }) =>
          new Date(resumen.salida).getTime() >=
          estado.ahora.getTime() - 4 * 3_600_000,
      );
      if (!proximo) return respuesta(t('asistenteLocal.sinBoleto'));
      const salida = new Date(proximo.resumen.salida);
      return respuesta(
        rellenar(t('asistenteLocal.boleto'), {
          asiento: proximo.boleto.asiento,
          cuando: etiquetaDia(salida, estado.ahora),
          destino: proximo.resumen.destino,
          hora: formatoHoraCompleta(salida),
          punto: proximo.resumen.puntoEncuentro || 'por confirmar',
        }),
        { mostrarBoletos: true },
      );
    }
    case 'barato': {
      const candidatas = tomables(estado, destino, origen, dia);
      if (/barat|econom|menos|bajo/.test(texto)) {
        const barata = salidaMasBarata(candidatas, estado.ahora);
        if (!barata) {
          return respuesta(
            rellenar(t('asistenteLocal.sinSalidas'), {
              destino: haciaDestino(destino),
            }),
          );
        }
        return respuesta(
          rellenar(t('asistenteLocal.barata'), {
            ...descripcion(barata, estado.ahora),
            destino: haciaDestino(destino),
          }),
          { salidas: [barata] },
        );
      }
      const mejor = mejorSalida(candidatas, {
        ahora: estado.ahora,
        gustos: gustosDeViaje(estado.boletos),
      });
      if (!mejor) {
        return respuesta(
          rellenar(t('asistenteLocal.sinSalidas'), {
            destino: haciaDestino(destino),
          }),
        );
      }
      return respuesta(
        rellenar(t('asistenteLocal.conviene'), {
          ...descripcion(mejor.salida, estado.ahora),
          motivos:
            mejor.motivos.length > 0 ? ` (${mejor.motivos.join(', ')})` : '',
        }),
        { salidas: [mejor.salida] },
      );
    }
    case 'encomienda':
      acciones.push({ pantalla: 'encomienda', tipo: 'abrir' });
      return respuesta(t('asistenteLocal.encomienda'), { acciones });
    case 'visitar': {
      const ficha =
        FICHAS.find((f) => f.ciudad === destino) ??
        FICHAS.find((f) => texto.includes(sinTildes(f.ciudad)));
      if (!ficha) return respuesta(t('asistenteLocal.visitarSinCiudad'));
      return respuesta(
        rellenar(t('asistenteLocal.visitar'), {
          ciudad: ficha.ciudad,
          lugares: ficha.lugares.join('; '),
          resumen: ficha.resumen,
        }),
        { ciudad: ficha.ciudad },
      );
    }
    case 'avisar':
      acciones.push({ minutos: 30, tipo: 'avisar' });
      return respuesta(t('asistenteLocal.avisoListo'), { acciones });
    case 'compartir':
      acciones.push({ tipo: 'compartir' });
      return respuesta(t('asistenteLocal.compartirListo'), { acciones });
    default:
      return respuesta(t('asistenteLocal.noEntendi'));
  }
}
