import { StyleSheet, Text, View } from 'react-native';

import { Bloque } from '@/componentes/Bloque';
import { GaleriaLugares } from '@/componentes/GaleriaLugares';
import { fichaDeCiudad } from '@/datos/fichasCiudad';
import { lugaresDeCiudad } from '@/datos/lugaresTuristicos';
import { espacios } from '@/tema/espacios';
import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { rellenar } from '@/textos/rellenar';
import { t } from '@/textos/t';

export interface PropiedadesFichaCiudadIA {
  ciudad: string;
}

/** la foto de la ciudad con los datos verificados de la app; nada de lo que escribe el modelo */
export function FichaCiudadIA({ ciudad }: PropiedadesFichaCiudadIA) {
  const { colores } = useTema();
  const ficha = fichaDeCiudad(ciudad);
  if (!ficha) return null;
  return (
    <Bloque estiloContenido={estilos.contenido} testID="ficha-ciudad-ia">
      <View style={estilos.sobreFoto}>
        <Text style={[tipografia.etiqueta, { color: colores.ambarTexto }]}>
          {t('asistenteRico.conocer')}
        </Text>
        <Text style={[tipografia.titulo, { color: colores.tinta }]}>
          {ficha.ciudad}
        </Text>
      </View>
      <GaleriaLugares lugares={lugaresDeCiudad(ficha.ciudad)} />
      <View
        accessible
        accessibilityLabel={rellenar(t('asistenteRico.ficha'), {
          ciudad: ficha.ciudad,
        })}
        style={estilos.texto}
      >
        <Text style={[tipografia.cuerpo, { color: colores.tinta }]}>
          {ficha.resumen}
        </Text>
        {ficha.lugares.map((lugar) => (
          <View key={lugar} style={estilos.lugar}>
            <View
              style={[estilos.punto, { backgroundColor: colores.ambarTexto }]}
            />
            <Text
              style={[
                tipografia.pequeno,
                estilos.textoLugar,
                { color: colores.tintaSuave },
              ]}
            >
              {lugar}
            </Text>
          </View>
        ))}
      </View>
    </Bloque>
  );
}

const estilos = StyleSheet.create({
  contenido: { padding: espacios.ocho },
  lugar: { flexDirection: 'row', gap: espacios.ocho },
  punto: { borderRadius: 3, height: 6, marginTop: 7, width: 6 },
  sobreFoto: { gap: 2, padding: espacios.ocho },
  texto: { gap: espacios.ocho, padding: espacios.doce },
  textoLugar: { flex: 1 },
});
