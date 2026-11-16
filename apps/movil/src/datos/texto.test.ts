import { describe, expect, it } from '@jest/globals';

import { sinTildes } from './texto';

describe('sinTildes', () => {
  it('quita las tildes', () => {
    expect(sinTildes('León')).toBe('leon');
  });
});
