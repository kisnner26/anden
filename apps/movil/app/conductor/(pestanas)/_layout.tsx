import { NativeTabs } from 'expo-router/native-tabs';

import { tipografia } from '@/tema/tipografia';
import { useTema } from '@/tema/useTema';
import { t } from '@/textos/t';

/** pestañas del conductor: sus viajes y sus ajustes */
export default function DisenoPestanasConductor() {
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
      <NativeTabs.Trigger name="index">
        <NativeTabs.Trigger.Label>
          {t('conductorAjustes.pestanaViajes')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="bus.fill" />
      </NativeTabs.Trigger>
      <NativeTabs.Trigger name="ajustes">
        <NativeTabs.Trigger.Label>
          {t('conductorAjustes.pestanaAjustes')}
        </NativeTabs.Trigger.Label>
        <NativeTabs.Trigger.Icon sf="gearshape.fill" />
      </NativeTabs.Trigger>
    </NativeTabs>
  );
}
