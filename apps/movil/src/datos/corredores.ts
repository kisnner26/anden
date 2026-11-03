export interface CorredorInterlocal {
  destino: 'Managua';
  id: 'cor_boa_man' | 'cor_jui_man';
  origen: 'Boaco' | 'Juigalpa';
}

export interface OperacionCorredorMuestra {
  estado: 'proxima' | 'sin_servicio';
  etaMinutos: number | null;
  proximaSalida: string | null;
}

export const CORREDORES_INICIALES: readonly CorredorInterlocal[] = [
  {
    destino: 'Managua',
    id: 'cor_boa_man',
    origen: 'Boaco',
  },
  {
    destino: 'Managua',
    id: 'cor_jui_man',
    origen: 'Juigalpa',
  },
];

export const OPERACION_MUESTRA_POR_CORREDOR: Readonly<
  Record<CorredorInterlocal['id'], OperacionCorredorMuestra>
> = {
  cor_boa_man: {
    estado: 'proxima',
    etaMinutos: 18,
    proximaSalida: '6:30 a. m.',
  },
  cor_jui_man: {
    estado: 'sin_servicio',
    etaMinutos: null,
    proximaSalida: null,
  },
};
