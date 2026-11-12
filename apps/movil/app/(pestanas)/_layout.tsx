import { NativeTabs } from 'expo-router/native-tabs';

import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

/** barra nativa de iOS: Liquid Glass del sistema, pegada al borde inferior */
export default function DisenoPestanas() {
  const { colores } = useTema();

  return (
    <NativeTabs
      iconColor={colores.tintaSuave}
      labelStyle={{
        color: colores.tintaSuave,
        fontFamily: tipografia.pequeno.fontFamily,
        fontSize: tipografia.pequeno.fontSize,
      }}
      tintColor={colores.ambar}
    >
      <NativeTabs.Trigger name="viajar">
        <NativeTabs.Trigger.Label>
          {t('pestanas.viajar')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bus.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="horarios">
        <NativeTabs.Trigger.Label>
          {t('pestanas.horarios')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="clock.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="rutas">
        <NativeTabs.Trigger.Label>
          {t('pestanas.rutas')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="map.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="boletos">
        <NativeTabs.Trigger.Label>
          {t('pestanas.boletos')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="ticket.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
