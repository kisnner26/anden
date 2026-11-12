jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// audio simulado: el módulo nativo de expo-audio no existe en jest
jest.mock('expo-audio', () => ({
  createAudioPlayer: jest.fn(() => ({
    play: jest.fn(),
    remove: jest.fn(),
    seekTo: jest.fn(async () => undefined),
  })),
  setAudioModeAsync: jest.fn(async () => undefined),
}));

// reanimated simulado a mano: el mock oficial arranca el módulo nativo y falla en jest
jest.mock('react-native-reanimated', () => {
  const { Text, View } = require('react-native');
  return {
    __esModule: true,
    default: { Text, View },
    cancelAnimation: jest.fn(),
    Easing: {
      bezier: () => (valor) => valor,
      cubic: (valor) => valor,
      in: (curva) => curva,
      out: (curva) => curva,
      quad: (valor) => valor,
    },
    interpolate: (valor, entrada, salida) => salida[valor > entrada[0] ? 1 : 0],
    useAnimatedStyle: (estilo) => estilo(),
    useReducedMotion: jest.fn(() => false),
    useSharedValue: (valor) => ({ value: valor }),
    withDelay: jest.fn((_demora, valor) => valor),
    withRepeat: jest.fn((valor) => valor),
    withSequence: jest.fn((...valores) => valores[valores.length - 1]),
    withSpring: jest.fn((valor) => valor),
    withTiming: jest.fn((valor) => valor),
  };
});
