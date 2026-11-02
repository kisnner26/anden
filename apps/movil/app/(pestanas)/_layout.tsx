import { Tabs } from 'expo-router';

import { BarraPestanas, type Pestana } from '@/componentes/BarraPestanas';
import { t } from '@/textos/t';

const PESTANAS: readonly Pestana[] = [
  { clave: 'viajar', icono: 'pestanaViajar', nombre: t('pestanas.viajar') },
  {
    clave: 'horarios',
    icono: 'pestanaHorarios',
    nombre: t('pestanas.horarios'),
  },
  { clave: 'rutas', icono: 'pestanaRutas', nombre: t('pestanas.rutas') },
  { clave: 'boletos', icono: 'pestanaBoletos', nombre: t('pestanas.boletos') },
];

interface PropiedadesBarra {
  navigateToTab: (claveRuta: string) => void;
  state: { index: number; routes: readonly { key: string; name: string }[] };
}

function Barra({ navigateToTab, state }: PropiedadesBarra) {
  const activa = state.routes[state.index]?.name ?? 'viajar';
  return (
    <BarraPestanas
      activa={activa}
      alSeleccionar={(clave) => {
        const ruta = state.routes.find((candidata) => candidata.name === clave);
        if (ruta) navigateToTab(ruta.key);
      }}
      pestanas={PESTANAS}
    />
  );
}

export default function DisenoPestanas() {
  return (
    <Tabs
      screenOptions={{ headerShown: false }}
      tabBar={(propiedades) => <Barra {...propiedades} />}
    >
      <Tabs.Screen name="viajar" />
      <Tabs.Screen name="horarios" />
      <Tabs.Screen name="rutas" />
      <Tabs.Screen name="boletos" />
    </Tabs>
  );
}
