import {
  ciudadesConFotos,
  fotosDeCiudad,
  type FotoDeCiudad,
} from './fotosDestino';

export interface LugarTuristico extends FotoDeCiudad {
  ciudad: string;
}

const NOMBRE: Readonly<Record<string, string>> = {
  boaco: 'Boaco',
  juigalpa: 'Juigalpa',
  managua: 'Managua',
};

function sinTildes(texto: string): string {
  return texto.normalize('NFD').replace(/[̀-ͯ]/g, '').toLowerCase();
}

/** la persona quiere ver o conocer lugares, no solo saber de buses */
const PIDE_LUGARES =
  /\b(foto|fotos|imagen|imagenes|lugar|lugares|sitio|sitios|turistic\w*|turismo|turista|visitar|conocer|que ver|que hacer|atractivo\w*|paseo|pasear)\b/;

/** con una ciudad nombrada alcanza con pedir verla */
const PIDE_VER = /\b(ver|mostrar|mostra|mostrame|muestra|muestrame|ensename)\b/;

export function lugaresDeCiudad(ciudad: string): LugarTuristico[] {
  const nombre = NOMBRE[sinTildes(ciudad)] ?? ciudad;
  return fotosDeCiudad(ciudad).map((foto) => ({ ...foto, ciudad: nombre }));
}

/**
 * los lugares con foto que corresponden a lo que pide la persona: con una ciudad, sus lugares (los que coinciden
 * con lo que nombra primero, por ejemplo "mirador" o "iglesia"); sin ciudad, uno por cada ciudad. Si no pide
 * lugares o fotos, ninguno.
 */
export function lugaresParaPregunta(pregunta: string): LugarTuristico[] {
  const texto = sinTildes(pregunta);
  const ciudades = ciudadesConFotos().filter((c) => texto.includes(c));
  if (
    !PIDE_LUGARES.test(texto) &&
    !(ciudades.length > 0 && PIDE_VER.test(texto))
  )
    return [];
  if (ciudades.length === 0) {
    return ciudadesConFotos().flatMap((c) => lugaresDeCiudad(c).slice(0, 1));
  }
  return ciudades.flatMap((c) => {
    const todos = lugaresDeCiudad(c);
    const coinciden = todos.filter((l) =>
      l.etiquetas.some((e) => texto.includes(e)),
    );
    // los que nombra primero, seguidos del resto de la ciudad
    return [...coinciden, ...todos.filter((l) => !coinciden.includes(l))];
  });
}

/** los lugares con foto en palabras, para que el modelo los describa sin inventar otros */
export function hechosDeLugares(lugares: readonly LugarTuristico[]): string[] {
  if (lugares.length === 0) return [];
  return [
    'Lugares con foto que la app le muestra a la persona debajo de tu respuesta (mencionalos, no agregues otros):',
    ...lugares.map((l) => `${l.ciudad}: ${l.titulo}. ${l.descripcion}`),
  ];
}
