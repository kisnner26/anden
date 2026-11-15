import { Image } from 'expo-image';
import { useState } from 'react';
import { Pressable, StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import type { ObjetoPerdido } from '@/servicios/supabase/objetosPerdidosSupabase';
import { conAlfa } from '@/tema/alfa';
import { espacios, radios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

export interface PropiedadesObjetosDelViaje {
  alReclamar: (objetoId: string) => Promise<boolean>;
  objetos: readonly ObjetoPerdido[];
}

/** lo que el chofer encontró en el bus de este viaje, con su foto, y un botón "Es mío" para el primero que lo reconozca */
export function ObjetosDelViaje({
  alReclamar,
  objetos,
}: PropiedadesObjetosDelViaje) {
  const { colores } = useTema();
  const [fallo, establecerFallo] = useState<string | null>(null);
  if (objetos.length === 0) return null;

  async function reclamar(id: string) {
    establecerFallo(null);
    if (!(await alReclamar(id))) establecerFallo(id);
  }

  return (
    <Bloque estiloContenido={estilos.contenido} testID="objetos-del-viaje">
      <Text style={[tipografia.subtitulo, { color: colores.tinta }]}>
        {t('objetosEncontrados.encontrados')}
      </Text>
      {objetos.map((objeto) => (
        <View key={objeto.id} style={estilos.fila}>
          {objeto.foto_url ? (
            <Image
              accessibilityLabel={objeto.descripcion}
              contentFit="cover"
              source={{ uri: objeto.foto_url }}
              style={estilos.miniatura}
            />
          ) : null}
          <View style={estilos.texto}>
            <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
              {objeto.descripcion}
            </Text>
            {objeto.reclamado_en ? (
              <Text style={[tipografia.pequeno, { color: colores.aTiempo }]}>
                {t('objetosEncontrados.yaReclamado')}
              </Text>
            ) : (
              <Pressable
                accessibilityRole="button"
                onPress={() => void reclamar(objeto.id)}
                style={[
                  estilos.reclamar,
                  { borderColor: conAlfa(colores.tinta, 0.2) },
                ]}
              >
                <Text
                  style={[tipografia.etiqueta, { color: colores.ambarTexto }]}
                >
                  {t('objetosEncontrados.esMio')}
                </Text>
              </Pressable>
            )}
            {fallo === objeto.id ? (
              <Text style={[tipografia.pequeno, { color: colores.cancelado }]}>
                {t('objetosEncontrados.noSePudo')}
              </Text>
            ) : null}
          </View>
        </View>
      ))}
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  contenido: { gap: espacios.doce, padding: espacios.dieciseis },
  fila: { flexDirection: 'row', gap: espacios.doce },
  miniatura: { borderRadius: radios.loseta, height: 72, width: 72 },
  reclamar: {
    alignSelf: 'flex-start',
    borderRadius: radios.pildora,
    borderWidth: 1,
    paddingHorizontal: espacios.doce,
    paddingVertical: espacios.ocho,
  },
  texto: { flex: 1, gap: espacios.ocho },
});
