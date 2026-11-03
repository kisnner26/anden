export interface CorredorInterlocal {
  destino: 'Managua';
  id: 'cor_wac_man' | 'cor_cha_man';
  origen: 'Wácwala' | 'Chagüilpa';
}

export const CORREDORES_INICIALES: readonly CorredorInterlocal[] = [
  { destino: 'Managua', id: 'cor_wac_man', origen: 'Wácwala' },
  { destino: 'Managua', id: 'cor_cha_man', origen: 'Chagüilpa' },
];
