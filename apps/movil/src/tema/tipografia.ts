export const tipografia = {
  cuerpo: {
    fontFamily: 'Archivo_400Regular',
    fontSize: 16,
    lineHeight: 24,
  },
  dato: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 15,
    lineHeight: 20,
  },
  datoGrande: {
    fontFamily: 'JetBrainsMono_600SemiBold',
    fontSize: 28,
    lineHeight: 32,
  },
  display: {
    fontFamily: 'ArchivoExtraCondensed_800ExtraBold',
    fontSize: 56,
    lineHeight: 52,
  },
  etiqueta: {
    fontFamily: 'JetBrainsMono_500Medium',
    fontSize: 11,
    letterSpacing: 0.88,
    lineHeight: 14,
    textTransform: 'uppercase' as const,
  },
  pequeno: {
    fontFamily: 'Archivo_500Medium',
    fontSize: 13,
    lineHeight: 18,
  },
  subtitulo: {
    fontFamily: 'Archivo_600SemiBold',
    fontSize: 20,
    lineHeight: 26,
  },
  titulo: {
    fontFamily: 'ArchivoCondensed_700Bold',
    fontSize: 34,
    lineHeight: 36,
  },
} as const;
