import { formatCLP } from './format';

describe('formatCLP', () => {
  it('antepone el signo $ al valor', () => {
    expect(formatCLP(0)).toBe('$0');
    expect(formatCLP(900000).startsWith('$')).toBeTrue();
  });

  it('separa los miles', () => {
    expect(formatCLP(900000)).toMatch(/^\$900.000$/);
  });
});
