import { describe, expect, it } from '@jest/globals';

import { rotuloDelServicio } from './boletoDePapel';

describe('rotuloDelServicio', () => {
  it('el expreso se rotula como expreso interlocal', () => {
    expect(rotuloDelServicio('expreso')).toBe('Expreso interlocal');
  });

  it('el ordinario se rotula como ordinario interlocal', () => {
    expect(rotuloDelServicio('ordinario')).toBe('Ordinario interlocal');
  });
});
