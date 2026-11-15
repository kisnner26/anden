import { describe, expect, it } from '@jest/globals';

import { esMotivoCancelacion } from './motivoCancelacion';

describe('esMotivoCancelacion', () => {
  it('acepta los motivos conocidos', () => {
    expect(esMotivoCancelacion('averia')).toBe(true);
    expect(esMotivoCancelacion('otro')).toBe(true);
  });
  it('rechaza lo demás', () => {
    expect(esMotivoCancelacion('porque si')).toBe(false);
    expect(esMotivoCancelacion(null)).toBe(false);
  });
});
