jest.mock('@react-native-async-storage/async-storage', () =>
  require('@react-native-async-storage/async-storage/jest/async-storage-mock'),
);

// reanimated simulado a mano: el mock oficial arranca el módulo nativo y falla en jest
jest.mock('react-native-reanimated', () => {
  const { Text, View } = require('react-native');
  return {
    __esModule: true,
    default: { Text, View },
    useAnimatedStyle: (estilo) => estilo(),
    useReducedMotion: jest.fn(() => false),
    useSharedValue: (valor) => ({ value: valor }),
    withTiming: (valor) => valor,
  };
});
