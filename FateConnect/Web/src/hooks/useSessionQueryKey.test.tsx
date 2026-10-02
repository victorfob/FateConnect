import { tokenStorage } from '@app/services/auth/tokenStorage';
import { act, renderHook } from '@app/test/testing-library';
import { tokenWithName } from '@app/test/token';

import { useSessionQueryKey } from './useSessionQueryKey';

const QUERY_NAME = 'perfil';

describe('useSessionQueryKey', () => {
  it('should change the key when somebody else signs in on the same tab', () => {
    const first = tokenWithName('Maria da Silva');
    const second = tokenWithName('Rafael Nunes');
    tokenStorage.save(first);
    const { result } = renderHook(() => useSessionQueryKey(QUERY_NAME));

    expect(result.current).toEqual({ queryKey: [QUERY_NAME, first], signedIn: true });

    act(() => tokenStorage.save(second));

    expect(result.current).toEqual({ queryKey: [QUERY_NAME, second], signedIn: true });
  });

  it('should tell that nobody is signed in once the session ends', () => {
    tokenStorage.save(tokenWithName('Maria da Silva'));
    const { result } = renderHook(() => useSessionQueryKey(QUERY_NAME));

    act(() => tokenStorage.clear());

    expect(result.current.signedIn).toBe(false);
  });
});
