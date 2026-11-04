export interface CorredorInterlocal {
  destino: 'Boaco' | 'Juigalpa' | 'Managua';
  id: 'cor_boa_man' | 'cor_jui_man' | 'cor_man_boa' | 'cor_man_jui';
  origen: 'Boaco' | 'Juigalpa' | 'Managua';
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
    destino: 'Boaco',
    id: 'cor_man_boa',
    origen: 'Managua',
  },
  {
    destino: 'Juigalpa',
    id: 'cor_man_jui',
    origen: 'Managua',
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
  cor_man_boa: {
    estado: 'proxima',
    etaMinutos: 16,
    proximaSalida: '6:35 a. m.',
  },
  cor_man_jui: {
    estado: 'proxima',
    etaMinutos: 24,
    proximaSalida: '6:43 a. m.',
  },
};
