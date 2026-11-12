let escala = 1;

/** cambia el tamaño de todas las letras; lo usa el modo de uso "sencillo" */
export function establecerEscalaTexto(nueva: number): void {
  escala = nueva;
}

export function escalaTextoActual(): number {
  return escala;
}

/** devuelve el estilo con tamaño e interlínea que se multiplican por la escala vigente al leerlos */
function escalable<T extends { fontSize: number; lineHeight: number }>(
  base: T,
): T {
  const copia = { ...base };
  Object.defineProperty(copia, 'fontSize', {
    enumerable: true,
    get: () => Math.round(base.fontSize * escala),
  });
  Object.defineProperty(copia, 'lineHeight', {
    enumerable: true,
    get: () => Math.round(base.lineHeight * escala),
  });
  return copia;
}

export const tipografia = {
  casillaBoleto: escalable({
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 22,
    lineHeight: 26,
  }),
  codigoBoleto: escalable({
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 26,
    letterSpacing: 1.5,
    lineHeight: 30,
  }),
  iniciales: escalable({
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 44,
    lineHeight: 48,
  }),
  lema: escalable({
    fontFamily: 'Archivo_400Regular',
    fontSize: 19,
    lineHeight: 26,
  }),
  nombreFila: escalable({
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 18,
    lineHeight: 22,
  }),
  nombreLinea: escalable({
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 16,
    lineHeight: 20,
  }),
  nombrePerfil: escalable({
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 34,
    lineHeight: 36,
  }),
  sello: escalable({
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 22,
    letterSpacing: 2,
    lineHeight: 28,
  }),
  titularBoleto: escalable({
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 52,
    lineHeight: 54,
  }),
  titularPantalla: escalable({
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 46,
    lineHeight: 48,
  }),
  titularProximo: escalable({
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 42,
    lineHeight: 44,
  }),
  titularResumen: escalable({
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 32,
    lineHeight: 34,
  }),
  cuerpo: escalable({
    fontFamily: 'Archivo_400Regular',
    fontSize: 16,
    lineHeight: 24,
  }),
  dato: escalable({
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 15,
    lineHeight: 20,
  }),
  datoGrande: escalable({
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 28,
    lineHeight: 32,
  }),
  display: escalable({
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 56,
    lineHeight: 52,
  }),
  etiqueta: escalable({
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 0.88,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
  }),
  pequeno: escalable({
    fontFamily: 'Archivo_500Medium',
    fontSize: 13,
    lineHeight: 18,
  }),
  subtitulo: escalable({
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
  }),
  tableroDestino: escalable({
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 24,
    lineHeight: 24,
  }),
  tableroHora: escalable({
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 17,
    lineHeight: 20,
  }),
  titulo: escalable({
    fontFamily: 'ArchivoCondensed_700Bold',
    fontSize: 34,
    lineHeight: 36,
  }),
};
