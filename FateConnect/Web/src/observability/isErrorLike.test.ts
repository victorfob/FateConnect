import { isErrorLike } from './isErrorLike';

describe('isErrorLike', () => {
  it('should accept a native error', () => {
    expect(isErrorLike(new Error('falha'))).toBe(true);
  });

  it('should accept an error from another realm, which fails instanceof', () => {
    const foreignError = { message: 'falha', stack: 'em outro realm' };

    expect(foreignError instanceof Error).toBe(false);
    expect(isErrorLike(foreignError)).toBe(true);
  });

  it('should refuse what cannot carry a stacktrace', () => {
    expect(isErrorLike('falha')).toBe(false);
    expect(isErrorLike(null)).toBe(false);
    expect(isErrorLike({ message: 'sem stack' })).toBe(false);
  });
});
