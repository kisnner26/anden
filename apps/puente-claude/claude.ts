import { spawn } from 'node:child_process';

export interface PedidoAClaude {
  instrucciones: string;
  pregunta: string;
}

export const LARGO_MAXIMO_INSTRUCCIONES = 12_000;
export const LARGO_MAXIMO_PREGUNTA = 600;
export const ESPERA_MAXIMA_MS = 90_000;

/** valida lo que manda la app: textos con largo razonable y nada más */
export function validarPedido(crudo: unknown): PedidoAClaude | null {
  if (typeof crudo !== 'object' || crudo === null) return null;
  const { instrucciones, pregunta } = crudo as Record<string, unknown>;
  if (typeof instrucciones !== 'string' || typeof pregunta !== 'string')
    return null;
  if (pregunta.trim().length < 1 || pregunta.length > LARGO_MAXIMO_PREGUNTA)
    return null;
  if (instrucciones.length > LARGO_MAXIMO_INSTRUCCIONES) return null;
  return { instrucciones, pregunta: pregunta.trim() };
}

/** los argumentos de `claude`: sin herramientas, sin guardar sesión y con las reglas del asistente como instrucciones del sistema */
export function argumentosDeClaude(
  { instrucciones, pregunta }: PedidoAClaude,
  modelo?: string,
): string[] {
  return [
    '-p',
    pregunta,
    '--tools',
    '',
    '--no-session-persistence',
    '--output-format',
    'text',
    ...(instrucciones ? ['--system-prompt', instrucciones] : []),
    ...(modelo ? ['--model', modelo] : []),
  ];
}

/** le pregunta a Claude Code con la suscripción de quien corre el puente; falla con un mensaje corto si no responde */
export function preguntarAClaude(
  pedido: PedidoAClaude,
  comando = 'claude',
  modelo = process.env.PUENTE_MODELO,
): Promise<string> {
  return new Promise((resolver, rechazar) => {
    const hijo = spawn(comando, argumentosDeClaude(pedido, modelo), {
      stdio: ['ignore', 'pipe', 'pipe'],
    });
    let salida = '';
    let error = '';
    const reloj = setTimeout(() => {
      hijo.kill('SIGKILL');
      rechazar(new Error('Claude tardó demasiado en responder.'));
    }, ESPERA_MAXIMA_MS);
    hijo.stdout.on('data', (d: Buffer) => {
      salida += d.toString();
      if (salida.length > 20_000) hijo.kill('SIGKILL');
    });
    hijo.stderr.on('data', (d: Buffer) => {
      error += d.toString();
    });
    hijo.on('error', () => {
      clearTimeout(reloj);
      rechazar(new Error('No encuentro Claude Code en esta Mac.'));
    });
    hijo.on('close', (codigo) => {
      clearTimeout(reloj);
      const texto = salida.trim();
      if (codigo === 0 && texto !== '') resolver(texto);
      else
        rechazar(
          new Error(
            error.includes('login') || error.includes('auth')
              ? 'Claude Code no tiene la sesión iniciada en esta Mac.'
              : 'Claude no pudo responder.',
          ),
        );
    });
  });
}
