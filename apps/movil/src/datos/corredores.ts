export interface CorredorInterlocal {
  destino: 'Managua';
  id: 'cor_wac_man' | 'cor_cha_man';
  origen: 'Wácwala' | 'Chagüilpa';
}

export interface OperacionCorredorMuestra {
  estado: 'proxima' | 'sin_servicio';
  etaMinutos: number | null;
  proximaSalida: string | null;
}

export const CORREDORES_INICIALES: readonly CorredorInterlocal[] = [
  {
    destino: 'Managua',
    id: 'cor_wac_man',
    origen: 'Wácwala',
  },
  {
    destino: 'Managua',
    id: 'cor_cha_man',
    origen: 'Chagüilpa',
  },
];

export const OPERACION_MUESTRA_POR_CORREDOR: Readonly<
  Record<CorredorInterlocal['id'], OperacionCorredorMuestra>
> = {
  cor_wac_man: {
    estado: 'proxima',
    etaMinutos: 18,
    proximaSalida: '6:30 a. m.',
  },
  cor_cha_man: {
    estado: 'sin_servicio',
    etaMinutos: null,
    proximaSalida: null,
  },
};
